// controllers/userController.js - Updated update profile function
import User from '../models/User.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

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
  const { name ,email, gender, dateOfBirth, address, phoneNumber, maritalStatus, state, city } = req.body;
  
  // Build update object
  const updateFields = {};
  if (name) updateFields.fname = name;
  if (email) updateFields.email = email;
  if (gender) updateFields.gender = gender;
  if (maritalStatus) updateFields.maritalStatus = maritalStatus;
  if (state) updateFields.state = state;
  if (city) updateFields.city = city;
  if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
  if (address) updateFields.address = address;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  // if (username) updateFields.username = username;
  
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