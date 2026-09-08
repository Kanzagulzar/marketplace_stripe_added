const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/vendor');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { randomUUID } = require('crypto');

const PLATFORM_FEE_PERCENT = 10;
const DISPUTE_WINDOW_DAYS = 7;

// Buyer checkout: cart items grouped by vendor -> one Order + one PaymentIntent PER VENDOR
exports.checkout = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body; // [{ productId, qty }]
    const buyerId = req.user._id;

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).populate('vendorId');

    const byVendor = {};
    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) return res.status(400).json({ error: `Product ${item.productId} not found` });
      if (product.stock < item.qty) return res.status(400).json({ error: `Insufficient stock for ${product.title}` });

      const vId = product.vendorId._id.toString();
      if (!byVendor[vId]) byVendor[vId] = { vendor: product.vendorId, items: [] };
      byVendor[vId].items.push({ product, qty: item.qty });
    }

    const checkoutGroupId = randomUUID();
    const results = [];

    for (const { vendor, items: vendorItems } of Object.values(byVendor)) {
      const subtotal = vendorItems.reduce((sum, { product, qty }) => sum + product.price * qty, 0);
      const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100));
      const vendorPayout = subtotal - platformFee;

      const order = await Order.create({
        checkoutGroupId,
        buyerId,
        vendorId: vendor._id,
        items: vendorItems.map(({ product, qty }) => ({
          productId: product._id,
          title: product.title,
          price: product.price,
          qty
        })),
        subtotal,
        platformFee,
        vendorPayout,
        shippingAddress
      });

      // One PaymentIntent per vendor sub-order — manual capture holds funds until shipped
      const paymentIntent = await stripe.paymentIntents.create({
        amount: subtotal,
        currency: 'usd',
        capture_method: 'manual',
        metadata: { orderId: order._id.toString(), checkoutGroupId }
      });

      order.paymentIntentId = paymentIntent.id;
      await order.save();

      results.push({
        orderId: order._id,
        vendorName: vendor.storeName,
        amount: subtotal,
        clientSecret: paymentIntent.client_secret
      });
    }

    res.json({ checkoutGroupId, orders: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
};

// Called by webhook once a specific order's PaymentIntent is authorized
exports.markPaid = async (orderId) => {
  // This conditional update makes the webhook and the browser confirmation
  // endpoint safely idempotent when they arrive at nearly the same time.
  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: 'pending' },
    {
      $set: { status: 'paid' },
      $push: { statusHistory: { status: 'paid', note: 'Payment authorized' } }
    },
    { new: true }
  );
  if (!order) return null;

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
  }

  return order;
};

// Fallback for local development and a faster buyer experience. The client can
// only request this for its own order; Stripe remains the source of truth.
exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your order' });
    }
    if (!order.paymentIntentId) {
      return res.status(400).json({ error: 'Order has no payment intent' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
    if (!['requires_capture', 'succeeded'].includes(paymentIntent.status)) {
      return res.status(400).json({ error: 'Payment has not been authorized' });
    }

    const paidOrder = await exports.markPaid(order._id);
    res.json(paidOrder || await Order.findById(order._id));
  } catch (err) {
    console.error('Failed to confirm payment:', err);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id }).sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner = order.buyerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    let isVendorOwner = false;
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ userId: req.user._id });
      isVendorOwner = vendor && order.vendorId.toString() === vendor._id.toString();
    }

    if (!isOwner && !isAdmin && !isVendorOwner) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find().sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return res.status(403).json({ error: 'No vendor profile' });

    const orders = await Order.find({ vendorId: vendor._id }).sort('-createdAt');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.markShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor || order.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ error: 'Not your order' });
    }
    if (!vendor.payoutsEnabled) {
      return res.status(403).json({ error: 'Complete Stripe onboarding before fulfilling orders' });
    }

    if (order.status === 'paid') order.transitionTo('processing');
    order.transitionTo('shipped', 'Marked shipped by vendor');
    order.escrowReleaseDate = new Date(Date.now() + DISPUTE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    await order.save();

    await stripe.paymentIntents.capture(order.paymentIntentId);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark shipped' });
  }
};

exports.confirmDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your order' });
    }

    order.transitionTo('delivered', 'Confirmed by buyer');
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to confirm delivery' });
  }
};

exports.raiseDispute = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not your order' });
    }

    order.transitionTo('disputed', req.body.reason || 'Buyer reported an issue');
    order.payoutStatus = 'held';
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to raise dispute' });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { resolution } = req.body; // 'refund' | 'release'
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (resolution === 'refund') {
      await stripe.refunds.create({ payment_intent: order.paymentIntentId });
      order.transitionTo('refunded', 'Admin resolved dispute: refunded');
      order.payoutStatus = 'refunded';
    } else {
      order.transitionTo('delivered', 'Admin resolved dispute: released to vendor');
      order.escrowReleaseDate = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve dispute' });
  }
};
