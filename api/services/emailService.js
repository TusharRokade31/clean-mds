import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure your email transporter - CORRECTED METHOD NAME
const transporter = nodemailer.createTransport({  // Changed from createTransporter
  service: 'gmail', // or your email service
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'rokadetushar122@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'soee kclp vwns awgk' // Use app password for Gmail
  }
});


console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, propertyName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - Property Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification Required</h2>
        <p>You are registering the property: <strong>${propertyName}</strong></p>
        <p>Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1976d2; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};