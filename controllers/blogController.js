const { validationResult } = require('express-validator');
const Blog = require('../models/Blog');
const cloudinary = require('cloudinary').v2;
const { uploadImage } = require('../utils/cloudinary');

// GET all published blogs
exports.getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      query.tags = { $in: tags };
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture')
      .select('-content');

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// GET single blog
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture bio socialLinks')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      });

    if (!blog) return res.status(404).json({ msg: 'Blog not found' });

    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Blog not found' });
    res.status(500).send('Server Error');
  }
};

// CREATE blog
exports.createBlog = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { title, content, tags, customTags, status } = req.body;

    // Process and validate tags
    let parsedTags = [];
    try {
      parsedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? JSON.parse(tags) : []);
    } catch (err) {
      console.error('Error parsing tags:', err, 'Raw tags value:', tags);
      return res.status(400).json({ message: 'Invalid tags format' });
    }

    // Process and validate custom tags
    let parsedCustomTags = [];
    try {
      parsedCustomTags = Array.isArray(customTags) 
        ? customTags 
        : (typeof customTags === 'string' ? JSON.parse(customTags) : []);
    } catch (err) {
      console.error('Error parsing customTags:', err);
      return res.status(400).json({ message: 'Invalid custom tags format' });
    }

    // Handle featured image upload
    let featuredImageUrl = '';
    if (req.file) {
      console.log('File received:', req.file.originalname, 'Size:', req.file.size, 'Mimetype:', req.file.mimetype);
      
      try {
        featuredImageUrl = await uploadImage(req.file.buffer, req.file.mimetype, 'techsphere/featured-images');
        console.log('Image uploaded successfully to:', featuredImageUrl);
      } catch (uploadErr) {
        console.error('Error uploading image:', uploadErr);
        // Continue without image if upload fails
        featuredImageUrl = '';
      }
    }

    // Generate excerpt from content if not provided
    // Ensure the excerpt is no longer than 300 characters (schema maximum)
    let excerpt = '';
    if (req.body.excerpt && req.body.excerpt.trim()) {
      // If excerpt is provided, ensure it doesn't exceed 300 characters
      excerpt = req.body.excerpt.trim().substring(0, 297) + '...';
    } else {
      // Generate excerpt from content
      const plainText = content
        .replace(/<[^>]+>/g, ' ')  // Remove HTML tags if any
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .trim();
      excerpt = plainText.substring(0, 297) + '...';
    }

    const blog = new Blog({
      title,
      content,
      excerpt,
      tags: parsedTags,
      customTags: parsedCustomTags,
      author: req.user.id,
      status: status || 'draft',
      featuredImage: featuredImageUrl
    });

    try {
      await blog.save();
      res.json(blog);
    } catch (validationErr) {
      console.error('Validation error:', validationErr);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErr.errors ? Object.keys(validationErr.errors).map(key => ({
          field: key,
          message: validationErr.errors[key].message
        })) : []
      });
    }
  } catch (err) {
    console.error('Server error in createBlog:', err.message);
    res.status(500).send('Server Error');
  }
};

// UPDATE blog
exports.updateBlog = async (req, res) => {
  try {
    const { title, content, tags, customTags, status } = req.body;

    let blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ msg: 'Blog not found' });
    if (blog.author.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    let featuredImageUrl = blog.featuredImage;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'techsphere/featured-images'
      });
      featuredImageUrl = result.secure_url;

      if (blog.featuredImage) {
        const publicId = blog.featuredImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`techsphere/featured-images/${publicId}`);
      }
    }

    const excerpt = content.substring(0, 300) + (content.length > 300 ? '...' : '');

    blog.title = title;
    blog.content = content;
    blog.excerpt = excerpt;
    blog.tags = JSON.parse(tags);
    blog.customTags = customTags ? JSON.parse(customTags) : [];
    blog.status = status || blog.status;
    blog.featuredImage = featuredImageUrl;

    await blog.save();
    res.json(blog);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Blog not found' });
    res.status(500).send('Server Error');
  }
};

// DELETE blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ msg: 'Blog not found' });
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (blog.featuredImage) {
      const publicId = blog.featuredImage.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`techsphere/featured-images/${publicId}`);
    }

    await blog.remove();
    res.json({ msg: 'Blog removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Blog not found' });
    res.status(500).send('Server Error');
  }
};

// LIKE or UNLIKE blog
exports.toggleLikeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ msg: 'Blog not found' });

    const isLiked = blog.likes.some(id => id.toString() === req.user.id);

    if (isLiked) {
      blog.likes = blog.likes.filter(id => id.toString() !== req.user.id);
      blog.likesCount -= 1;
    } else {
      blog.likes.push(req.user.id);
      blog.likesCount += 1;
    }

    await blog.save();
    res.json({ likes: blog.likes, likesCount: blog.likesCount });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Blog not found' });
    res.status(500).send('Server Error');
  }
};

// GET blogs by user
exports.getBlogsByUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { author: req.params.userId, status: 'published' };

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture')
      .select('-content');

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'User not found' });
    res.status(500).send('Server Error');
  }
};
