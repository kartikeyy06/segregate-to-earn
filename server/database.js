import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'app.db');

let db;

function getDb() {
  if (!db) {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('DB connection error:', err);
      else db.run('PRAGMA foreign_keys = ON');
    });
  }
  return db;
}

export function initializeDatabase() {
  const database = getDb();

  return new Promise((resolve, reject) => {
    database.serialize(() => {

      // Users table
      database.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Waste bins table
      database.run(`
        CREATE TABLE IF NOT EXISTS waste_bins (
          id TEXT PRIMARY KEY,
          bin_id TEXT UNIQUE NOT NULL,
          category TEXT NOT NULL,
          location TEXT,
          qr_code TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Waste deposits table
      database.run(`
        CREATE TABLE IF NOT EXISTS waste_deposits (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          bin_id TEXT NOT NULL,
          category TEXT NOT NULL,
          subcategory TEXT,
          weight REAL NOT NULL,
          image_url TEXT,
          predicted_category TEXT,
          confidence REAL,
          notes TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Verification records table
      database.run(`
        CREATE TABLE IF NOT EXISTS verification_records (
          id TEXT PRIMARY KEY,
          deposit_id TEXT NOT NULL UNIQUE,
          verified_by TEXT,
          verification_status TEXT DEFAULT 'pending',
          is_correctly_segregated INTEGER DEFAULT 0,
          notes TEXT,
          verified_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Token transactions table
      database.run(`
        CREATE TABLE IF NOT EXISTS token_transactions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          deposit_id TEXT,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
      });

      // Audit logs table
      database.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          target_type TEXT,
          target_id TEXT,
          user_id TEXT,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

export function getDatabase() {
  return getDb();
}

// Helper to run queries with promises
export function runQuery(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getQuery(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allQuery(sql, params = []) {
  const db = getDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
