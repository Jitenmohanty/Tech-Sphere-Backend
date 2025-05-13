const multer = require('multer');

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory as Buffer
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Allow only one file
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;