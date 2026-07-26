require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { seedDatabase } = require('./services/seedService');

async function runSeed() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is required to run seed script');
    process.exit(1);
  }

  const isConnected = await connectDB();
  if (!isConnected) {
    console.error('❌ Could not connect to MongoDB Atlas');
    process.exit(1);
  }

  await seedDatabase(true);
  console.log('\n🎉 Seeding complete! Database is ready.');

  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
