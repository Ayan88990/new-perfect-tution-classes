/**
 * db.js — MongoDB connection management using Mongoose
 */

const mongoose = require('mongoose');

async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.warn('⚠️ MONGO_URI not set — running in Standalone mode (no database)');
    return false;
  }

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ Connected to MongoDB Atlas');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
}

module.exports = connectDB;
