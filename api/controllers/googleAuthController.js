// api/controllers/googleAuthController.js
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import fetch from 'node-fetch';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    // Use the access_token to fetch user info from Google
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
    }
    
    const userData = await response.json();
    
    if (!userData.email) {
      throw new Error('Failed to get email from Google user info');
    }
    
    // Check if user exists
    let user = await User.findOne({ email: userData.email });
    
    // If not, create new user
    if (!user) {
      user = await User.create({
        name: userData.name,
        email: userData.email,
        password: Math.random().toString(36).slice(-8),
        profileImage: userData.picture,
        isGoogleAccount: true,
      });
    }
    
    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );
    
    // Set cookie options
    const cookieOptions = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      path: '/',
    };
    
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'lax'; // Changed from 'none'
      cookieOptions.domain = '.mydivinestays.com'; // Added domain
    }
    
    res.cookie('token', jwtToken, cookieOptions);
    
    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token: jwtToken,
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    next(error);
  }
};