const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');

const router = express.Router();

const DOCTORS = [
  { id: 'dr-smith', name: 'Dr. Smith - Cardiology' },
  { id: 'dr-jones', name: 'Dr. Jones - Orthopedics' },
  { id: 'dr-lee', name: 'Dr. Lee - Pediatrics' }
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.get('/doctors', (req, res) => {
  res.json(DOCTORS);
});

router.get('/availability',
  query('doctorId').isString().notEmpty(),
  query('date').isISO8601(),
  validate,
  async (req, res) => {
    const { doctorId, date } = req.query;
    const dayStart = new Date(date);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23,59,59,999);
    const existing = await Appointment.find({ doctorId, dateTime: { $gte: dayStart, $lte: dayEnd }, status: { $ne: 'Cancelled' } });
    const taken = new Set(existing.map(a => a.dateTime.toISOString()));
    const slots = [];
    for (let h = 9; h <= 17; h++) {
      for (let m of [0, 30]) {
        const d = new Date(dayStart); d.setHours(h, m, 0, 0);
        const iso = d.toISOString();
        slots.push({ time: iso, available: !taken.has(iso) });
      }
    }
    res.json(slots);
  }
);

router.post('/create',
  body('doctorId').isString().notEmpty(),
  body('dateTime').isISO8601(),
  body('type').isIn(['Physical','Video']),
  validate,
  async (req, res) => {
    const { doctorId, dateTime, type } = req.body;
    const when = new Date(dateTime);
    const conflict = await Appointment.findOne({ doctorId, dateTime: when, status: { $ne: 'Cancelled' } });
    if (conflict) return res.status(409).json({ error: 'Slot already booked' });
    const created = await Appointment.create({ userId: req.user.id, doctorId, dateTime: when, type, status: 'Pending' });
    res.status(201).json(created);
  }
);

router.get('/upcoming', async (req, res) => {
  const now = new Date();
  const items = await Appointment.find({ userId: req.user.id, dateTime: { $gte: now }, status: { $ne: 'Cancelled' } }).sort({ dateTime: 1 }).limit(50);
  res.json(items);
});

router.post('/:id/cancel',
  param('id').isMongoId(),
  validate,
  async (req, res) => {
    const app = await Appointment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!app) return res.status(404).json({ error: 'Not found' });
    app.status = 'Cancelled';
    await app.save();
    res.json({ success: true });
  }
);

module.exports = router;


