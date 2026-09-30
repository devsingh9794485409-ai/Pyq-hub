// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'CHE', 'AIML', 'DS'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // By default queries me nahi aayega
    },
    branch: {
      type: String,
      required: true,
      uppercase: true,
      enum: BRANCHES,
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    uploadsCount: { type: Number, default: 0, min: 0 },
    upvotesReceived: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Password hash karo save karne se pehle
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password compare karne ka method
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Public JSON — password hata ke
userSchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    branch: this.branch,
    semester: this.semester,
    uploadsCount: this.uploadsCount,
    upvotesReceived: this.upvotesReceived,
    createdAt: this.createdAt,
  };
};

export const BRANCH_LIST = BRANCHES;
export default mongoose.model('User', userSchema);