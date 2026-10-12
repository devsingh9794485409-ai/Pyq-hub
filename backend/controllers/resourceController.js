// backend/controllers/resourceController.js
import mongoose from 'mongoose';
import Resource, { RESOURCE_TYPES, EXAM_CATEGORIES } from '../models/Resource.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinary, { uploadBuffer, destroyAsset } from '../config/cloudinary.js';

// Escape a string so it can be safely used in a RegExp (ReDoS protection)
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Extract Cloudinary public_id from a delivery URL if missing from record
export const extractPublicId = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return null;
  const match = fileUrl.match(/\/upload\/(?:s--[^/]+--\/)?(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
  return match ? match[1] : null;
};

const shape = (doc, userId) => ({
  _id:              doc._id,
  title:            doc.title,
  description:      doc.description,
  type:             doc.type,
  year:             doc.year,
  academicYear:     doc.academicYear,
  category:         doc.category,
  tags:             doc.tags ?? [],
  fileUrl:          doc.fileUrl,
  fileAccessUrl:    `/api/resources/${doc._id}/file`,
  fileFormat:       doc.fileFormat,
  fileSize:         doc.fileSize,
  fileResourceType: doc.fileResourceType ?? 'image',
  createdAt:        doc.createdAt,
  subject:          doc.subject,
  uploadedBy:       doc.uploadedBy,
  upvoteCount:      doc.upvotes?.length ?? 0,
  downloadCount:    doc.downloadCount ?? 0,
  hasUpvoted:       userId ? (doc.upvotes ?? []).some((id) => String(id) === String(userId)) : false,
  isBookmarked:     false, // resolved separately when needed
});

// GET /api/resources
export const getResources = asyncHandler(async (req, res) => {
  const {
    subject, type, branch, semester, category, year,
    q, sort = 'recent', page = 1, limit = 20,
  } = req.query;

  const filter = {};

  if (subject) {
    if (!mongoose.isValidObjectId(subject)) throw ApiError.badRequest('Invalid subject id');
    filter.subject = subject;
  }
  if (type) {
    if (!RESOURCE_TYPES.includes(type)) throw ApiError.badRequest('Invalid resource type');
    filter.type = type;
  }
  if (category) {
    if (!EXAM_CATEGORIES.includes(category)) throw ApiError.badRequest('Invalid category');
    filter.category = category;
  }
  if (year) {
    const y = Number(year);
    if (Number.isInteger(y) && y >= 1990 && y <= 2100) filter.year = y;
  }
  if (q) {
    const safe = escapeRegex(String(q).trim());
    filter.title = { $regex: safe, $options: 'i' };
  }

  if (branch || semester) {
    const subjectFilter = {};
    if (branch)   subjectFilter.branch   = String(branch).toUpperCase();
    if (semester) subjectFilter.semester = Number(semester);
    const ids = await Subject.find(subjectFilter).distinct('_id');
    filter.subject = filter.subject ? filter.subject : { $in: ids };
  }

  const pageNum  = Math.max(1, Number(page)  || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 20));

  const sortMap = {
    recent:    { createdAt: -1 },
    oldest:    { createdAt: 1 },
    top:       { 'upvotes': -1, createdAt: -1 },
    downloads: { downloadCount: -1, createdAt: -1 },
  };

  const [docs, total] = await Promise.all([
    Resource.find(filter)
      .sort(sortMap[sort] ?? sortMap.recent)
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .populate('subject',    'name code branch semester')
      .populate('uploadedBy', 'name branch semester avatarUrl')
      .lean(),
    Resource.countDocuments(filter),
  ]);

  // Resolve bookmarks for authenticated user
  const userBookmarks = req.user?.bookmarks?.map(String) ?? [];

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / pageSize) || 1,
    resources: docs.map((d) => ({
      ...shape(d, req.user?._id),
      isBookmarked: userBookmarks.includes(String(d._id)),
    })),
  });
});

// POST /api/resources
export const createResource = asyncHandler(async (req, res) => {
  const { subject, type, title, year, academicYear, category, tags, description } = req.body ?? {};

  if (!mongoose.isValidObjectId(subject)) throw ApiError.badRequest('A valid subject is required');
  if (!RESOURCE_TYPES.includes(type))     throw ApiError.badRequest('Invalid resource type');
  if (!title || title.trim().length < 4)  throw ApiError.badRequest('Title must be at least 4 characters');
  if (!req.file)                          throw ApiError.badRequest('A file is required');

  // Category validation
  if (category && !EXAM_CATEGORIES.includes(category)) {
    throw ApiError.badRequest('Invalid exam category');
  }

  let parsedYear;
  if (year !== undefined && year !== '' && year !== null) {
    parsedYear = Number(year);
    if (!Number.isInteger(parsedYear) || parsedYear < 1990 || parsedYear > 2100) {
      throw ApiError.badRequest('Year must be between 1990 and 2100');
    }
  }

  // Parse tags
  let parsedTags = [];
  if (tags) {
    parsedTags = (Array.isArray(tags) ? tags : String(tags).split(','))
      .map((t) => t.trim().slice(0, 30))
      .filter(Boolean)
      .slice(0, 10);
  }

  const subjectDoc = await Subject.findById(subject);
  if (!subjectDoc) throw ApiError.notFound('Subject not found');

  const safeName = title.trim().replace(/[^a-z0-9]+/gi, '-').slice(0, 60).toLowerCase();
  const isDoc = req.file.mimetype === 'application/msword' ||
    req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const resourceType = isDoc ? 'raw' : (req.file.mimetype === 'application/pdf' ? 'image' : 'auto');

  let uploaded;
  try {
    uploaded = await uploadBuffer(req.file.buffer, {
      folder: `${process.env.CLOUDINARY_FOLDER || 'pyqhub'}/${subjectDoc.branch}/sem${subjectDoc.semester}`,
      publicId: `${subjectDoc.code}-${type}-${safeName}-${Date.now()}`,
      resource_type: resourceType,
      timeout: 120000,
    });
  } catch (cloudErr) {
    console.error('❌ Cloudinary upload error:', cloudErr);
    if (cloudErr.http_code === 400 && cloudErr.message?.includes('File size too large')) {
      throw ApiError.badRequest(
        `Cloudinary storage limit reached: ${cloudErr.message}. The Cloudinary account Free plan caps individual files at 10 MB. A Cloudinary plan upgrade or account limit extension is required for larger files.`
      );
    }
    throw new ApiError(cloudErr.http_code || 502, cloudErr.message || 'Cloudinary upload failed');
  }

  let resource;
  try {
    resource = await Resource.create({
      subject:          subjectDoc._id,
      uploadedBy:       req.user._id,
      type,
      title:            title.trim(),
      description:      description?.trim() || '',
      year:             parsedYear,
      academicYear:     academicYear?.trim() || undefined,
      category:         category || undefined,
      tags:             parsedTags,
      fileUrl:          uploaded.secure_url,
      filePublicId:     uploaded.public_id,
      fileSize:         uploaded.bytes,
      fileFormat:       uploaded.format || (req.file.mimetype === 'application/pdf' ? 'pdf' : undefined),
      fileResourceType: uploaded.resource_type || resourceType,
    });
    await User.findByIdAndUpdate(req.user._id, { $inc: { uploadsCount: 1 } });
  } catch (err) {
    await destroyAsset(uploaded.public_id, uploaded.resource_type || resourceType);
    throw err;
  }

  await resource.populate([
    { path: 'subject',    select: 'name code branch semester' },
    { path: 'uploadedBy', select: 'name branch semester avatarUrl' },
  ]);

  res.status(201).json({ success: true, resource: shape(resource.toObject(), req.user._id) });
});

// DELETE /api/resources/:id  — owner or admin
export const deleteResource = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid resource id');

  const resource = await Resource.findById(id).select('+filePublicId');
  if (!resource) throw ApiError.notFound('Resource not found');

  const isOwner = String(resource.uploadedBy) === String(req.user._id);
  const isAdmin = req.user.isAdmin;

  if (!isOwner && !isAdmin) throw ApiError.forbidden('Not authorised to delete this resource');

  // Delete from Cloudinary
  const publicId = resource.filePublicId || extractPublicId(resource.fileUrl);
  if (publicId) {
    await destroyAsset(publicId, resource.fileResourceType || 'image');
  }

  // Remove resource
  await resource.deleteOne();

  // Decrement uploader's count
  await User.updateOne(
    { _id: resource.uploadedBy, uploadsCount: { $gt: 0 } },
    { $inc: { uploadsCount: -1 } }
  );

  res.json({ success: true, message: 'Resource deleted' });
});

// POST /api/resources/:id/upvote
export const toggleUpvote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid resource id');

  const resource = await Resource.findById(id);
  if (!resource) throw ApiError.notFound('Resource not found');

  const userId  = req.user._id;
  const idx     = resource.upvotes.findIndex((u) => String(u) === String(userId));
  const upvoted = idx === -1;

  if (upvoted) resource.upvotes.push(userId);
  else         resource.upvotes.splice(idx, 1);

  await resource.save();

  await User.updateOne(
    { _id: resource.uploadedBy, ...(upvoted ? {} : { upvotesReceived: { $gt: 0 } }) },
    { $inc: { upvotesReceived: upvoted ? 1 : -1 } }
  );

  res.json({
    success:     true,
    upvoted,
    upvoteCount: resource.upvotes.length,
    resourceId:  resource._id,
  });
});

// POST /api/resources/:id/bookmark  — toggle bookmark for the current user
export const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid resource id');

  const resource = await Resource.findById(id);
  if (!resource) throw ApiError.notFound('Resource not found');

  const userId     = req.user._id;
  const user       = await User.findById(userId);
  const idx        = user.bookmarks.findIndex((b) => String(b) === String(id));
  const bookmarked = idx === -1;

  if (bookmarked) user.bookmarks.push(id);
  else            user.bookmarks.splice(idx, 1);

  await user.save();

  res.json({ success: true, bookmarked, resourceId: id });
});

// POST /api/resources/:id/download  — increment download count
export const incrementDownload = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid resource id');

  const resource = await Resource.findByIdAndUpdate(
    id,
    { $inc: { downloadCount: 1 } },
    { new: true }
  );
  if (!resource) throw ApiError.notFound('Resource not found');

  // Increment uploader's downloadsReceived
  await User.updateOne({ _id: resource.uploadedBy }, { $inc: { downloadsReceived: 1 } });

  res.json({ success: true, downloadCount: resource.downloadCount });
});

// GET /api/resources/:id/file  — deliver or redirect to signed Cloudinary delivery URL
export const getResourceFile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid resource id');

  const resource = await Resource.findById(id).select('+filePublicId');
  if (!resource) throw ApiError.notFound('Resource not found');

  let publicId = resource.filePublicId;
  if (!publicId && resource.fileUrl) {
    publicId = extractPublicId(resource.fileUrl);
  }

  if (!publicId) {
    console.warn(`⚠️ Resource ${id} has no public_id. Falling back to direct fileUrl.`);
    return res.redirect(302, resource.fileUrl);
  }

  const format = resource.fileFormat || (resource.fileUrl?.endsWith('.pdf') ? 'pdf' : undefined);
  const resourceType = resource.fileResourceType || (format === 'doc' || format === 'docx' ? 'raw' : 'image');

  try {
    const signedUrl = cloudinary.utils.private_download_url(publicId, format || '', {
      resource_type: resourceType,
      type: 'upload',
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour validity
    });

    if (req.query.json === 'true' || req.headers.accept === 'application/json') {
      return res.json({ success: true, url: signedUrl });
    }

    return res.redirect(302, signedUrl);
  } catch (err) {
    console.error(`❌ Failed to generate signed URL for resource ${id}:`, err);
    if (req.accepts('html')) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Failed to load document</title></head>
        <body style="font-family:sans-serif;padding:3rem;text-align:center;color:#334155;">
          <h2>Unable to generate secure download link</h2>
          <p>Please check Cloudinary configuration or try again later.</p>
        </body>
        </html>
      `);
    }
    throw new ApiError(500, 'Failed to generate secure document URL');
  }
});