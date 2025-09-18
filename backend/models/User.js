const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.methods.setPassword = async function setPassword(plainPassword) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(plainPassword, saltRounds);
};

userSchema.methods.validatePassword = async function validatePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);


