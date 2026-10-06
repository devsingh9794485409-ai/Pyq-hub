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
      // Optional for Google/OAuth users who never set a password
      minlength: 6,
      select: false,
    },

    // ── OAuth fields ──────────────────────────────────────────
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true, // allows multiple nulls in the unique index
      unique: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },

    // ── Academic info ─────────────────────────────────────────
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

    // ── Stats ─────────────────────────────────────────────────
    uploadsCount:    { type: Number, default: 0, min: 0 },
    upvotesReceived: { type: Number, default: 0, min: 0 },
    downloadsReceived: { type: Number, default: 0, min: 0 },

    // ── Role ──────────────────────────────────────────────────
    isAdmin: { type: Boolean, default: false },

    // ── Bookmarks (Phase 7) ───────────────────────────────────
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],

    // ── Password reset (Phase 3) ──────────────────────────────
    passwordResetToken:  { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// Hash password before save (only when it is set and has changed)
userSchema.pre('save', async function hashPassword(next) {
  if (!this.password || !this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    _id:              this._id,
    name:             this.name,
    email:            this.email,
    avatarUrl:        this.avatarUrl,
    branch:           this.branch,
    semester:         this.semester,
    authProvider:     this.authProvider,
    uploadsCount:     this.uploadsCount,
    upvotesReceived:  this.upvotesReceived,
    downloadsReceived:this.downloadsReceived,
    isAdmin:          this.isAdmin,
    bookmarks:        this.bookmarks,
    createdAt:        this.createdAt,
  };
};

export const BRANCH_LIST = BRANCHES;
export default mongoose.model('User', userSchema);