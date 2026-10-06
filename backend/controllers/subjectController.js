// backend/controllers/subjectController.js
import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/subjects?branch=CSE&semester=3
// Phase 2: Include resource count aggregation
export const getSubjects = asyncHandler(async (req, res) => {
  const { branch, semester } = req.query;
  if (!branch || !semester) throw ApiError.badRequest('branch and semester are required');

  const sem = Number(semester);
  if (!Number.isInteger(sem) || sem < 1 || sem > 8) throw ApiError.badRequest('Invalid semester');

  const subjects = await Subject.find({
    branch: branch.toUpperCase(),
    semester: sem,
  })
    .sort({ code: 1 })
    .lean();

  // Aggregate resource counts per subject in a single query (Phase 2 / Phase 10)
  const subjectIds = subjects.map((s) => s._id);
  const counts = await Resource.aggregate([
    { $match: { subject: { $in: subjectIds } } },
    { $group: { _id: '$subject', count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

  const enriched = subjects.map((s) => ({
    ...s,
    resourceCount: countMap[String(s._id)] ?? 0,
  }));

  res.json({ success: true, count: subjects.length, subjects: enriched });
});

// GET /api/subjects/:id
export const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid subject id');

  const subject = await Subject.findById(id).lean();
  if (!subject) throw ApiError.notFound('Subject not found');

  // Include resource count
  const resourceCount = await Resource.countDocuments({ subject: id });

  res.json({ success: true, subject: { ...subject, resourceCount } });
});