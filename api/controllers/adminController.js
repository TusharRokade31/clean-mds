// controllers/adminController.js
import User from '../models/User.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all users (only non-deleted users)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ isDeleted: false }).select('-password');
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get single user (only if not deleted)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res, next) => {
  console.log(req.params.id);
  const user = await User.findOne({ 
    _id: req.params.id, 
    isDeleted: false 
  }).select('-password');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user (only if not deleted)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  // Get allowed fields from the schema (excluding system fields)
  const allowedFields = Object.keys(User.schema.paths).filter(
    key => !['_id', '__v', 'password', 'isDeleted'].includes(key), // Exclude isDeleted from updates
  );
  const updateFields = {};

  // Dynamically add only valid fields from req.body
  Object.entries(req.body).forEach(([key, value]) => {
    if (allowedFields.includes(key)) {
      updateFields[key] = value;
    }
  });
  
  // If no valid field is present
  if (Object.keys(updateFields).length === 0) {
    return next(
      new ErrorResponse('No valid fields provided for update.', 400),
    );
  }
  
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false }, // Only update non-deleted users
    updateFields, 
    { new: true, runValidators: true },
  ).select('-password');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Soft delete user (set isDeleted to true)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  ).select('-password');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: user,
  });
});