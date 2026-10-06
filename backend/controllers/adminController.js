// backend/controllers/adminController.js
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import Subject from '../models/Subject.js';
import asyncHandler from '../utils/asyncHandler.js';
import { destroyAsset } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import mongoose from 'mongoose';

// GET /api/admin/dashboard — overview stats
export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalResources,
    totalSubjects,
    totalDownloads,
    recentUsers,
    recentResources,
  ] = await Promise.all([
    User.countDocuments(),
    Resource.countDocuments(),
    Subject.countDocuments(),
    Resource.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    Resource.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('subject', 'name code')
      .populate('uploadedBy', 'name')
      .lean(),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalResources,
      totalSubjects,
      totalDownloads: totalDownloads[0]?.total ?? 0,
    },
    recentUsers:     recentUsers.map(({ password: _pw, googleId: _gi, ...u }) => u),
    recentResources: recentResources.map((r) => ({
      _id:           r._id,
      title:         r.title,
      type:          r.type,
      subject:       r.subject,
      uploadedBy:    r.uploadedBy,
      downloadCount: r.downloadCount,
      createdAt:     r.createdAt,
    })),
  });
});

// GET /api/admin/users — paginated list
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, q } = req.query;
  const pageNum  = Math.max(1, Number(page));
  const pageSize = Math.min(100, Math.max(1, Number(limit)));

  const filter = q
    ? { $or: [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize).lean(),
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

// PATCH /api/admin/users/:id — set isAdmin flag
export const setAdminRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id');

  const { isAdmin } = req.body ?? {};
  const user = await User.findByIdAndUpdate(id, { isAdmin: Boolean(isAdmin) }, { new: true });
  if (!user) throw ApiError.notFound('User not found');

  res.json({ success: true, user: user.toPublicJSON() });
});

// DELETE /api/admin/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid user id');

  const user = await User.findByIdAndDelete(id);
  if (!user) throw ApiError.notFound('User not found');

  res.json({ success: true, message: 'User deleted' });
});

// GET /api/admin/resources — paginated
export const getResources = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, q, type } = req.query;
  const pageNum  = Math.max(1, Number(page));
  const pageSize = Math.min(100, Math.max(1, Number(limit)));

  const filter = {};
  if (q)    filter.title = { $regex: q, $options: 'i' };
  if (type) filter.type  = type;

  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('subject', 'name code branch semester')
      .populate('uploadedBy', 'name email')
      .lean(),
    Resource.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / pageSize) || 1,
    resources,
  });
});

// DELETE /api/admin/resources/:id
export const deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid resource id');

  const resource = await Resource.findById(id).select('+filePublicId');
  if (!resource) throw ApiError.notFound('Resource not found');

  await destroyAsset(resource.filePublicId);
  await resource.deleteOne();

  await User.updateOne(
    { _id: resource.uploadedBy, uploadsCount: { $gt: 0 } },
    { $inc: { uploadsCount: -1 } }
  );

  res.json({ success: true, message: 'Resource deleted' });
});

// GET /api/admin/subjects — list subjects
export const getSubjects = asyncHandler(async (_req, res) => {
  const subjects = await Subject.find().sort({ branch: 1, semester: 1, name: 1 }).lean();
  res.json({ success: true, subjects });
});
