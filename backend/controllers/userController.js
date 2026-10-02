// backend/controllers/userController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/users/:id  — Public profile + uploads
export const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id');

  const user = await User.findById(id).lean();
  if (!user) throw ApiError.notFound('User not found');

  const uploads = await Resource.find({ uploadedBy: id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('subject', 'name code branch semester')
    .lean();

  // Strip private fields
  const { password: _pw, googleId: _gi, __v: _v, ...publicUser } = user;

  res.json({
    success: true,
    user: publicUser,
    uploads: uploads.map((r) => ({
      _id: r._id,
      title: r.title,
      type: r.type,
      year: r.year,
      fileUrl: r.fileUrl,
      fileFormat: r.fileFormat,
      subject: r.subject,
      upvoteCount: r.upvotes?.length ?? 0,
      downloadCount: r.downloadCount ?? 0,
      createdAt: r.createdAt,
    })),
  });
});

// GET /api/users  — Admin only: list all users
export const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, q } = req.query;
  const pageNum  = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(limit) || 30));

  const filter = q
    ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / pageSize) || 1,
    users: users.map(({ password: _pw, googleId: _gi, __v: _v, ...u }) => u),
  });
});

// PATCH /api/users/:id  — Admin: toggle isAdmin, or self: update name/branch/semester
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id');

  const isSelf = String(req.user._id) === id;
  const isAdmin = req.user.isAdmin;

  if (!isSelf && !isAdmin) throw ApiError.forbidden('Not authorised');

  const allowed = {};
  if (isSelf) {
    // Users can update their own academic info
    if (req.body.name    !== undefined) allowed.name    = String(req.body.name).trim().slice(0, 60);
    if (req.body.branch  !== undefined) allowed.branch  = String(req.body.branch).toUpperCase();
    if (req.body.semester!== undefined) allowed.semester= Number(req.body.semester);
  }
  if (isAdmin && req.body.isAdmin !== undefined) {
    allowed.isAdmin = Boolean(req.body.isAdmin);
  }

  const updated = await User.findByIdAndUpdate(id, allowed, { new: true, runValidators: true });
  if (!updated) throw ApiError.notFound('User not found');

  const { password: _pw, googleId: _gi, __v: _v, ...publicUser } = updated.toObject();
  res.json({ success: true, user: publicUser });
});

// DELETE /api/users/:id  — Admin only
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id');

  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');

  res.json({ success: true, message: 'User deleted' });
});
