const express = require('express');
const multer = require('multer');
const Patient = require('../../models/Patient');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', upload.fields([
  { name: 'aadhaarPhoto', maxCount: 1 },
  { name: 'candidatePhoto', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fullName, dob, gender, contact, email, address, aadhaar, hospital, department, visitType, followUpOpCardNumber } = req.body;
    const age = dob ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
    const opCardNumber = 'OP' + Date.now();
    const aadhaarPhoto = req.files['aadhaarPhoto']?.[0]?.path;
    const candidatePhoto = req.files['candidatePhoto']?.[0]?.path;

    // For follow-up, verify previous OP Card
    if (visitType === 'Follow-up' && followUpOpCardNumber) {
      const prev = await Patient.findOne({ opCardNumber: followUpOpCardNumber });
      if (!prev) return res.status(400).json({ error: 'Previous OP Card not found' });
      // Optionally, verify details match
    }

    const patient = new Patient({
      fullName, dob, age, gender, contact, email, address, aadhaar,
      aadhaarPhoto, candidatePhoto, opCardNumber, hospital, department, visitType, followUpOpCardNumber
    });
    await patient.save();
    res.json({ success: true, opCardNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
