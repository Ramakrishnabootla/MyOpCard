const mongoose = require('mongoose');

const opCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  patientName: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0, max: 150 },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  mobile: { type: String, required: true, trim: true },
  department: { type: String, required: true, trim: true },
  doctor: { type: String, required: true, trim: true },
  opNumber: { type: String, required: true, trim: true },
  visitDate: { type: Date, required: true },
  notes: { type: String, trim: true }
}, { timestamps: true });

opCardSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('OpCard', opCardSchema);


