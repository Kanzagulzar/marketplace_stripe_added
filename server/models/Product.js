const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, // was 'User'
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  images: [String],
  category: { type: String, trim: true },
  status: { type: String, enum: ['active', 'draft'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);