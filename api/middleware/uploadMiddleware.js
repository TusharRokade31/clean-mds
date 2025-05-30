// Enhanced uploadMiddleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set storage engine with dynamic destination based on resource type
export const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = 'uploads/properties';
    
    const url = req.originalUrl.toLowerCase();
    if (url.includes('/states') && !url.includes('/cities')) {
      uploadPath = 'uploads/states';
    } else if (url.includes('/cities')) {
      uploadPath = 'uploads/cities';
    } else if (url.includes('/media')) {
      // Create separate folders for images and videos
      uploadPath = file.mimetype.startsWith('video/') 
        ? 'uploads/properties/videos' 
        : 'uploads/properties/images';
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    let prefix = 'property';
    
    const url = req.originalUrl.toLowerCase();
    if (url.includes('/states') && !url.includes('/cities')) {
      prefix = 'state';
    } else if (url.includes('/cities')) {
      prefix = 'city';
    } else if (url.includes('/media')) {
      prefix = file.mimetype.startsWith('video/') ? 'video' : 'image';
    }
    
    cb(
      null,
      `${prefix}-${req.params.propertyId || 'new'}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Enhanced file type checking for images and videos
function checkFileType(file, cb) {
  const imageTypes = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|avi|mov|wmv|flv|webm/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage = imageTypes.test(extname.substring(1)) && mimetype.startsWith('image/');
  const isVideo = videoTypes.test(extname.substring(1)) && mimetype.startsWith('video/');

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb('Error: Only images (JPEG, JPG, PNG, GIF, WebP) and videos (MP4, AVI, MOV, WMV, FLV, WebM) are allowed!');
  }
}

// Standard upload for single files
export const upload = multer({
  storage,
  limits: { fileSize: 10000000 }, // 10MB limit for images
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Enhanced upload for multiple media files with higher limits
export const uploadMedia = multer({
  storage,
  limits: { 
    fileSize: 100000000, // 100MB limit for videos
    files: 20 // Maximum 20 files at once
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

