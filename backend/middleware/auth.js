const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};


