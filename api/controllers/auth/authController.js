import Property from "../../models/Property";
import OTP from "../../models/OTP";

export const sendEmailOTP = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await OTP.findOneAndUpdate(
      { email, propertyId, userId: req.user._id },
      { 
        otp,
        verified: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      },
      { upsert: true, new: true }
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, property.placeName || 'Your Property');
    
    if (!emailResult.success) {
      return errorResponse(res, 500, 'Failed to send OTP email', emailResult.error);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email'
    });

  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};


// Verify OTP
export const verifyEmailOTP = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { email, otp } = req.body;

    if (!email || !otp) {
      return errorResponse(res, 400, 'Email and OTP are required');
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ 
      email, 
      propertyId, 
      userId: req.user._id,
      verified: false
    });

    if (!otpRecord) {
      return errorResponse(res, 400, 'Invalid or expired OTP');
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return errorResponse(res, 400, 'Invalid OTP');
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return errorResponse(res, 400, 'OTP has expired');
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // UPDATE: Mark email as verified in the property
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });

    if (property) {
      property.emailVerified = true;
      await property.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      property // Return updated property
    });

  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};


export const checkEmailVerificationStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    return res.status(200).json({
      success: true,
      emailVerified: property.emailVerified || false,
      email: property.email
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};



// Save Step 3: Property Amenities
export const saveAmenities = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const { amenities } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Process amenities data
    // The data should be structured as:
    // { mandatory: { AirConditioning: { available: true, option: 'room controlled', subOptions: ['All-Weather'] } } }
    property.amenities = amenities;
    property.formProgress.step3Completed = true;
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Amenities saved successfully',
      property
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};
