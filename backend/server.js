// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './config/db.js';
import authRoutes     from './routes/authRoutes.js';
import subjectRoutes  from './routes/subjectRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import userRoutes     from './routes/userRoutes.js';
import adminRoutes    from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

// ── Security headers (Phase 9) ─────────────────────────────────────────────
// Dynamically import helmet so the app doesn't crash if the package isn't
// installed yet (it's an optional Phase 9 dep)
try {
  const { default: helmet } = await import('helmet');
  app.use(helmet());
} catch {
  console.warn('⚠️  helmet not installed — run: npm install helmet');
}

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Rate limiting (Phase 9) ────────────────────────────────────────────────
try {
  const { rateLimit } = await import('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many auth attempts, please try again later.' },
  });
  app.use('/api', limiter);
  app.use('/api/auth/login',           authLimiter);
  app.use('/api/auth/signup',          authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);
} catch {
  console.warn('⚠️  express-rate-limit not installed — run: npm install express-rate-limit');
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'PYQHub API running', timestamp: Date.now() });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/subjects',  subjectRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/admin',     adminRoutes);

// ── 404 + error handler — sabse aakhir me ──────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();