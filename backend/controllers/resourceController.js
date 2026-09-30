// backend/controllers/resourceController.js
import mongoose from 'mongoose';
import Resource, { RESOURCE_TYPES } from '../models/Resource.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadBuffer, destroyAsset } from '../config/cloudinary.js';

const shape = (doc, userId) => ({
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
  hasUpvoted: userId ? (doc.upvotes ?? []).some((id) => String(id) === String(userId)) : false,
});

// GET /api/resources
export const getResources = asyncHandler(async (req, res) => {
  const { subject, type, branch, semester, q, sort = 'recent', page = 1, limit = 20 } = req.query;

  const filter = {};
  if (subject) {
    if (!mongoose.isValidObjectId(subject)) throw ApiError.badRequest('Invalid subject id');
    filter.subject = subject;
  }
  if (type) {
    if (!RESOURCE_TYPES.includes(type)) throw ApiError.badRequest('Invalid resource type');
    filter.type = type;
  }
  if (q) filter.title = { $regex: String(q).trim(), $options: 'i' };

  if (branch || semester) {
    const subjectFilter = {};
    if (branch) subjectFilter.branch = String(branch).toUpperCase();
    if (semester) subjectFilter.semester = Number(semester);
    const ids = await Subject.find(subjectFilter).distinct('_id');
    filter.subject = filter.subject ? filter.subject : { $in: ids };
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));

  const sortMap = {
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 },
    top: { upvotes: -1, createdAt: -1 },
  };

  const [docs, total] = await Promise.all([
    Resource.find(filter)
      .sort(sortMap[sort] ?? sortMap.recent)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('subject', 'name code branch semester')
      .populate('uploadedBy', 'name branch semester')
      .lean(),
    Resource.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / pageSize) || 1,
    resources: docs.map((d) => shape(d, req.user?._id)),
  });
});

// POST /api/resources
export const createResource = asyncHandler(async (req, res) => {
  const { subject, type, title, year } = req.body ?? {};

  if (!mongoose.isValidObjectId(subject)) throw ApiError.badRequest('A valid subject is required');
  if (!RESOURCE_TYPES.includes(type)) throw ApiError.badRequest('Invalid resource type');
  if (!title || title.trim().length < 4) {
    throw ApiError.badRequest('Title must be at least 4 characters');
  }
  if (!req.file) throw ApiError.badRequest('A file is required');

  let parsedYear;
  if (year !== undefined && year !== '' && year !== null) {
    parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1990 || parsedYear > 2100) {
      throw ApiError.badRequest('Year must be between 1990 and 2100');
    }
  }

  const subjectDoc = await Subject.findById(subject);
  if (!subjectDoc) throw ApiError.notFound('Subject not found');

  const safeName = title.trim().replace(/[^a-z0-9]+/gi, '-').slice(0, 60).toLowerCase();
  const uploaded = await uploadBuffer(req.file.buffer, {
    folder: `${process.env.CLOUDINARY_FOLDER || 'pyqhub'}/${subjectDoc.branch}/sem${subjectDoc.semester}`,
    publicId: `${subjectDoc.code}-${type}-${safeName}-${Date.now()}`,
  });

  let resource;
  try {
    resource = await Resource.create({
      subject: subjectDoc._id,
      uploadedBy: req.user._id,
      type,
      title: title.trim(),
      year: parsedYear,
      fileUrl: uploaded.secure_url,
      filePublicId: uploaded.public_id,
      fileSize: uploaded.bytes,
      fileFormat: uploaded.format,
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadsCount: 1 } });
  } catch (err) {
    await destroyAsset(uploaded.public_id);
    throw err;
  }

  await resource.populate([
    { path: 'subject', select: 'name code branch semester' },
    { path: 'uploadedBy', select: 'name branch semester' },
  ]);

  res.status(201).json({ success: true, resource: shape(resource.toObject(), req.user._id) });
});

// POST /api/resources/:id/upvote
export const toggleUpvote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid resource id');

  const resource = await Resource.findById(id);
  if (!resource) throw ApiError.notFound('Resource not found');

  const userId = req.user._id;
  const idx = resource.upvotes.findIndex((u) => String(u) === String(userId));
  const upvoted = idx === -1;

  if (upvoted) resource.upvotes.push(userId);
  else resource.upvotes.splice(idx, 1);

  await resource.save();

  await User.updateOne(
    { _id: resource.uploadedBy, ...(upvoted ? {} : { upvotesReceived: { $gt: 0 } }) },
    { $inc: { upvotesReceived: upvoted ? 1 : -1 } }
  );

  res.json({
    success: true,
    upvoted,
    upvoteCount: resource.upvotes.length,
    resourceId: resource._id,
  });
});