// backend/controllers/subjectController.js
import Subject from '../models/Subject.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/subjects?branch=CSE&semester=3
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

  res.json({ success: true, count: subjects.length, subjects });
});

// GET /api/subjects/:id
export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id).lean();
  if (!subject) throw ApiError.notFound('Subject not found');
  res.json({ success: true, subject });
});