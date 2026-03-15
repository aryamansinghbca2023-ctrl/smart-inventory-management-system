const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'INVORA Corp',
  },
  currency: {
    type: String,
    default: '₹',
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
  },
  skuPrefix: {
    type: String,
    default: 'SKU-',
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  emailLowStock: {
    type: Boolean,
    default: true,
  },
  emailNewRequest: {
    type: Boolean,
    default: true,
  },
  emailDailySummary: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
