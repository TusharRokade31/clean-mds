import { 
  DeleteObjectCommand, 
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/s3Config.js';

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Delete file from S3
export const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw error;
  }
};

// Generate presigned URL for temporary access
export const getPresignedUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

// Check if file exists in S3
export const fileExistsInS3 = async (key) => {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
};

// Extract S3 key from URL
export const extractS3Key = (url) => {
  if (!url) return null;
  
  // Handle different URL formats
  if (url.startsWith('http')) {
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  }
  
  // Direct key format
  return url;
};