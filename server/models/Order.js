const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  checkoutGroupId: { type: String, required: true }, // links sibling sub-orders from one checkout
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    qty: Number
  }],
  subtotal: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  vendorPayout: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'disputed', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String
  }],

  paymentIntentId: String,
  payoutStatus: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
  escrowReleaseDate: Date,

  shippingAddress: {
    line1: String,
    city: String,
    postalCode: String,
    country: String
  }
}, { timestamps: true });

const ALLOWED_TRANSITIONS = {
  pending: ['paid'],
  paid: ['processing', 'refunded'],
  processing: ['shipped'],
  shipped: ['delivered', 'disputed'],
  delivered: ['disputed'],
  disputed: ['refunded', 'delivered']
};

orderSchema.methods.canTransitionTo = function (newStatus) {
  return ALLOWED_TRANSITIONS[this.status]?.includes(newStatus) ?? false;
};

orderSchema.methods.transitionTo = function (newStatus, note = '') {
  if (!this.canTransitionTo(newStatus)) {
    throw new Error(`Cannot transition from ${this.status} to ${newStatus}`);
  }
  this.status = newStatus;
  this.statusHistory.push({ status: newStatus, note });
};

module.exports = mongoose.model('Order', orderSchema);