const bcrypt = require('bcryptjs');

const db = {
  users: [],
  plans: [],
  transactions: [],
  investments: [],
  trades: [],
  messages: []
};

const connectDB = async () => {
  // Seed default plans
  db.plans = [
    { id: '1', name: 'Starter', roiPercent: 5, minAmount: 100, maxAmount: 999, durationDays: 7, description: 'Daily Returns', isActive: true },
    { id: '2', name: 'Growth', roiPercent: 15, minAmount: 1000, maxAmount: 9999, durationDays: 14, description: 'Daily Returns', isActive: true },
    { id: '3', name: 'Premium', roiPercent: 30, minAmount: 10000, maxAmount: 49999, durationDays: 30, description: 'Daily Returns', isActive: true },
    { id: '4', name: 'Elite', roiPercent: 50, minAmount: 50000, maxAmount: 999999999, durationDays: 60, description: 'Daily Returns', isActive: true }
  ];

  // Seed admin account
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nextrade.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const hashed = await bcrypt.hash(adminPassword, 10);
  db.users.push({
    id: 'admin-001',
    fullName: 'Admin',
    email: adminEmail,
    password: hashed,
    role: 'admin',
    balance: 0,
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString()
  });
  console.log('DB ready, admin seeded');
};

module.exports = { db, connectDB };
