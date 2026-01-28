const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^[0-9]{10,15}$/, 'Please enter a valid contact number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  aadhaar: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    unique: true,
    match: [/^[0-9]{12}$/, 'Aadhaar must be 12 digits']
  },
  aadhaarPhoto: {
    type: String,
    required: [true, 'Aadhaar photo is required']
  },
  candidatePhoto: {
    type: String,
    required: [true, 'Candidate photo is required']
  },
  opCardNumber: {
    type: String,
    unique: true,
    required: true
  },
  hospital: {
    type: String,
    required: [true, 'Hospital is required'],
    default: 'CMR HOSPITAL'
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology']
  },
  visitType: {
    type: String,
    required: [true, 'Visit type is required'],
    enum: ['New', 'Follow-up'],
    default: 'New'
  },
  followUpOpCardNumber: {
    type: String,
    required: function() {
      return this.visitType === 'Follow-up';
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);