import multer from 'multer';
import { Readable } from 'stream';
import cloudinary from '../config/cloudinary.js';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedDocs = ['application/pdf'];
    const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime'];

    const allowed = [...allowedImages, ...allowedDocs, ...allowedVideos];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

export const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
