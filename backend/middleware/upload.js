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

// File size: 20 MB max (Phase 8)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(ApiError.badRequest('Only PDF, DOC/DOCX or image files are allowed'));
    }
    cb(null, true);
  },
});

// Phase 8: Binary magic-byte inspection
const MAGIC_BYTES = {
  pdf:  [0x25, 0x50, 0x44, 0x46], // %PDF
  jpeg: [0xFF, 0xD8, 0xFF],
  png:  [0x89, 0x50, 0x4E, 0x47], // .PNG
  webp: null, // checked by string "WEBP"
  doc:  [0xD0, 0xCF, 0x11, 0xE0], // OLE2 compound
  docx: [0x50, 0x4B, 0x03, 0x04], // ZIP (OOXML)
};

const matchesMagic = (buffer, bytes) =>
  bytes.every((b, i) => buffer[i] === b);

export const validateMagicBytes = (req, res, next) => {
  if (!req.file) return next();

  const buf  = req.file.buffer;
  const mime = req.file.mimetype;

  let valid = false;

  if (mime === 'application/pdf') {
    valid = buf.length >= 4 && matchesMagic(buf, MAGIC_BYTES.pdf);
  } else if (mime === 'image/jpeg') {
    valid = buf.length >= 3 && matchesMagic(buf, MAGIC_BYTES.jpeg);
  } else if (mime === 'image/png') {
    valid = buf.length >= 4 && matchesMagic(buf, MAGIC_BYTES.png);
  } else if (mime === 'image/webp') {
    // RIFF....WEBP
    valid = buf.length >= 12 &&
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
  } else if (mime === 'application/msword') {
    valid = buf.length >= 4 && matchesMagic(buf, MAGIC_BYTES.doc);
  } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    valid = buf.length >= 4 && matchesMagic(buf, MAGIC_BYTES.docx);
  }

  if (!valid) {
    return next(ApiError.badRequest('File content does not match its claimed type'));
  }
  next();
};

export const singleFile = [upload.single('file'), validateMagicBytes];
export default upload;