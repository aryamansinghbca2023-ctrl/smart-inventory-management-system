const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0,
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Price cannot be negative'],
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual status field — computed dynamically
productSchema.virtual('status').get(function () {
  // Threshold can be overridden via a query-time setter, but defaults to 10
  const threshold = this._threshold || 10;
  if (this.quantity === 0) return 'out_of_stock';
  if (this.quantity <= threshold) return 'low_stock';
  return 'in_stock';
});

module.exports = mongoose.model('Product', productSchema);
