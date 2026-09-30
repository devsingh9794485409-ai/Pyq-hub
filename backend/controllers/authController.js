// backend/controllers/authController.js
import User, { BRANCH_LIST } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v || '');

// POST /api/auth/signup
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, branch, semester } = req.body ?? {};
  const errors = {};

  if (!name || name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
  if (!isEmail(email)) errors.email = 'A valid email is required';
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