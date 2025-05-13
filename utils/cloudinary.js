// Updated uploadImage utility function
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} buffer - The image file buffer.
 * @param {string} mimetype - The mimetype of the image (e.g., 'image/jpeg').
 * @param {string} folder - The target folder in Cloudinary (e.g., 'techsphere/featured-images').
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
const uploadImage = async (buffer, mimetype, folder = '') => {
  if (!buffer) {
    console.error('Cloudinary upload failed: Invalid or missing buffer');
    throw new Error('Invalid image data');
  }

  try {
    // Convert buffer to base64 string
    const base64String = buffer.toString('base64');
    const dataURI = `data:${mimetype};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto', // Let Cloudinary detect the resource type
    });
    
    if (!result || !result.secure_url) {
      throw new Error('Failed to get secure URL from Cloudinary');
    }
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error.message || 'Unknown error');
    throw new Error('Image upload failed: ' + (error.message || 'Unknown error'));
  }
};

module.exports = { uploadImage };