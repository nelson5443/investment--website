const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

const connectDB = async () => {
  return new Promise((resolve, reject) => {
    // Create tables
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        balance REAL DEFAULT 0,
        totalInvested REAL DEFAULT 0,
        totalReturns REAL DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        isVerified BOOLEAN DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      db.run(`CREATE TABLE IF NOT EXISTS plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        roiPercent INTEGER NOT NULL,
        minAmount INTEGER NOT NULL,
        maxAmount INTEGER NOT NULL,
        durationDays INTEGER NOT NULL,
        description TEXT NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // Insert default plans if none exist
      db.get("SELECT COUNT(*) as count FROM plans", (err, row) => {
        if (row.count === 0) {
          const plans = [
            ['1', 'Starter', 5, 100, 999, 7, 'Daily Returns'],
            ['2', 'Growth', 15, 1000, 9999, 14, 'Daily Returns'],
            ['3', 'Premium', 30, 10000, 49999, 30, 'Daily Returns'],
            ['4', 'Elite', 50, 50000, 999999999, 60, 'Daily Returns']
          ];
          const stmt = db.prepare("INSERT INTO plans (id, name, roiPercent, minAmount, maxAmount, durationDays, description) VALUES (?, ?, ?, ?, ?, ?, ?)");
          plans.forEach(plan => stmt.run(plan));
          stmt.finalize();
          console.log('Default plans created');
        }

        // Seed admin account if not exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@nextrade.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
        db.get("SELECT id FROM users WHERE email = ?", [adminEmail], async (err, row) => {
          if (!row) {
            const hashed = await bcrypt.hash(adminPassword, 10);
            db.run("INSERT INTO users (id, fullName, email, password, role, isVerified) VALUES (?, 'Admin', ?, ?, 'admin', 1)",
              [Date.now().toString(), adminEmail, hashed],
              () => console.log('Admin account seeded'));
          }
          resolve();
        });
      });
    });
  });
};

module.exports = { db, connectDB };