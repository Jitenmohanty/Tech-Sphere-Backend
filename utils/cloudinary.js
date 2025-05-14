// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image buffer to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} mimetype - Image mimetype
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{secure_url: string, public_id: string}>} - Upload result
 */
const uploadImage = async (buffer, mimetype, folder = 'techsphere') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id
          });
        } else {
          reject(error);
        }
      }
    );

    // Convert buffer to a readable stream
    const { Readable } = require('stream');
    const stream = Readable.from(buffer);
    stream.pipe(uploadStream);
  });
};

/**
 * Deletes an image from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @returns {Promise}
 */
const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Extracts public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
  return matches ? matches[1] : null;
};

module.exports = {
  uploadImage,
  deleteImage,
  getPublicIdFromUrl
};