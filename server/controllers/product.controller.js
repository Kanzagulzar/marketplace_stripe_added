const Product = require('../models/Product');
const Vendor = require('../models/vendor');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const products = await Product.find(filter)
      .populate('vendorId', 'storeName storeSlug rating')
      .sort('-createdAt');
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendorId', 'storeName storeSlug rating');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return res.status(403).json({ error: 'No vendor profile — create one first' });

    const products = await Product.find({ vendorId: vendor._id }).sort('-createdAt');
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch your products' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    if (!vendor) return res.status(403).json({ error: 'No vendor profile — create one first' });
    if (vendor.status !== 'approved') {
      return res.status(403).json({ error: 'Vendor account pending approval' });
    }

    const { title, description, price, stock, images, category, status } = req.body;
    const product = await Product.create({
      vendorId: vendor._id,
      title, description, price, stock, images, category, status
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Failed to create product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ error: 'Not your product' });
    }

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ userId: req.user._id });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
      return res.status(403).json({ error: 'Not your product' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};