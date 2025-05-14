const User = require('../models/User');
const Blog = require('../models/Blog');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2; // Using Cloudinary for image storage

// Configure Cloudinary (you'll need to set this up)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'profiles' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    
  });
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password -resetPasswordToken -resetPasswordExpire -googleId');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, bio, socialLinks } = req.body;
    
    // Handle socialLinks whether it comes as string or object
    let socialLinksData;
    try {
      socialLinksData = typeof socialLinks === 'string' 
        ? JSON.parse(socialLinks) 
        : socialLinks || {};
    } catch (parseError) {
      console.error('Error parsing socialLinks:', parseError);
      socialLinksData = {};
    }

    const updateData = { 
      username, 
      bio,
      socialLinks: {
        twitter: socialLinksData.twitter || '',
        github: socialLinksData.github || '',
        linkedin: socialLinksData.linkedin || '',
        website: socialLinksData.website || ''
      }
    };

    // Handle profile picture upload
    if (req.file) {
      try {
        // Delete old profile picture if it exists
        const user = await User.findById(req.user.id);
        if (user.profilePicture) {
          const publicId = user.profilePicture.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`profiles/${publicId}`);
        }

        // Upload new image to Cloudinary
        const result = await uploadToCloudinary(req.file);
        updateData.profilePicture = result.secure_url;
      } catch (uploadErr) {
        console.error('Error uploading image:', uploadErr);
        return res.status(500).json({ 
          success: false, 
          message: 'Error uploading profile picture' 
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire -googleId');

    res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get user's blogs
exports.getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.userId })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

      
      console.log(blogs)
    res.status(200).json({ success: true, data: blogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get current user profile (for editing)
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -resetPasswordToken -resetPasswordExpire -googleId');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};