import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import s3Client, { getUploadFolder } from '../config/s3Config.js';

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

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

// Document file type checking
function checkDocumentType(file, cb) {
  const documentTypes = /pdf|doc|docx|jpeg|jpg|png/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isDocument = documentTypes.test(extname.substring(1)) && 
    (mimetype === 'application/pdf' || 
     mimetype.startsWith('image/') || 
     mimetype.startsWith('application/msword') ||
     mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

  if (isDocument) {
    return cb(null, true);
  } else {
    cb('Error: Only PDF, DOC, DOCX, JPEG, JPG, PNG files are allowed for documents!');
  }
}

// S3 Storage configuration
const s3Storage = multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, {
      fieldName: file.fieldname,
      originalName: file.originalname,
    });
  },
  key: function (req, file, cb) {
    const folder = getUploadFolder(req.originalUrl, file);
    const propertyId = req.params.propertyId || req.params.roomId || 'new';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    
    let prefix = 'property';
    const url = req.originalUrl.toLowerCase();
    
    if (url.includes('/states') && !url.includes('/cities')) {
      prefix = 'state';
    } else if (url.includes('/cities')) {
      prefix = 'city';
    } else if (url.includes('/media')) {
      prefix = file.mimetype.startsWith('video/') ? 'video' : 'image';
    } else if (url.includes('/legal') || url.includes('/document')) {
      prefix = 'document';
    }
    
    const key = `${folder}/${prefix}-${propertyId}-${timestamp}${ext}`;
    cb(null, key);
  },
});

// Standard upload for single files
export const upload = multer({
  storage: s3Storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  },
});

// Enhanced upload for multiple media files
export const uploadMedia = multer({
  storage: s3Storage,
  limits: { 
    fileSize: 100000000, // 100MB limit for videos
    files: 20,
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  },
});

// Document upload
export const uploadDocument = multer({
  storage: s3Storage,
  limits: { 
    fileSize: 15000000, // 15MB limit
  },
  fileFilter: function(req, file, cb) {
    checkDocumentType(file, cb);
  },
});

export const storage = s3Storage;