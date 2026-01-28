const Patient = require('../models/Patient');
const path = require('path');
const fs = require('fs');

// @desc    Create new patient
// @route   POST /api/patients
// @access  Public
exports.createPatient = async (req, res, next) => {
  try {
    const {
      fullName,
      dob,
      gender,
      contact,
      email,
      address,
      aadhaar,
      hospital,
      department,
      visitType,
      followUpOpCardNumber
    } = req.body;

    // Check if follow-up card exists
    if (visitType === 'Follow-up' && followUpOpCardNumber) {
      const prevPatient = await Patient.findOne({ opCardNumber: followUpOpCardNumber });
      if (!prevPatient) {
        return res.status(400).json({
          success: false,
          message: 'Previous OP Card not found'
        });
      }
    }

    // Check if Aadhaar already exists
    const existingPatient = await Patient.findOne({ aadhaar });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Patient with this Aadhaar number already exists'
      });
    }

    // Calculate age
    const age = Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000));

    // Generate OP Card Number
    const opCardNumber = 'OP' + Date.now() + Math.floor(Math.random() * 1000);

    // Get file paths
    const aadhaarPhoto = req.files['aadhaarPhoto'] ? req.files['aadhaarPhoto'][0].path : null;
    const candidatePhoto = req.files['candidatePhoto'] ? req.files['candidatePhoto'][0].path : null;

    if (!aadhaarPhoto || !candidatePhoto) {
      return res.status(400).json({
        success: false,
        message: 'Both Aadhaar photo and candidate photo are required'
      });
    }

    const patient = await Patient.create({
      fullName,
      dob,
      age,
      gender,
      contact,
      email,
      address,
      aadhaar,
      aadhaarPhoto,
      candidatePhoto,
      opCardNumber,
      hospital: hospital || 'CMR HOSPITAL',
      department,
      visitType,
      followUpOpCardNumber
    });

    res.status(201).json({
      success: true,
      data: {
        opCardNumber: patient.opCardNumber,
        patient: {
          id: patient._id,
          fullName: patient.fullName,
          opCardNumber: patient.opCardNumber
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private (would need auth middleware)
exports.getPatients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const total = await Patient.countDocuments();
    const patients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json({
      success: true,
      count: patients.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient by OP card number
// @route   GET /api/patients/card/:opCardNumber
// @access  Public
exports.getPatientByCard = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ opCardNumber: req.params.opCardNumber });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Delete associated files
    if (patient.aadhaarPhoto) {
      fs.unlinkSync(path.join(__dirname, '..', patient.aadhaarPhoto));
    }
    if (patient.candidatePhoto) {
      fs.unlinkSync(path.join(__dirname, '..', patient.candidatePhoto));
    }

    await patient.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};