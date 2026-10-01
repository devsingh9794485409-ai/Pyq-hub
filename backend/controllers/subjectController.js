// backend/controllers/subjectController.js
import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/subjects?branch=CSE&semester=3
export const getSubjects = asyncHandler(async (req, res) => {
  const { branch, semester } = req.query;
  if (!branch || !semester) throw ApiError.badRequest('branch and semester are required');

  const sem = Number(semester);
  if (!Number.isInteger(sem) || sem < 1 || sem > 8) throw ApiError.badRequest('Invalid semester');

  const subjects = await Subject.aggregate([
    {
      $match: {
        branch: branch.toUpperCase(),
        semester: sem,
      },
    },
    {
      $lookup: {
        from: 'resources',
        localField: '_id',
        foreignField: 'subject',
        as: 'resources',
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        branch: 1,
        semester: 1,
        createdAt: 1,
        updatedAt: 1,
        resourceCount: { $size: '$resources' },
      },
    },
    { $sort: { code: 1 } },
  ]);

  res.json({ success: true, count: subjects.length, subjects });
});

// GET /api/subjects/:id
export const getSubjectById = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw ApiError.badRequest('Invalid subject id');
  }

  const subject = await Subject.findById(req.params.id).lean();
  if (!subject) throw ApiError.notFound('Subject not found');

  const resourceCount = await Resource.countDocuments({ subject: subject._id });

  res.json({ success: true, subject: { ...subject, resourceCount } });
});