const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeName: { type: String, required: true, trim: true },
  storeSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  stripeAccountId: { type: String },
  payoutsEnabled: { type: Boolean, default: false },
  bankDetailsVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);