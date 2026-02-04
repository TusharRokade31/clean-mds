import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Configure your email transporter - CORRECTED METHOD NAME
const transporter = nodemailer.createTransport({  // Changed from createTransporter
  service: 'gmail', // or your email service
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
  },
});


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
        <p>You are registering the property</p>
        <p>Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1976d2; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};



// emailService.js

export const sendBookingConfirmationEmail = async (booking, policy = {}) => {
  const { primaryGuest, bookingId, checkIn, checkOut } = booking;
  const property = booking.property || {};
  
  // Format Property Address from location object
  const loc = property.location || {};
  const propertyAddress = `${loc.houseName ? loc.houseName + ', ' : ''}${loc.street}, ${loc.city}, ${loc.state} - ${loc.postalCode}`;

  // Policy formatting logic
  const checkInTime = policy.checkInCheckOut?.checkInTime || '12:00 pm (noon)';
  const checkOutTime = policy.checkInCheckOut?.checkOutTime || '12:00 pm (noon)';
  const unmarriedCouples = policy.propertyRules?.guestProfile?.allowUnmarriedCouples;
  
  // Format Identity Proofs enum to readable text
  const acceptedIDs = policy.propertyRules?.acceptableIdentityProofs
    ?.map(id => id.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()))
    .join(', ') || 'National ID';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: primaryGuest.email,
    subject: 'Booking Confirmation – Your Reservation Has Been Accepted!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <p>Dear ${primaryGuest.firstName} ${primaryGuest.lastName},</p>
        <p>We’re thrilled to let you know that your booking at <strong>${property.placeName}</strong> has been confirmed! 🎉</p>
        
        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Booking Details:</h3>
        <p><strong>Reservation ID:</strong> ${bookingId}</p>
        <p><strong>Check-in Date:</strong> ${new Date(checkIn).toDateString()} (After ${checkInTime})</p>
        <p><strong>Check-out Date:</strong> ${new Date(checkOut).toDateString()} (Before ${checkOutTime})</p>
        <p><strong>Host:</strong> ${property.placeName}</p>
        <p><strong>Location:</strong> ${propertyAddress}</p>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Host Contact Information:</h3>
        <p><strong>Phone:</strong> ${property.mobileNumber || 'N/A'}</p>
        <p><strong>Email:</strong> ${property.email || 'N/A'}</p>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Cancellation Policy:</h3>
        <p>Please note the following cancellation terms:</p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>• Cancelling more than 3 days before check-in: 90% refund.</li>
          <li>• Cancelling 3 days before check-in: 50% refund.</li>
          <li>• Cancelling within 24 hours of check-in: 0% refund.</li>
        </ul>

        <h3 style="border-bottom: 1px solid #eee; padding-bottom: 5px;">Important Dharamshala Policies:</h3>
        <ul>
          <li><strong>Guest Profile:</strong> ${unmarriedCouples ? "Unmarried couples are welcome." : "Unmarried couples are not allowed."}</li>
          <li><strong>ID Requirements:</strong> Original ID proof is mandatory. Accepted: ${acceptedIDs}.</li>
          <li><strong>Food:</strong> ${policy.propertyRestrictions?.nonVegetarianFood?.allowed ? "Non-vegetarian food is allowed." : "Only vegetarian food is allowed."}</li>
          <li><strong>Alcohol & Smoking:</strong> ${policy.propertyRestrictions?.alcoholSmoking?.alcoholAllowed ? "Alcohol is allowed." : "Alcohol is strictly prohibited."}</li>
          <li><strong>Quiet Hours:</strong> Quiet hours are observed between ${policy.propertyRestrictions?.noiseRestrictions?.quietHours?.startTime} and ${policy.propertyRestrictions?.noiseRestrictions?.quietHours?.endTime}.</li>
          <li><strong>Pets:</strong> ${policy.petPolicy?.petsAllowed ? "Pets are allowed." : "Pets are not allowed."}</li>
        </ul>

        <p>If you have any questions, special requests, or need assistance with anything, feel free to reach out to us at <strong>${property.email}</strong>.</p>
        
        <p>Thank you for choosing MyDivineStays! We hope you have an amazing experience and a peaceful stay.</p>
        
        <p>Safe travels,<br>
        <strong>MyDivineStays Team</strong></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email Dispatch Error:', error);
  }
};