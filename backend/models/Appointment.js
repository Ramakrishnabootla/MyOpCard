const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  doctorId: { type: String, required: true, index: true },
  dateTime: { type: Date, required: true, index: true },
  type: { type: String, enum: ['Physical', 'Video'], required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, dateTime: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'Cancelled' } } });

module.exports = mongoose.model('Appointment', appointmentSchema);


