const { check, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');

// Create a comment
exports.createComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { content, blog, parentComment } = req.body;
    
    // Check if blog exists
    const blogExists = await Blog.findById(blog);
    if (!blogExists) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    // Check if parent comment exists if provided
    if (parentComment) {
      const parentExists = await Comment.findById(parentComment);
      if (!parentExists) {
        return res.status(404).json({ msg: 'Parent comment not found' });
      }
    }
    
    const newComment = new Comment({
      content,
      blog,
      author: req.user.id,
      parentComment: parentComment || null
    });
    
    const comment = await newComment.save();
    
    // If this is a reply, add it to the parent comment's replies
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }
    
    // Add comment to blog's comments array
    await Blog.findByIdAndUpdate(blog, {
      $push: { comments: comment._id }
    });
    
    // Populate author info before sending response
    await comment.populate('author', 'username profilePicture');
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all comments for a blog
exports.getBlogComments = async (req, res) => {
  try {
    // Check if blog exists
    const blogExists = await Blog.findById(req.params.blogId);
    if (!blogExists) {
      return res.status(404).json({ msg: 'Blog not found' });
    }
    
    const comments = await Comment.find({
      blog: req.params.blogId,
      parentComment: null,
      isDeleted: false
    })
    .populate('author', 'username profilePicture')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username profilePicture'
      }
    })
    .sort({ createdAt: 1 });
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Check if comment is already deleted
    if (comment.isDeleted) {
      return res.status(400).json({ msg: 'Cannot update a deleted comment' });
    }
    
    comment.content = content;
    await comment.save();
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    let comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    // Check if user is the author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    // Soft delete the comment
    comment.isDeleted = true;
    comment.deletedBy = req.user.id;
    await comment.save();
    
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get all comments by a user
exports.getUserComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const comments = await Comment.find({
      author: req.params.userId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('blog', 'title')
    .populate('author', 'username profilePicture');
    
    const total = await Comment.countDocuments({
      author: req.params.userId,
      isDeleted: false
    });
    
    res.json({
      comments,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};