// backend/config/db.js
import mongoose from 'mongoose';

export const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
  
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  return conn;
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};