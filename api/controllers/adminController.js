// controllers/adminController.js
import User from '../models/User.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');
  
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role } = req.body;
  
  // Build update object
  const updateFields = {};
  if (name) updateFields.name = name;
  if (email) updateFields.email = email;
  if (role) updateFields.role = role;
  
  const user = await User.findByIdAndUpdate(
    req.params.id, 
    updateFields, 
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: {}
  });
});