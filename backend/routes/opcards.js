const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const OpCard = require('../models/OpCard');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

// List with pagination
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      OpCard.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      OpCard.countDocuments({ userId: req.user.id })
    ]);
    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  }
);

// Create
router.post('/',
  body('patientName').isString().notEmpty(),
  body('age').isInt({ min: 0, max: 150 }),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('mobile').matches(/^\+?[0-9]{10,15}$/),
  body('department').isString().notEmpty(),
  body('doctor').isString().notEmpty(),
  body('opNumber').isString().notEmpty(),
  body('visitDate').isISO8601(),
  body('notes').optional().isString(),
  handleValidation,
  async (req, res) => {
    const payload = { ...req.body, userId: req.user.id };
    payload.visitDate = new Date(payload.visitDate);
    const created = await OpCard.create(payload);
    res.status(201).json(created);
  }
);

// Update
router.put('/:id',
  param('id').isMongoId(),
  body('patientName').isString().notEmpty(),
  body('age').isInt({ min: 0, max: 150 }),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('mobile').matches(/^\+?[0-9]{10,15}$/),
  body('department').isString().notEmpty(),
  body('doctor').isString().notEmpty(),
  body('opNumber').isString().notEmpty(),
  body('visitDate').isISO8601(),
  body('notes').optional().isString(),
  handleValidation,
  async (req, res) => {
    const { id } = req.params;
    const existing = await OpCard.findOne({ _id: id, userId: req.user.id });
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const update = { ...req.body, visitDate: new Date(req.body.visitDate) };
    Object.assign(existing, update);
    await existing.save();
    res.json(existing);
  }
);

// Delete
router.delete('/:id',
  param('id').isMongoId(),
  handleValidation,
  async (req, res) => {
    const { id } = req.params;
    const deleted = await OpCard.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  }
);

// Get single
router.get('/:id',
  param('id').isMongoId(),
  handleValidation,
  async (req, res) => {
    const { id } = req.params;
    const card = await OpCard.findOne({ _id: id, userId: req.user.id });
    if (!card) return res.status(404).json({ error: 'Not found' });
    res.json(card);
  }
);

module.exports = router;


