const crypto = require('crypto');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function safeEqual(a, b) {
  if (!a || !b) return false;

  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length &&
    crypto.timingSafeEqual(aBuffer, bBuffer);
}

exports.createToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('base64url');

  // Browser sends this to the API, but frontend JS cannot read it.
  res.cookie('csrf_token', token, cookieOptions);

  // Frontend receives this once and sends it in a request header.
  res.json({ csrfToken: token });
};

exports.protect = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Stripe webhooks must be excluded: they do not originate from your frontend.
  if (req.path.startsWith('/webhooks/')) {
    return next();
  }

  if (req.get('origin') !== process.env.CLIENT_URL) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }

  const cookieToken = req.cookies.csrf_token;
  const headerToken = req.get('x-csrf-token');

  if (!safeEqual(cookieToken, headerToken)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};