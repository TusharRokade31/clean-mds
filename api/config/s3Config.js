import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import path from 'path';

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3Client;

// Helper function to generate S3 key (path)
export const generateS3Key = (req, file, prefix) => {
  const timestamp = Date.now();
  const propertyId = req.params.propertyId || 'new';
  const ext = path.extname(file.originalname);
  
  return `${prefix}/${propertyId}/${timestamp}${ext}`;
};

// Helper function to get folder path based on URL
export const getUploadFolder = (url, file) => {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('/states') && !urlLower.includes('/cities')) {
    return 'states';
  } else if (urlLower.includes('/cities')) {
    return 'cities';
  } else if (urlLower.includes('/media')) {
    return file.mimetype.startsWith('video/') 
      ? 'properties/videos' 
      : 'properties/images';
  } else if (urlLower.includes('/legal') || urlLower.includes('/document')) {
    return 'properties/documents';
  }
  
  return 'properties';
};