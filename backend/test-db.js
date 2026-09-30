// backend/test-db.js
import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';

try {
  await connectDB();
  console.log('🎉 SUCCESS! Database connected.');
  await disconnectDB();
  process.exit(0);
} catch (err) {
  console.error('❌ FAILED:', err.message);
  process.exit(1);
}