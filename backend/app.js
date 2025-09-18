require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const opbookingRoutes = require('./routes/opbooking');
const opcardsRoutes = require('./routes/opcards');
const appointmentsRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL || 'http://localhost:5500',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);
app.use('/api/opbooking', authMiddleware, opbookingRoutes);
app.use('/api/opcards', authMiddleware, opcardsRoutes);
app.use('/api/appointments', authMiddleware, appointmentsRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server running on port ' + (process.env.PORT || 5000))))
  .catch(err => console.log(err));
