import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';
import config from '../config/config.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for token in Headers OR Cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  else if (req.cookies.token) {
    // Look for the token in cookies if not in header
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    // 3. If token is expired or invalid, CLEAR the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use same options as when you set it
    });

    return next(new ErrorResponse('Token expired or invalid. Please log in again.', 401));
  }
});


// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ErrorResponse('Not authorized', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    
    next();
  };
};