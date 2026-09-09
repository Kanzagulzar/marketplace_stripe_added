const jwt = require('jsonwebtoken');
const User = require('../models/user');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// const COOKIE_OPTIONS = {
//   httpOnly: true,          // JS on the frontend can't read this cookie — blocks XSS token theft
//   secure: process.env.NODE_ENV === 'production', // HTTPS only in prod; allow http in local dev
//   sameSite: 'strict',      // blocks the cookie being sent on cross-site requests — CSRF protection
//   maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days, matches JWT expiry
// };
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // 'none' allows cross-site cookies
  maxAge: 7 * 24 * 60 * 60 * 1000
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: role === 'vendor' ? 'vendor' : 'buyer' // never trust client to self-assign admin
    });

    const token = generateToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ message: 'Logged out' });
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};