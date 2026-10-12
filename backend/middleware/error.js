// backend/middleware/error.js
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || err.http_code || 500;
  let message = err.message || 'Server error';
  let details = err.details || null;

  if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 50 MB)' : `Upload error: ${err.code}`;
  }

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  }

  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value';
    details = err.keyValue;
  }

  if (status >= 500) {
    console.error(`❌ [Server Error] ${status} - ${message}:`, err);
  }

  // Never leak internal implementation details or stack traces to clients in production
  const clientMessage =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected server error occurred. Please try again later.'
      : message;

  res.status(status).json({
    success: false,
    message: clientMessage,
    ...(details ? { details } : {}),
  });
};