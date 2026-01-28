const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const clientOptions = {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;