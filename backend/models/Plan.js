const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  roiPercent: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', PlanSchema);
