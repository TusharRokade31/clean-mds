// stateController.js
import State from '../models/State.js';
import City from '../models/City.js';
import Property from '../models/Property.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import fs from 'fs';
import path from 'path';

// @desc    Get all states
// @route   GET /api/states
// @access  Public
export const getAllStates = asyncHandler(async (req, res, next) => {
  // Build query based on request parameters
  let query = { active: true };
  
  // Check if featured filter is provided
  if (req.query.featured !== undefined) {
    query.featured = req.query.featured === 'true';
  }
  
  const states = await State.find(query);
  
  res.status(200).json({
    success: true,
    count: states.length,
    data: states,
  });
});


// @desc    Get single state
// @route   GET /api/states/:id
// @access  Public
export const getState = asyncHandler(async (req, res, next) => {
  const state = await State.findById(req.params.id);
  
  if (!state) {
    return next(new ErrorResponse(`State not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: state,
  });
});

// @desc    Create new state
// @route   POST /api/states
// @access  Private/Admin
export const createState = asyncHandler(async (req, res, next) => {
  // Handle file upload
  let imagePath = null;
  if (req.file) {
    imagePath = req.file.path;
  }
  
  const state = await State.create({
    ...req.body,
    image: imagePath,
  });
  
  res.status(201).json({
    success: true,
    data: state,
  });
});

// @desc    Update state
// @route   PUT /api/states/:id
// @access  Private/Admin
export const updateState = asyncHandler(async (req, res, next) => {
  let state = await State.findById(req.params.id);
  
  if (!state) {
    return next(new ErrorResponse(`State not found with id of ${req.params.id}`, 404));
  }
  
  // Handle file upload
  if (req.file) {
    // Delete old image if exists
    if (state.image && fs.existsSync(state.image)) {
      fs.unlinkSync(state.image);
    }
    req.body.image = req.file.path;
  }
  
  state = await State.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  res.status(200).json({
    success: true,
    data: state,
  });
});

// @desc    Delete state
// @route   DELETE /api/states/:id
// @access  Private/Admin
export const deleteState = asyncHandler(async (req, res, next) => {
  const state = await State.findById(req.params.id);
  
  if (!state) {
    return next(new ErrorResponse(`State not found with id of ${req.params.id}`, 404));
  }
  
  // Check if state has cities
  const cityCount = await City.countDocuments({ state: req.params.id });
  if (cityCount > 0) {
    return next(new ErrorResponse('Cannot delete state with associated cities. Please delete cities first.', 400));
  }
  
  // Delete image if exists
  if (state.image && fs.existsSync(state.image)) {
    fs.unlinkSync(state.image);
  }
  
  await state.remove();
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get properties by state
// @route   GET /api/states/:id/properties
// @access  Public
export const getStateProperties = asyncHandler(async (req, res, next) => {
  const state = await State.findById(req.params.id);
  
  if (!state) {
    return next(new ErrorResponse(`State not found with id of ${req.params.id}`, 404));
  }
  
  // Find properties where state matches
  const properties = await Property.find({
    'location.state': state.name,
    'status': 'published',
  }).populate('host', 'name email');
  
  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// CITY CONTROLLERS

// @desc    Get all cities
// @route   GET /api/states/cities
// @access  Public
export const getAllCities = asyncHandler(async (req, res, next) => {
  let query = { active: true };
  
  // Filter by state if provided
  if (req.query.state) {
    query.state = req.query.state;
  }
  
  // Check if featured filter is provided
  if (req.query.featured !== undefined) {
    query.featured = req.query.featured === 'true';
  }
  
  try {
    const cities = await City.find(query).populate('state', 'name code');
    
    res.status(200).json({
      success: true,
      count: cities.length,
      data: cities,
    });
  } catch (err) {
    console.error('Error in getAllCities:', err);
    next(err);
  }
});

// @desc    Get single city
// @route   GET /api/states/cities/:id
// @access  Public
export const getCity = asyncHandler(async (req, res, next) => {
  const city = await City.findById(req.params.id).populate('state', 'name code');
  
  if (!city) {
    return next(new ErrorResponse(`City not found with id of ${req.params.id}`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: city,
  });
});

// @desc    Create new city
// @route   POST /api/states/cities
// @access  Private/Admin
export const createCity = asyncHandler(async (req, res, next) => {
  // Verify state exists
  const state = await State.findById(req.body.state);
  
  if (!state) {
    return next(new ErrorResponse(`State not found with id of ${req.body.state}`, 404));
  }
  
  // Handle file upload
  let imagePath = null;
  if (req.file) {
    imagePath = req.file.path;
  }
  
  const city = await City.create({
    ...req.body,
    image: imagePath,
  });
  
  res.status(201).json({
    success: true,
    data: city,
  });
});

// @desc    Update city
// @route   PUT /api/states/cities/:id
// @access  Private/Admin
export const updateCity = asyncHandler(async (req, res, next) => {
  let city = await City.findById(req.params.id);
  
  if (!city) {
    return next(new ErrorResponse(`City not found with id of ${req.params.id}`, 404));
  }
  
  // If state is being updated, verify it exists
  if (req.body.state) {
    const state = await State.findById(req.body.state);
    if (!state) {
      return next(new ErrorResponse(`State not found with id of ${req.body.state}`, 404));
    }
  }
  
  // Handle file upload
  if (req.file) {
    // Delete old image if exists
    if (city.image && fs.existsSync(city.image)) {
      fs.unlinkSync(city.image);
    }
    req.body.image = req.file.path;
  }
  
  city = await City.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('state', 'name code');
  
  res.status(200).json({
    success: true,
    data: city,
  });
});

// @desc    Delete city
// @route   DELETE /api/states/cities/:id
// @access  Private/Admin
export const deleteCity = asyncHandler(async (req, res, next) => {
  const city = await City.findById(req.params.id);
  
  if (!city) {
    return next(new ErrorResponse(`City not found with id of ${req.params.id}`, 404));
  }
  
  // Delete image if exists
  if (city.image && fs.existsSync(city.image)) {
    fs.unlinkSync(city.image);
  }
  
  await city.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get properties by city
// @route   GET /api/states/cities/:id/properties
// @access  Public
export const getCityProperties = asyncHandler(async (req, res, next) => {
  const city = await City.findById(req.params.id).populate('state', 'name');
  
  if (!city) {
    return next(new ErrorResponse(`City not found with id of ${req.params.id}`, 404));
  }
  
  // Find properties where city matches
  const properties = await Property.find({
    'location.city': city.name,
    'status': 'published',
  }).populate('host', 'name email');
  
  res.status(200).json({
    success: true,
    count: properties.length,
    data: properties,
  });
});