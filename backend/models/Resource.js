// backend/models/Resource.js
import mongoose from 'mongoose';

export const RESOURCE_TYPES = [
  'PYQ',
  'Notes',
  'Sessional',
  'Syllabus',
  'Assignment',
  'LabManual',
  'QuestionBank',
  'ImportantQuestions',
  'StudyMaterial',
  'Other',
];

export const EXAM_CATEGORIES = ['Mid-Sem', 'End-Sem', 'Class Test', 'Practical', 'Other'];

const resourceSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: RESOURCE_TYPES,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    fileUrl:      { type: String, required: true },
    filePublicId: { type: String, select: false },
    fileSize:     { type: Number },
    fileFormat:   { type: String },

    // ── Academic metadata ────────────────────────────────────
    year:         { type: Number, min: 1990, max: 2100 },
    academicYear: { type: String, trim: true },         // e.g. "2024-25"
    category:     { type: String, enum: EXAM_CATEGORIES },  // Mid-Sem, End-Sem etc.
    tags:         [{ type: String, trim: true, maxlength: 30 }],

    // ── Engagement ───────────────────────────────────────────
    upvotes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloadCount: { type: Number, default: 0, min: 0, index: true },
  },
  { timestamps: true }
);

// Compound indexes for common queries
resourceSchema.index({ subject: 1, type: 1, createdAt: -1 });
resourceSchema.index({ subject: 1, category: 1, createdAt: -1 });
resourceSchema.index({ uploadedBy: 1, createdAt: -1 });

// Full-text search index
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Resource', resourceSchema);