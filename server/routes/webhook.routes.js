const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { markPaid } = require('../controllers/order.controller');

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  console.log('Webhook received:', event.type, event.data.object.metadata);

  if (event.type === 'payment_intent.amount_capturable_updated' || event.type === 'payment_intent.succeeded') {
    const orderId = event.data.object.metadata.orderId;
    console.log('Attempting markPaid for orderId:', orderId);
    if (orderId) await markPaid(orderId);
  }

  res.json({ received: true });
});

module.exports = router;