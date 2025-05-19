// Modified uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';


// Set storage engine with dynamic destination based on resource type
export const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determine the upload destination based on the route
    let uploadPath = 'uploads/properties';
    
    // Check if the route is for states or cities
    const url = req.originalUrl.toLowerCase();
    if (url.includes('/states') && !url.includes('/cities')) {
      uploadPath = 'uploads/states';
    } else if (url.includes('/cities')) {
      uploadPath = 'uploads/cities';
    }
    
    // Create directory if it doesn't exist
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Generate appropriate filename based on resource type
    let prefix = 'property';
    
    // Check if the route is for states or cities
    const url = req.originalUrl.toLowerCase();
    if (url.includes('/states') && !url.includes('/cities')) {
      prefix = 'state';
    } else if (url.includes('/cities')) {
      prefix = 'city';
    }
    
    cb(
      null,
      `${prefix}-${req.params.id || 'new'}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
export const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});