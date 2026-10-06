// backend/controllers/authController.js
import User, { BRANCH_LIST } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';
import { adminAuth } from '../config/firebase.js';

const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v || '');

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, branch, semester } = req.body ?? {};
  const errors = {};

  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!isEmail(email))                 errors.email = 'A valid email is required';
  if (!password || password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (!BRANCH_LIST.includes(String(branch || '').toUpperCase())) errors.branch = 'Invalid branch';
  const sem = Number(semester);
  if (!Number.isInteger(sem) || sem < 1 || sem > 8) errors.semester = 'Semester must be 1–8';

  if (Object.keys(errors).length) throw ApiError.badRequest('Validation failed', errors);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
    branch: branch.toUpperCase(),
    semester: sem,
  });

  res.status(201).json({
    success: true,
    token: signToken(user._id),
    user: user.toPublicJSON(),
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isEmail(email) || !password) throw ApiError.badRequest('Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  res.json({
    success: true,
    token: signToken(user._id),
    user: user.toPublicJSON(),
  });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

// POST /api/auth/firebase
// Body: { idToken: string, branch?: string, semester?: number }
export const firebaseAuth = asyncHandler(async (req, res) => {
  const { idToken, branch, semester } = req.body ?? {};

  if (!idToken || typeof idToken !== 'string') {
    throw ApiError.badRequest('idToken is required');
  }

  // Verify the Firebase ID token
  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired Firebase ID token');
  }

  const { uid, email, name, picture } = decoded;

  if (!email) throw ApiError.badRequest('Google account must have an email address');

  // ── Find existing user (by googleId or email) ──────────────
  let user = await User.findOne({ $or: [{ googleId: uid }, { email: email.toLowerCase() }] });
  let isNewUser = false;

  if (user) {
    // Existing user — link Google account if not already linked
    if (!user.googleId) {
      user.googleId    = uid;
      user.authProvider = 'google';
      if (picture && !user.avatarUrl) user.avatarUrl = picture;
      await user.save();
    }
  } else {
    // ── New user — branch & semester are required ──────────────
    const errors = {};
    if (!BRANCH_LIST.includes(String(branch || '').toUpperCase())) errors.branch = 'Invalid branch';
    const sem = Number(semester);
    if (!Number.isInteger(sem) || sem < 1 || sem > 8) errors.semester = 'Semester must be 1–8';
    if (Object.keys(errors).length) {
      // Signal to the frontend that branch/semester are still needed
      return res.status(422).json({
        success: false,
        code: 'PROFILE_INCOMPLETE',
        message: 'Please complete your profile',
        details: errors,
      });
    }

    user = await User.create({
      name:         (name || email.split('@')[0]).trim(),
      email:        email.toLowerCase(),
      googleId:     uid,
      avatarUrl:    picture || '',
      authProvider: 'google',
      branch:       branch.toUpperCase(),
      semester:     sem,
    });
    isNewUser = true;
  }

  res.status(isNewUser ? 201 : 200).json({
    success: true,
    isNewUser,
    token: signToken(user._id),
    user: user.toPublicJSON(),
  });
});

// POST /api/auth/forgot-password
// Body: { email }
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body ?? {};
  if (!isEmail(email)) throw ApiError.badRequest('A valid email is required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordResetToken +passwordResetExpiry');
  // Always respond 200 to avoid email enumeration
  if (!user || user.authProvider !== 'local') {
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  }

  const { randomBytes, createHash } = await import('node:crypto');
  const rawToken    = randomBytes(32).toString('hex');
  const hashedToken = createHash('sha256').update(rawToken).digest('hex');

  user.passwordResetToken  = hashedToken;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;
  // TODO: replace console.log with real email in production (nodemailer/SendGrid)
  console.log(`[DEV] Password reset URL: ${resetUrl}`);

  res.json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
    ...(process.env.NODE_ENV === 'development' && { devResetUrl: resetUrl }),
  });
});

// POST /api/auth/reset-password
// Body: { email, token, newPassword }
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, newPassword } = req.body ?? {};
  if (!isEmail(email))                        throw ApiError.badRequest('Email is required');
  if (!token || typeof token !== 'string')    throw ApiError.badRequest('Reset token is required');
  if (!newPassword || newPassword.length < 6) throw ApiError.badRequest('Password must be at least 6 characters');

  const { createHash } = await import('node:crypto');
  const hashedToken = createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    passwordResetToken:  hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpiry');

  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  user.password            = newPassword;
  user.passwordResetToken  = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  res.json({
    success: true,
    token:   signToken(user._id),
    user:    user.toPublicJSON(),
    message: 'Password updated successfully',
  });
});