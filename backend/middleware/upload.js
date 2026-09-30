// backend/middleware/upload.js
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(ApiError.badRequest('Only PDF, DOC/DOCX or image files are allowed'));
    }
    cb(null, true);
  },
});

export const singleFile = upload.single('file');
export default upload;