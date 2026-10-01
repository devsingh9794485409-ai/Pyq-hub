// backend/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadBuffer = (buffer, opts = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: opts.folder || process.env.CLOUDINARY_FOLDER || 'pyqhub',
        resource_type: 'auto',
        public_id: opts.publicId,
        overwrite: false,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

export const destroyAsset = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    const type = !resourceType || resourceType === 'auto' ? 'image' : resourceType;
    const res = await cloudinary.uploader.destroy(publicId, { resource_type: type });
    if (res?.result === 'not found' && type === 'image') {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }
    return res;
  } catch (err) {
    console.warn('Cloudinary destroy failed:', err.message);
  }
};

export default cloudinary;