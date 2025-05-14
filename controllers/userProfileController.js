// controllers/userProfileController.js
const User = require('../models/User');
const Blog = require('../models/Blog');
const { validationResult } = require('express-validator');
const { 
  uploadImage, 
  deleteImage, 
  getPublicIdFromUrl 
} = require('../utils/cloudinary');

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
    
    // Handle socialLinks
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
        const user = await User.findById(req.user.id);
        
        // Delete old profile picture if it exists
        if (user.profilePicture) {
          const publicId = getPublicIdFromUrl(user.profilePicture);
          if (publicId) {
            await deleteImage(publicId);
          }
        }

        // Upload new image
        const { secure_url } = await uploadImage(
          req.file.buffer, 
          req.file.mimetype, 
          'techsphere/userProfile'
        );
        
        updateData.profilePicture = secure_url;
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