import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User with this email already exists', 409));
  }
  
  // Create user
  const user = await User.create({
    name,
    email,
    password
  });

  sendTokenResponse(user, 201, res, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user
  });
});



export const logout = async (req, res) => {
  try {
    // Clear cookie with matching options
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};
export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User with this email already exists', 409));
  }
  
  // Create admin user
  const user = await User.create({
    name,
    email,
    password,
    role: 'admin'
  });

  sendTokenResponse(user, 201, res, 'Admin user created successfully');
});





// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    path: '/'
  };

  // Add secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Set the cookie
  res.cookie('token', token, cookieOptions);

  // Send response
  res.status(statusCode).json({
    success: true,
    message,
    token,
    userId: user._id
  });
};