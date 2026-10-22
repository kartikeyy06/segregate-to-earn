import { v4 as uuidv4 } from 'uuid';
import { runQuery } from './database.js';

export async function seedDemoData() {
  const now = new Date().toISOString();

  // Create demo users
  await runQuery(`INSERT OR IGNORE INTO users (id, name, email, role, created_at) VALUES (?, ?, ?, ?, ?)`,
    ['user-1', 'Alex Chen', 'alex@example.edu', 'user', '2026-01-15']);
  await runQuery(`INSERT OR IGNORE INTO users (id, name, email, role, created_at) VALUES (?, ?, ?, ?, ?)`,
    ['admin-1', 'Dr. Sarah Park', 'sarah@university.edu', 'admin', '2026-01-10']);

  // Create waste bins
  const bins = [
    { id: 'bin-1', bin_id: 'BIN-ORGANIC-001', category: 'Organic', location: 'Campus Building A', qr: 'QR-ORG-001' },
    { id: 'bin-2', bin_id: 'BIN-RECYCLE-002', category: 'Recyclable', location: 'Campus Building B', qr: 'QR-REC-002' },
    { id: 'bin-3', bin_id: 'BIN-HAZARD-003', category: 'Hazardous', location: 'Science Lab', qr: 'QR-HAZ-003' },
    { id: 'bin-4', bin_id: 'BIN-RECYCLE-004', category: 'Recyclable', location: 'Library Area', qr: 'QR-REC-004' },
  ];

  for (const bin of bins) {
    await runQuery(`INSERT OR IGNORE INTO waste_bins (id, bin_id, category, location, qr_code, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [bin.id, bin.bin_id, bin.category, bin.location, bin.qr, now]);
  }

  // Create demo deposits
  const deposits = [
    { id: 'd-1', userId: 'user-1', binId: 'bin-1', category: 'Organic', subcategory: 'Food Scraps', weight: 2.5, status: 'verified', pred: 'Organic', conf: 0.92 },
    { id: 'd-2', userId: 'user-1', binId: 'bin-2', category: 'Recyclable', subcategory: 'Paper', weight: 1.2, status: 'verified', pred: 'Recyclable', conf: 0.88 },
    { id: 'd-3', userId: 'user-1', binId: 'bin-2', category: 'Recyclable', subcategory: 'Plastic Bottles', weight: 0.8, status: 'pending', pred: 'Recyclable', conf: 0.76 },
    { id: 'd-4', userId: 'user-1', binId: 'bin-3', category: 'Hazardous', subcategory: 'Batteries', weight: 0.3, status: 'needs_review', pred: 'Hazardous', conf: 0.91 },
    { id: 'd-5', userId: 'user-1', binId: 'bin-1', category: 'Organic', subcategory: 'Food Scraps', weight: 1.5, status: 'rejected', pred: 'Recyclable', conf: 0.55 },
    { id: 'd-6', userId: 'user-1', binId: 'bin-4', category: 'Recyclable', subcategory: 'Cardboard', weight: 3.1, status: 'verified', pred: 'Recyclable', conf: 0.94 },
    { id: 'd-7', userId: 'user-1', binId: 'bin-1', category: 'Organic', subcategory: 'Food Scraps', weight: 4.2, status: 'verified', pred: 'Organic', conf: 0.89 },
  ];

  for (const d of deposits) {
    await runQuery(`INSERT OR IGNORE INTO waste_deposits (id, user_id, bin_id, category, subcategory, weight, predicted_category, confidence, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [d.id, d.userId, d.binId, d.category, d.subcategory, d.weight, d.pred, d.conf, d.status, now]);

    // Create verification records for each
    const verStatus = d.status === 'verified' ? 'verified' : (d.status === 'rejected' ? 'rejected' : 'pending');
    const isCorrect = d.status === 'verified' ? 1 : 0;

    await runQuery(`INSERT OR IGNORE INTO verification_records (id, deposit_id, verified_by, verification_status, is_correctly_segregated, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), d.id, d.status === 'verified' ? 'admin-1' : null, verStatus, isCorrect, now]);
  }

  // Create token transactions for verified deposits
  for (const d of deposits) {
    if (d.status === 'verified') {
      const amount = d.weight * 2; // Demo token formula: 2 tokens per kg
      await runQuery(`INSERT OR IGNORE INTO token_transactions (id, user_id, deposit_id, amount, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), 'user-1', d.id, amount, 'reward', 'completed', now]);
    }
  }

  // Audit logs
  await runQuery(`INSERT OR IGNORE INTO audit_logs (id, action, target_type, target_id, user_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), 'demo_seed', 'system', 'demo', 'admin-1', 'Seeded demo data for exhibition', now]);
}
