const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const sendMail = require('../utils/email');

const router = express.Router();

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 7;

function signAccessToken(user) {
  return jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    maxAge: 15 * 60 * 1000
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  });
}

router.post('/signup',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = new User({ email, name });
    await user.setPassword(password);
    await user.save();
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken();
    user.refreshTokens.push({ token: refreshToken });
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ user: { id: user._id, email: user.email, name: user.name } });
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await user.validatePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken();
    user.refreshTokens.push({ token: refreshToken });
    await user.save();
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user: { id: user._id, email: user.email, name: user.name } });
  }
);

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.cookies || {};
  if (refreshToken) {
    await User.updateOne({ 'refreshTokens.token': refreshToken }, { $pull: { refreshTokens: { token: refreshToken } } });
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.cookies || {};
  if (!refreshToken) return res.status(401).json({ error: 'Missing refresh token' });
  const user = await User.findOne({ 'refreshTokens.token': refreshToken });
  if (!user) return res.status(401).json({ error: 'Invalid refresh token' });
  const accessToken = signAccessToken(user);
  setAuthCookies(res, accessToken, refreshToken);
  res.json({ success: true });
});

router.post('/forgot-password',
  body('email').isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true });
    user.resetPasswordToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const resetUrl = `${process.env.FRONTEND_BASE_URL}/reset-password.html?token=${user.resetPasswordToken}`;
    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    res.json({ success: true });
  }
);

router.post('/reset-password',
  body('token').isString(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { token, password } = req.body;
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: new Date() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    await user.setPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    res.json({ success: true });
  }
);

module.exports = router;


