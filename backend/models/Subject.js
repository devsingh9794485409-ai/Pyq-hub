// backend/models/Subject.js
import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    branch: { type: String, required: true, uppercase: true, trim: true, index: true },
    semester: { type: Number, required: true, min: 1, max: 8, index: true },
  },
  { timestamps: true }
);

// Unique — same branch + semester + code ek hi baar
subjectSchema.index({ branch: 1, semester: 1, code: 1 }, { unique: true });

export default mongoose.model('Subject', subjectSchema);