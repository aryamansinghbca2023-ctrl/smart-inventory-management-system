const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
    throw new Error("Missing MONGO_URI environment variable. Please add your MongoDB Atlas connection string in Vercel Settings.");
  }

  try {
    // Try connecting to the configured MongoDB URI first
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/invora', { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error; // Fail fast in Vercel to allow JSON error response
    }
    console.log('⚠️  Local MongoDB not available, starting in-memory server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log(`✅ MongoDB Connected (In-Memory): ${mongoose.connection.host}`);
    } catch (memError) {
      console.error(`❌ MongoDB Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
