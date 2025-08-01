// stayController.js
import Property from '../models/Property.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import fs from 'fs';
import Stay from '../models/Stay.js';

// @desc    Get all stays
// @route   GET /api/stays
// @access  Public
export const getAllstays = asyncHandler(async (req, res, next) => {
  // Build query based on request parameters
  let query = { active: true };
  
  // Check if featured filter is provided
  if (req.query.featured !== undefined) {
    query.featured = req.query.featured === 'true';
  }
  
  const stays = await Stay.find(query).sort({createdAt: 1});
  
  res.status(200).json({
    success: true,
    count: stays.length,
    data: stays,
  });
});


// @desc    Get single stay
// @route   GET /api/stays/:id
// @access  Public
export const getStay = asyncHandler(async (req, res, next) => {
  const stay = await Stay.findById(req.params.id);
  
  if (!stay) {
    return next(new ErrorResponse(`Stay not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: stay,
  });
});

// @desc    Create new stay
// @route   POST /api/stays
// @access  Private/Admin
export const createStay = asyncHandler(async (req, res, next) => {
  // Handle file upload
  let imagePath = null;
  if (req.file) {
    imagePath = req.file.path;
  }
  
  const stay = await Stay.create({
    ...req.body,
    image: imagePath,
  });
  
  res.status(201).json({
    success: true,
    data: stay,
  });
});

// @desc    Update stay
// @route   PUT /api/stays/:id
// @access  Private/Admin
export const updateStay = asyncHandler(async (req, res, next) => {
  let stay = await Stay.findById(req.params.id);
  
  if (!stay) {
    return next(new ErrorResponse(`Stay not found with id of ${req.params.id}`, 404));
  }
  
  // Handle file upload
  if (req.file) {
    // Delete old image if exists
    if (stay.image && fs.existsSync(stay.image)) {
      fs.unlinkSync(stay.image);
    }
    req.body.image = req.file.path;
  }
  
  stay = await Stay.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: stay,
  });
});

// @desc    Delete stay
// @route   DELETE /api/stays/:id
// @access  Private/Admin
export const deleteStay = asyncHandler(async (req, res, next) => {
    const stay = await Stay.findById(req.params.id);
  
  if (!stay) {
    return next(new ErrorResponse(`Stay not found with id of ${req.params.id}`, 404));
  }
  
  // Delete image if exists
  if (stay.image && fs.existsSync(stay.image)) {
    fs.unlinkSync(stay.image);
  }
  
  await stay.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get properties by stay
// @route   GET /api/stays/:id/properties
// @access  Public
export const getStayProperties = asyncHandler(async (req, res, next) => {
  const stay = await Stay.findById(req.params.id);
  
  if (!stay) {
    return next(new ErrorResponse(`Stay not found with id of ${req.params.id}`, 404));
  }
  
  // Find properties where stay matches
  const properties = await Property.find({
    'propertyType': stay.name,
    'status': 'published',
  }).populate('host', 'name email');
  
  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

