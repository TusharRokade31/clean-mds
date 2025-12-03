// controllers/userController.js - Updated with profile photo functionality
import User from '../models/User.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import { uploadToS3, deleteFromS3, extractS3Key } from '../services/s3Service.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// @desc    Get current user
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, gender, dateOfBirth, address, phoneNumber, maritalStatus, state, city } = req.body;
  
  // Build update object
  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (gender) updateFields.gender = gender;
  if (maritalStatus) updateFields.maritalStatus = maritalStatus;
  if (state) updateFields.state = state;
  if (city) updateFields.city = city;
  if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
  if (address) updateFields.address = address;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  
  const user = await User.findByIdAndUpdate(
    req.user._id, 
    updateFields, 
    { new: true, runValidators: true },
  );
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Upload profile photo
// @route   POST /api/users/upload-profile-photo
// @access  Private
export const uploadProfilePhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }
console.log(req.owner)
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Delete old profile photo if exists
  if (user.profilePhoto) {
    try {
      const oldKey = extractS3Key(user.profilePhoto);
      if (oldKey) {
        await deleteFromS3(oldKey);
      }
    } catch (error) {
      console.error('Error deleting old profile photo:', error);
      // Continue with upload even if deletion fails
    }
  }

  // Generate unique filename
  const fileExtension = path.extname(req.file.originalname);
  const fileName = `profile-photos/${user._id}-${uuidv4()}${fileExtension}`;

  // Upload to S3
  const photoUrl = await uploadToS3(req.file, fileName);

  // Update user profile photo
  user.profilePhoto = photoUrl;
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      profilePhoto: photoUrl,
    },
    message: 'Profile photo uploaded successfully',
  });
});

// @desc    Delete profile photo
// @route   DELETE /api/users/delete-profile-photo
// @access  Private
export const deleteProfilePhoto = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (!user.profilePhoto) {
    return next(new ErrorResponse('No profile photo to delete', 400));
  }

  // Delete from S3
  const key = extractS3Key(user.profilePhoto);
  if (key) {
    await deleteFromS3(key);
  }

  // Update user
  user.profilePhoto = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile photo deleted successfully',
  });
});