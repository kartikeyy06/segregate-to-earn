import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, runQuery, getQuery, allQuery } from './database.js';
import { seedDemoData } from './seed.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase().then(async () => {
  console.log('Database initialized');

  // Seed demo data on first run
  const count = await getQuery("SELECT COUNT(*) as count FROM waste_deposits");
  if (count.count === 0) {
    await seedDemoData();
    console.log('Demo data seeded');
  }
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// API Routes

// Get dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalWaste = await getQuery("SELECT SUM(weight) as total FROM waste_deposits") || { total: 0 };
    const verifiedWaste = await getQuery(`
      SELECT SUM(w.weight) as total
      FROM waste_deposits w
      JOIN verification_records v ON w.id = v.deposit_id
      WHERE v.verification_status = 'verified'
    `) || { total: 0 };

    const verifications = await getQuery("SELECT COUNT(*) as count FROM verification_records WHERE verification_status = 'verified'") || { count: 0 };

    const totalTokens = await getQuery("SELECT SUM(amount) as total FROM token_transactions WHERE type = 'reward' AND status = 'completed'") || { total: 0 };

    const totalDeposits = await getQuery("SELECT COUNT(*) as count FROM waste_deposits") || { count: 0 };
    const correctDeposits = await getQuery(`
      SELECT COUNT(*) as count
      FROM waste_deposits w
      JOIN verification_records v ON w.id = v.deposit_id
      WHERE v.is_correctly_segregated = 1
    `) || { count: 0 };

    const accuracy = totalDeposits.count > 0 ? Math.round((correctDeposits.count / totalDeposits.count) * 100) : 0;

    res.json({
      totalWaste: totalWaste.total || 0,
      correctlySegregated: verifiedWaste.total || 0,
      successfulVerifications: verifications.count || 0,
      totalTokens: totalTokens.total || 0,
      segregationAccuracy: accuracy
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get waste category distribution
app.get('/api/dashboard/category-distribution', async (req, res) => {
  try {
    const distribution = await allQuery(`
      SELECT category, SUM(weight) as total_weight, COUNT(*) as count
      FROM waste_deposits
      GROUP BY category
    `);
    res.json(distribution || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily waste collection
app.get('/api/dashboard/daily-collection', async (req, res) => {
  try {
    const daily = await allQuery(`
      SELECT date(created_at) as date, SUM(weight) as total_weight
      FROM waste_deposits
      GROUP BY date(created_at)
      ORDER BY date DESC
      LIMIT 7
    `);
    res.json(daily || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent deposits
app.get('/api/dashboard/recent-deposits', async (req, res) => {
  try {
    const deposits = await allQuery(`
      SELECT
        w.id, w.category, w.subcategory, w.weight, w.status, w.created_at,
        u.name as user_name,
        v.verification_status,
        v.is_correctly_segregated
      FROM waste_deposits w
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN verification_records v ON w.id = v.deposit_id
      ORDER BY w.created_at DESC
      LIMIT 10
    `);
    res.json(deposits || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Waste classification endpoint
app.post('/api/waste/classify', async (req, res) => {
  try {
    const { imageData, manualCategory } = req.body;

    // Simulated AI classification - would connect to actual ML model
    // For demo, use manual category if provided, otherwise use simple logic
    let predictedCategory = manualCategory;
    let confidence = 0.85; // Demo confidence score
    let explanation = "Demo classification - real AI model would analyze image.";

    if (!manualCategory && imageData) {
      // Simulate classification based on some image property
      // In a real app, this would call an ML API
      const categories = ['Organic', 'Recyclable', 'Hazardous'];
      const randomIndex = Math.floor(Math.random() * categories.length);
      predictedCategory = categories[randomIndex];
      explanation = "Demo classification: Random selection (no real AI configured).";
    }

    res.json({
      predictedCategory,
      confidence,
      explanation,
      isDemo: !manualCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register waste deposit
app.post('/api/deposits/register', async (req, res) => {
  try {
    const {
      userId = 'demo-user-1', // Default demo user
      binId,
      category,
      subcategory,
      weight,
      imageUrl,
      predictedCategory,
      notes
    } = req.body;

    // Validate required fields
    if (!binId || !category || !weight) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (weight <= 0) {
      return res.status(400).json({ error: 'Weight must be positive' });
    }

    const depositId = uuidv4();
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO waste_deposits (
        id, user_id, bin_id, category, subcategory, weight,
        image_url, predicted_category, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [depositId, userId, binId, category, subcategory, weight,
       imageUrl, predictedCategory, notes, now, now]
    );

    // Create verification record
    await runQuery(
      `INSERT INTO verification_records (
        id, deposit_id, verification_status, created_at
      ) VALUES (?, ?, 'pending', ?)`,
      [uuidv4(), depositId, now]
    );

    // Log audit
    await runQuery(
      `INSERT INTO audit_logs (
        id, action, target_type, target_id, user_id, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'deposit_created', 'deposit', depositId, userId,
       `Registered ${weight}kg of ${category}`, now]
    );

    res.json({
      success: true,
      depositId,
      message: 'Deposit registered successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verification endpoints
app.get('/api/verification/pending', async (req, res) => {
  try {
    const pending = await allQuery(`
      SELECT
        w.id, w.category, w.subcategory, w.weight, w.created_at,
        u.name as user_name, b.bin_id
      FROM waste_deposits w
      JOIN users u ON w.user_id = u.id
      JOIN waste_bins b ON w.bin_id = b.id
      WHERE w.status = 'pending'
      ORDER BY w.created_at ASC
    `);
    res.json(pending || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verification/:depositId/verify', async (req, res) => {
  try {
    const { depositId } = req.params;
    const { verifiedBy, isCorrectlySegregated, notes } = req.body;

    const deposit = await getQuery(
      `SELECT category, bin_id FROM waste_deposits WHERE id = ?`,
      [depositId]
    );

    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    const bin = await getQuery(
      `SELECT category FROM waste_bins WHERE id = ?`,
      [deposit.bin_id]
    );

    const verificationStatus = isCorrectlySegregated ? 'verified' : 'rejected';
    const now = new Date().toISOString();

    await runQuery(
      `UPDATE verification_records
       SET verified_by = ?, verification_status = ?,
           is_correctly_segregated = ?, notes = ?, verified_at = ?
       WHERE deposit_id = ?`,
      [verifiedBy, verificationStatus, isCorrectlySegregated ? 1 : 0,
       notes, now, depositId]
    );

    await runQuery(
      `UPDATE waste_deposits SET status = ?, updated_at = ? WHERE id = ?`,
      [verificationStatus, now, depositId]
    );

    // Award tokens for successful verification
    if (isCorrectlySegregated) {
      const tokenAmount = 5; // Demo reward amount
      await runQuery(
        `INSERT INTO token_transactions (
          id, user_id, deposit_id, amount, type, status, created_at
        ) VALUES (?, ?, ?, ?, 'reward', 'completed', ?)`,
        [uuidv4(), 'demo-user-1', depositId, tokenAmount, now]
      );
    }

    // Log audit
    await runQuery(
      `INSERT INTO audit_logs (
        id, action, target_type, target_id, user_id, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'deposit_verified', 'deposit', depositId, verifiedBy,
       `Deposit ${verificationStatus}: ${notes || ''}`, now]
    );

    res.json({
      success: true,
      message: `Deposit ${verificationStatus}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Token wallet endpoints
app.get('/api/wallet/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;

    const earned = await getQuery(
      `SELECT SUM(amount) as total FROM token_transactions
       WHERE user_id = ? AND type = 'reward' AND status = 'completed'`,
      [userId]
    );

    const redeemed = await getQuery(
      `SELECT SUM(amount) as total FROM token_transactions
       WHERE user_id = ? AND type = 'redeem' AND status = 'completed'`,
      [userId]
    );

    const balance = (earned?.total || 0) - (redeemed?.total || 0);
    const transactions = await allQuery(
      `SELECT * FROM token_transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    res.json({
      balance: balance >= 0 ? balance : 0,
      totalEarned: earned?.total || 0,
      totalRedeemed: redeemed?.total || 0,
      transactions: transactions || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/wallet/:userId/redeem', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, rewardType } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Check balance
    const balanceResult = await getQuery(
      `SELECT
        (SELECT COALESCE(SUM(amount), 0) FROM token_transactions
         WHERE user_id = ? AND type = 'reward' AND status = 'completed') -
        (SELECT COALESCE(SUM(amount), 0) FROM token_transactions
         WHERE user_id = ? AND type = 'redeem' AND status = 'completed') as balance`,
      [userId, userId]
    );

    const balance = balanceResult?.balance || 0;

    if (balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO token_transactions (
        id, user_id, amount, type, status, created_at
      ) VALUES (?, ?, ?, 'redeem', 'completed', ?)`,
      [uuidv4(), userId, amount, now]
    );

    // Log audit
    await runQuery(
      `INSERT INTO audit_logs (
        id, action, target_type, target_id, user_id, details, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'tokens_redeemed', 'wallet', userId, userId,
       `Redeemed ${amount} tokens for ${rewardType || 'demo reward'}`, now]
    );

    res.json({
      success: true,
      message: `Successfully redeemed ${amount} tokens`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bins and QR codes
app.get('/api/bins', async (req, res) => {
  try {
    const bins = await allQuery(`SELECT * FROM waste_bins ORDER BY created_at DESC`);
    res.json(bins || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin endpoints
app.get('/api/admin/deposits', async (req, res) => {
  try {
    const { status, category, startDate, endDate } = req.query;

    let query = `
      SELECT
        w.*,
        u.name as user_name,
        b.bin_id,
        v.verification_status,
        v.is_correctly_segregated,
        v.verified_at
      FROM waste_deposits w
      LEFT JOIN users u ON w.user_id = u.id
      LEFT JOIN waste_bins b ON w.bin_id = b.id
      LEFT JOIN verification_records v ON w.id = v.deposit_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND w.status = ?`;
      params.push(status);
    }

    if (category) {
      query += ` AND w.category = ?`;
      params.push(category);
    }

    if (startDate) {
      query += ` AND date(w.created_at) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date(w.created_at) <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY w.created_at DESC`;

    const deposits = await allQuery(query, params);
    res.json(deposits || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoints
app.get('/api/analytics/segregation', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        category,
        COUNT(*) as total_deposits,
        SUM(CASE WHEN v.is_correctly_segregated = 1 THEN 1 ELSE 0 END) as correct_count,
        SUM(weight) as total_weight,
        AVG(v.is_correctly_segregated) * 100 as accuracy_rate
      FROM waste_deposits w
      LEFT JOIN verification_records v ON w.id = v.deposit_id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) {
      query += ` AND date(w.created_at) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date(w.created_at) <= ?`;
      params.push(endDate);
    }

    query += ` GROUP BY category ORDER BY total_deposits DESC`;

    const analytics = await allQuery(query, params);
    res.json(analytics || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data endpoint
app.get('/api/export/:dataType', async (req, res) => {
  try {
    const { dataType } = req.params;

    let query, filename;

    switch (dataType) {
      case 'deposits':
        query = `SELECT * FROM waste_deposits ORDER BY created_at DESC`;
        filename = 'deposits.csv';
        break;
      case 'transactions':
        query = `SELECT * FROM token_transactions ORDER BY created_at DESC`;
        filename = 'transactions.csv';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    const data = await allQuery(query);

    // Convert to CSV
    const csv = data.length > 0
      ? objectToCSV(data)
      : 'No data to export';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demo data reset endpoint
app.post('/api/demo/reset', async (req, res) => {
  try {
    // Clear tables
    await runQuery('DELETE FROM waste_deposits');
    await runQuery('DELETE FROM verification_records');
    await runQuery('DELETE FROM token_transactions');
    await runQuery('DELETE FROM audit_logs');

    // Re-seed
    await seedDemoData();

    res.json({ success: true, message: 'Demo data reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to convert objects to CSV
function objectToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return value === null || value === undefined ? '' : JSON.stringify(value);
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
