const cron = require('node-cron');
const Order = require('../models/Order');
const Vendor = require('../models/vendor');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function releaseEscrowPayouts() {
  const ordersToRelease = await Order.find({
    status: 'delivered',
    payoutStatus: 'held',
    escrowReleaseDate: { $lte: new Date() }
  });

  console.log(`Escrow release job: found ${ordersToRelease.length} order(s) to pay out`);

  for (const order of ordersToRelease) {
    try {
      const vendor = await Vendor.findById(order.vendorId);
      if (!vendor?.stripeAccountId || !vendor.payoutsEnabled) {
        console.log(`Skipping order ${order._id} — vendor not payout-ready`);
        continue;
      }

      await stripe.transfers.create({
        amount: order.vendorPayout,
        currency: 'usd',
        destination: vendor.stripeAccountId,
        transfer_group: order.checkoutGroupId
      });

      order.payoutStatus = 'released';
      await order.save();
      console.log(`Released $${(order.vendorPayout / 100).toFixed(2)} to vendor for order ${order._id}`);
    } catch (err) {
      console.error(`Failed to release payout for order ${order._id}:`, err.message);
    }
  }
}

// Runs daily at midnight. For testing, you can temporarily use '* * * * *' (every minute) instead.
function startEscrowReleaseJob() {
  cron.schedule('0 0 * * *', releaseEscrowPayouts);
}

module.exports = { startEscrowReleaseJob, releaseEscrowPayouts };