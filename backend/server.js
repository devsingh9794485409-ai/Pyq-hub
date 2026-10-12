// backend/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import authRoutes     from './routes/authRoutes.js';
import subjectRoutes  from './routes/subjectRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import userRoutes     from './routes/userRoutes.js';
import adminRoutes    from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

// ── Security headers (Phase 9) ─────────────────────────────────────────────
try {
  const { default: helmet } = await import('helmet');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
} catch {
  console.warn('⚠️  helmet not installed — run: npm install helmet');
}

// ── CORS Configuration ─────────────────────────────────────────────────────
const parseAllowedOrigins = () => {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return new Set([
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    ...configured,
  ]);
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, uptime monitors)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed =
      allowedOrigins.has(cleanOrigin) ||
      allowedOrigins.has('*') ||
      process.env.NODE_ENV !== 'production' ||
      /\.vercel\.app$/.test(cleanOrigin);

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
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

// ── Health check (Reports service & MongoDB status) ───────────────────────
const healthCheckHandler = (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const statusCode = isDbConnected ? 200 : 503;
  res.status(statusCode).json({
    success: isDbConnected,
    status: isDbConnected ? 'healthy' : 'degraded',
    service: 'PYQHub API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStateMap[dbState] || 'unknown',
      readyState: dbState,
    },
  });
};

app.get('/health', healthCheckHandler);
app.get('/api/health', healthCheckHandler);

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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (host: 0.0.0.0)`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

start();