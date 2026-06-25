// In-memory database for demo purposes
const db = {
  users: [],
  plans: [
    { id: '1', name: 'Starter', roiPercent: 5, minAmount: 100, maxAmount: 999, durationDays: 7, description: 'Daily Returns', isActive: true },
    { id: '2', name: 'Growth', roiPercent: 15, minAmount: 1000, maxAmount: 9999, durationDays: 14, description: 'Daily Returns', isActive: true },
    { id: '3', name: 'Premium', roiPercent: 30, minAmount: 10000, maxAmount: 49999, durationDays: 30, description: 'Daily Returns', isActive: true },
    { id: '4', name: 'Elite', roiPercent: 50, minAmount: 50000, maxAmount: 999999999, durationDays: 60, description: 'Daily Returns', isActive: true }
  ],
  investments: [],
  trades: [],
  transactions: [],
  messages: []
};

const connectDB = async () => {
  console.log('In-memory database ready');
};

module.exports = { db, connectDB };