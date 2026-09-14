const Review = require('../models/Review');
const Order = require('../models/Order');
const Vendor = require('../models/vendor');

// Recalculate and save a vendor's average rating across all their reviews
async function recalculateVendorRating(vendorId) {
  const reviews = await Review.find({ vendorId });
  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  await Vendor.findByIdAndUpdate(vendorId, { rating: Math.round(avg * 10) / 10 }); // round to 1 decimal
}

exports.createReview = async (req, res) => {
  try {
    const { orderId, productId, rating, comment } = req.body;
    const buyerId = req.user._id;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId.toString() !== buyerId.toString()) {
      return res.status(403).json({ error: 'Not your order' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'You can only review delivered orders' });
    }

    const itemInOrder = order.items.some((i) => i.productId.toString() === productId);
    if (!itemInOrder) {
      return res.status(400).json({ error: 'This product was not part of that order' });
    }

    const existing = await Review.findOne({ orderId, productId });
    if (existing) return res.status(400).json({ error: 'You already reviewed this product' });

    const review = await Review.create({
      orderId,
      productId,
      vendorId: order.vendorId,
      buyerId,
      rating,
      comment
    });

    await recalculateVendorRating(order.vendorId);

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).json({ error: 'You already reviewed this product' });
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// Public: reviews for a given product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('buyerId', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Buyer: check which items in an order still need a review
exports.getReviewedProductIds = async (req, res) => {
  try {
    const reviews = await Review.find({ orderId: req.params.orderId, buyerId: req.user._id });
    res.json(reviews.map((r) => r.productId.toString()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch review status' });
  }
};