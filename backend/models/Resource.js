// backend/models/Resource.js
import mongoose from 'mongoose';

export const RESOURCE_TYPES = ['PYQ', 'Notes', 'Sessional'];

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
    fileUrl: { type: String, required: true },
    filePublicId: { type: String, select: false },
    fileSize: { type: Number },
    fileFormat: { type: String },
    year: { type: Number, min: 1990, max: 2100 },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

resourceSchema.index({ subject: 1, type: 1, createdAt: -1 });

export default mongoose.model('Resource', resourceSchema);