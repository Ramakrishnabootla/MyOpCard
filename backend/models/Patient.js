const mongoose = require('mongoose');
const PatientSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  age: Number,
  gender: String,
  contact: String,
  email: String,
  address: String,
  aadhaar: String,
  aadhaarPhoto: String, // file path
  candidatePhoto: String, // file path
  opCardNumber: { type: String, unique: true },
  hospital: String,
  department: String,
  visitType: String,
  followUpOpCardNumber: String
});
module.exports = mongoose.model('Patient', PatientSchema);
