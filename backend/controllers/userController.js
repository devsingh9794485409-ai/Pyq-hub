// backend/controllers/userController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Resource from '../models/Resource.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const shapeResource = (doc, currentUserId) => ({
  _id: doc._id,
  title: doc.title,
  type: doc.type,
  year: doc.year,
  fileUrl: doc.fileUrl,
  fileFormat: doc.fileFormat,
  createdAt: doc.createdAt,
  subject: doc.subject,
  uploadedBy: doc.uploadedBy,
  upvoteCount: doc.upvotes?.length ?? 0,
  hasUpvoted: currentUserId
    ? (doc.upvotes ?? []).some((id) => String(id) === String(currentUserId))
    : false,
});

// GET /api/users/:id
export const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest('Invalid user id');
  }

  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const uploads = await Resource.find({ uploadedBy: user._id })
    .sort({ createdAt: -1 })
    .populate('subject', 'name code branch semester')
    .populate('uploadedBy', 'name branch semester')
    .lean();

  res.json({
    success: true,
    user: user.toPublicJSON(),
    uploads: uploads.map((d) => shapeResource(d, req.user?._id)),
  });
});
