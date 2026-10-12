// backend/config/cloudinary.js
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadBuffer = (buffer, opts = {}) =>
  new Promise((resolve, reject) => {
    const resource_type = opts.resource_type || 'auto';
    const uploadOptions = {
      folder: opts.folder || process.env.CLOUDINARY_FOLDER || 'pyqhub',
      resource_type,
      public_id: opts.publicId,
      overwrite: false,
      timeout: opts.timeout || 120000,
    };

    // For large buffers (> 10MB), use upload_chunked_stream with 6MB chunks to avoid socket timeouts
    const isLarge = buffer.length > 10 * 1024 * 1024;
    if (isLarge) {
      uploadOptions.chunk_size = 6000000;
    }

    const uploader = isLarge
      ? cloudinary.uploader.upload_chunked_stream.bind(cloudinary.uploader)
      : cloudinary.uploader.upload_stream.bind(cloudinary.uploader);

    const stream = uploader(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

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