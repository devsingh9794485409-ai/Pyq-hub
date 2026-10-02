// backend/middleware/adminOnly.js
import ApiError from '../utils/ApiError.js';

/**
 * Must be used AFTER the `protect` middleware.
 * Rejects non-admin users with 403 Forbidden.
 */
export const adminOnly = (req, _res, next) => {
  if (!req.user?.isAdmin) {
    throw ApiError.forbidden('Admin access required');
  }
  next();
};

export default adminOnly;
