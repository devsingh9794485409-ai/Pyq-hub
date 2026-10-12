// backend/config/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Database connection failed: neither MONGODB_URI nor MONGO_URI is set.');
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected.');
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
    throw err;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};