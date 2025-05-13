const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    required: true,
    enum: ['JavaScript', 'Python', 'Web Development', 'Cyber Security', 'AI', 'Machine Learning', 'Data Science', 'Cloud Computing', 'DevOps', 'Mobile Development', 'Blockchain', 'Other']
  }],
  customTags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  comments: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Comment'
}],
  views: {
    type: Number,
    default: 0
  },
  featuredImage: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
BlogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search functionality
BlogSchema.index({ title: 'text', content: 'text', tags: 'text', customTags: 'text' });

module.exports = mongoose.model('Blog', BlogSchema);