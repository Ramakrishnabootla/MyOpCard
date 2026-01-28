const { body, validationResult } = require('express-validator');

// Validation rules for patient creation
const validatePatient = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('dob')
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),

  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Please select a valid gender'),

  body('contact')
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Contact number must be 10-15 digits'),

  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),

  body('address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),

  body('aadhaar')
    .matches(/^[0-9]{12}$/)
    .withMessage('Aadhaar must be exactly 12 digits'),

  body('department')
    .isIn(['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology'])
    .withMessage('Please select a valid department'),

  body('visitType')
    .isIn(['New', 'Follow-up'])
    .withMessage('Visit type must be New or Follow-up'),

  body('followUpOpCardNumber')
    .if(body('visitType').equals('Follow-up'))
    .notEmpty()
    .withMessage('Follow-up OP card number is required for follow-up visits')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validatePatient,
  handleValidationErrors
};