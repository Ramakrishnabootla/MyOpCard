require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const opbookingRoutes = require('./routes/opbooking');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/opbooking', opbookingRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(5000, () => console.log('Server running on port 5000')))
  .catch(err => console.log(err));
