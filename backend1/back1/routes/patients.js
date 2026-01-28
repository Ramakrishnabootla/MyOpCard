const express = require('express');
const {
  createPatient,
  getPatients,
  getPatient,
  getPatientByCard,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');

const { validatePatient, handleValidationErrors } = require('../middlewares/validation');
const upload = require('../middlewares/upload');

const router = express.Router();

// Routes
router
  .route('/')
  .get(getPatients)
  .post(
    upload.fields([
      { name: 'aadhaarPhoto', maxCount: 1 },
      { name: 'candidatePhoto', maxCount: 1 }
    ]),
    validatePatient,
    handleValidationErrors,
    createPatient
  );

router
  .route('/:id')
  .get(getPatient)
  .put(validatePatient, handleValidationErrors, updatePatient)
  .delete(deletePatient);

router
  .route('/card/:opCardNumber')
  .get(getPatientByCard);

module.exports = router;