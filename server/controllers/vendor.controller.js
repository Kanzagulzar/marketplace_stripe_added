const Vendor = require('../models/vendor');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

exports.createVendorProfile = async (req, res) => {
  try {
    const { storeName } = req.body;
    const userId = req.user._id;

    const existing = await Vendor.findOne({ userId });
    if (existing) return res.status(400).json({ error: 'Vendor profile already exists' });

    let baseSlug = slugify(storeName);
    let slug = baseSlug;
    let counter = 1;
    while (await Vendor.findOne({ storeSlug: slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Create the Stripe Express account right away
    const account = await stripe.accounts.create({
      type: 'express',
      email: req.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });

    const vendor = await Vendor.create({
      userId,
      storeName,
      storeSlug: slug,
      stripeAccountId: account.id,
      status: 'pending'
    });

    req.user.role = 'vendor';
    await req.user.save();

    res.status(201).json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create vendor profile' });
  }
};

// Generates the one-time Stripe-hosted onboarding link
exports.getOnboardingLink = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    // Backfill: older vendor records created before Stripe integration existed
    // won't have a stripeAccountId yet — create one now if missing.
    if (!vendor.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: req.user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });
      vendor.stripeAccountId = account.id;
      await vendor.save();
    }

    const accountLink = await stripe.accountLinks.create({
      account: vendor.stripeAccountId,
      refresh_url: `${process.env.CLIENT_URL}/vendor/onboarding/refresh`,
      return_url: `${process.env.CLIENT_URL}/vendor/onboarding/complete`,
      type: 'account_onboarding'
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create onboarding link' });
  }
};

// Called when Stripe redirects back — checks if onboarding actually finished
exports.checkOnboardingStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const account = await stripe.accounts.retrieve(vendor.stripeAccountId);

    vendor.payoutsEnabled = account.payouts_enabled;
    vendor.bankDetailsVerified = account.payouts_enabled;
    await vendor.save();

    res.json({
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      vendor
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to check onboarding status' });
  }
};

exports.getMyVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return res.status(404).json({ error: 'No vendor profile found' });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
};

exports.getVendorBySlug = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ storeSlug: req.params.slug, status: 'approved' });
    if (!vendor) return res.status(404).json({ error: 'Store not found' });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
};

exports.listVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().populate('userId', 'name email');
    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

exports.updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(req.params.vendorId, { status }, { new: true });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json(vendor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update vendor status' });
  }
};