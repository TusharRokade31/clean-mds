import Property from '../../models/Property.js';
import fs from 'fs';
import path from 'path';
import City from '../../models/City.js';
import State from '../../models/State.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { unlink } from 'fs/promises';
import { generateOTP, sendOTPEmail } from '../../services/emailService.js';
import OTP from '../../models/OTP.js';
import {errorResponse} from '../globalError/errorController.js';
import { detectPropertyChanges, markForReapproval } from '../../helper/detectPropertyChanges.js';




// Get all properties (for admin or host) //moved to hostController
export const getAllProperties = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's properties
    if (req.user.role !== 'admin') {  
      query.owner = req.user._id;
    }
    
    const properties = await Property.find(query);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all draft properties (for admin or host) //moved to hostController
export const getDraftProperties = async (req, res) => {
  try {
    let query = { status: 'draft' }; 

  
    if (req.user.role !== 'admin') {
      query.owner = req.user._id;  
    }
    
    const draftProperties = await Property.find(query);

    res.status(200).json({
      success: true,
      count: draftProperties.length,
      data: draftProperties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single property
export const getViewProperty = async (req, res) => {
  try {
    // Search by slug instead of findById
    const property = await Property.findOne({ slug: req.params.slug });
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    
    // Check if user owns the property or is admin
   if (!(req.user?.role === "admin" || property.owner?.toString() === req.user._id.toString())) {
  return res.status(403).json({
    success: false,
    error: 'Not authorized to access this property',
  });
}
    
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

 
// Initialize a new property for multistep form //moved to propertyManageController
export const initializeProperty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { forceNew } = req.body;

    if (!forceNew) {
      const existingDraft = await Property.findOne({ 
        owner: userId, 
        'formProgress.formCompleted': false, 
      });

      if (existingDraft) {
        return res.status(200).json({
          success: true,
          message: 'Draft property found',
          property: existingDraft,
        });
      }
    }

    // Create with minimal required data - no placeholder values needed
const newProperty = await Property.create({
      owner: userId,
      propertyType: 'Dharamshala',
      placeName: '',
      placeRating: '',
      propertyBuilt: '',
      bookingSince: '',
      rentalForm: 'Entire place',
      email: '',
      mobileNumber: '',
      location: {
        houseName: '',
        country: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
      },
      amenities: {
        mandatory: new Map(),
        basicFacilities: new Map(),
        generalServices: new Map(),
        commonArea: new Map(),
        foodBeverages: new Map(),
        healthWellness: new Map(),
        mediaTechnology: new Map(),
        paymentServices: new Map(),
        security: new Map(),
        safety: new Map(),
      },
      rooms: [],
      formProgress: {
        step1Completed: false,
        step2Completed: false,
        step3Completed: false,
        step4Completed: false,
        step5Completed: false,
        step6Completed: false,
        step7Completed: false,
        formCompleted: false,
      },
    });

    // Save without validation for initial draft
    await newProperty.save({ validateBeforeSave: false });

    return res.status(201).json({
      success: true,
      message: 'New property draft created',
      property: newProperty,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
// Initialize a new property for multistep form //moved to /auth/authController
export const sendEmailOTP = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await OTP.findOneAndUpdate(
      { email, propertyId, userId: req.user._id },
      { 
        otp,
        verified: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
      { upsert: true, new: true },
    );

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, property.placeName || 'Your Property');
    
    if (!emailResult.success) {
      return errorResponse(res, 500, 'Failed to send OTP email', emailResult.error);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
    });

  } catch (error) {
    
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Verify OTP a new property for multistep form //moved to /auth/authController
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
      verified: false,
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
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}

    if (property) {
      property.emailVerified = true;
      await property.save({ validateBeforeSave: false });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      property, // Return updated property
    });

  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Verify OTP status a new property for multistep form //moved to /auth/authController
export const checkEmailVerificationStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const property = await Property.findById(propertyId);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Check ownership or admin access
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }
    
    return res.status(200).json({
      success: true,
      emailVerified: property.emailVerified || false,
      email: property.email,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Modified saveBasicInfo with email verification check //moved to propertyManageController
export const saveBasicInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const { propertyType, placeName, placeRating, propertyBuilt, bookingSince, rentalForm, email, mobileNumber, landline } = req.body;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}

    // Check if email is verified (keep existing logic)
    if (email && email !== property.email) {
      const otpRecord = await OTP.findOne({ 
        email, 
        propertyId, 
        userId: req.user._id,
        verified: true,
      });

      if (!otpRecord) {
        return errorResponse(res, 400, 'Please verify your email address first');
      }
      
      property.emailVerified = true;
    } else if (email === property.email && property.emailVerified) {
      // No action needed
    } else if (email && !property.emailVerified) {
      return errorResponse(res, 400, 'Please verify your email address first');
    }

    // Check for changes if property is published
    const hasChanges = detectPropertyChanges(property, {
      propertyType, placeName, placeRating, propertyBuilt, 
      bookingSince, rentalForm, email, mobileNumber, landline
    }, 1);

    if (hasChanges) {
      await markForReapproval(property, 1, req.user._id);
    }
    
    // Update property with basic info
    property.propertyType = propertyType;
    property.placeName = placeName;
    property.placeRating = placeRating;
    property.propertyBuilt = propertyBuilt;
    property.bookingSince = bookingSince;
    property.rentalForm = rentalForm;
    property.email = email;
    property.mobileNumber = mobileNumber;
    property.landline = landline;
   
    
    await property.save({ validateBeforeSave: false });

    // Clean up verified OTP records
    await OTP.deleteMany({ email, propertyId, verified: true });
    
    return res.status(200).json({
      success: true,
      message: hasChanges ? 
        'Basic info saved successfully. Property marked for admin review due to changes.' : 
        'Basic info saved successfully',
      property,
      requiresApproval: hasChanges,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Save Step 2: Location //moved to propertyManageController
export const saveLocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const { houseName, country, street, roomNumber, city, state, postalCode, coordinates } = req.body;
    
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}

    // Find state by name
    let stateRef = null;
    if (state) {
      const stateDoc = await State.findOne({ name: { $regex: new RegExp(state, 'i') } });
      if (stateDoc) {
        stateRef = stateDoc._id;
      }
    }
    
    // Find city by name and state
    let cityRef = null;
    if (city && stateRef) {
      const cityDoc = await City.findOne({ 
        name: { $regex: new RegExp(city, 'i') },
        state: stateRef, 
      });
      if (cityDoc) {
        cityRef = cityDoc._id;
      }
    }

    const locationData = {
      houseName,
      country,
      street,
      roomNumber,
      city,
      state,
      stateRef,
      cityRef,
      postalCode,
      coordinates,
    };

    // Check for changes if property is published
    const hasChanges = detectPropertyChanges(property, locationData, 2);

    if (hasChanges) {
      await markForReapproval(property, 2, req.user._id);
    }
    
    // Update property with location info
    property.location = locationData;
    property.formProgress.step1Completed = true;
    property.formProgress.step2Completed = true;
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: hasChanges ? 
        'Location saved successfully. Property marked for admin review due to changes.' : 
        'Location saved successfully',
      property,
      requiresApproval: hasChanges,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Save Step 3: Property Amenities //moved to propertyManageController
export const saveAmenities = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const { amenities } = req.body;
    
    const property = await Property.findById(propertyId);

    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }

    // Check ownership or admin access
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Unauthorized access');
    }

    // Check for changes if property is published
    const hasChanges = detectPropertyChanges(property, amenities, 3);

    if (hasChanges) {
      await markForReapproval(property, 3, req.user._id);
    }
    
    // Process amenities data
    property.amenities = amenities;
    property.formProgress.step3Completed = true;
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: hasChanges ? 
        'Amenities saved successfully. Property marked for admin review due to changes.' : 
        'Amenities saved successfully',
      property,
      requiresApproval: hasChanges,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Add a Room //moved to propertyManageController
export const addRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const roomData = req.body;
    
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}

    // Check for changes if property is published
    const currentRooms = [...property.rooms, roomData];
    const hasChanges = detectPropertyChanges(property, currentRooms, 4);

    if (hasChanges) {
      await markForReapproval(property, 4, req.user._id);
    }
    
    // Add room to property
    property.rooms.push(roomData);

    property.formProgress.step4Completed = false;
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(201).json({
      success: true,
      message: hasChanges ? 
        'Room added successfully. Property marked for admin review due to changes.' : 
        'Room added successfully',
      room: property.rooms[property.rooms.length - 1],
      property,
      requiresApproval: hasChanges,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};


// Update a Room //moved to propertyManageController
export const updateRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId, roomId } = req.params;
    const roomData = req.body;
    
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Find room index
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }

    // Create updated rooms array for comparison
    const updatedRooms = [...property.rooms];
    Object.keys(roomData).forEach(key => {
      updatedRooms[roomIndex][key] = roomData[key];
    });

    // Check for changes if property is published
    const hasChanges = detectPropertyChanges(property, updatedRooms, 4);

    if (hasChanges) {
      await markForReapproval(property, 4, req.user._id);
    }
    
    // Update room data
    Object.keys(roomData).forEach(key => {
      property.rooms[roomIndex][key] = roomData[key];
    });
    property.formProgress.step4Completed = false;
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: hasChanges ? 
        'Room updated successfully. Property marked for admin review due to changes.' : 
        'Room updated successfully',
      room: property.rooms[roomIndex],
      property,
      requiresApproval: hasChanges,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete a Room //moved to propertyManageController
export const deleteRoom = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Find room index
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }

    // Create updated rooms array for comparison
    const updatedRooms = property.rooms.filter(room => room._id.toString() !== roomId);

    // Check for changes if property is published
    const hasChanges = detectPropertyChanges(property, updatedRooms, 4);

    if (hasChanges) {
      await markForReapproval(property, 4, req.user._id);
    }
    
    // Remove room
    property.rooms.splice(roomIndex, 1);
    property.formProgress.step4Completed = property.rooms.length > 0;

     property.formProgress.step4Completed = false;
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: hasChanges ? 
        'Room deleted successfully. Property marked for admin review due to changes.' : 
        'Room deleted successfully',
      property,
      requiresApproval: hasChanges,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};


export const completeRoomsStep = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Ensure at least one room has been added
    if (!Array.isArray(property.rooms) || property.rooms.length < 1) {
      return errorResponse(res, 400, 'You must add at least one room before completing this step');
    }
    
    // Mark step 4 as completed
    property.formProgress.step4Completed = true;
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: 'Rooms step completed successfully',
      property,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};


// Upload Media (Images and Videos)
export const uploadPropertyMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }
    
    if (files.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload more than 20 files at once',
      });
    }
    
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}

    const hasChanges = property.status === 'published';
    if (hasChanges) {
      await markForReapproval(property, 5, req.user._id);
    }
    
    const uploadedMedia = [];
    
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      
      const mediaItem = {
        url: file.location, // S3 URL
        key: file.key, // S3 key for deletion
        type: mediaType,
        filename: file.originalname,
        tags: [],
        isCover: false,
        displayOrder: mediaType === 'image' ? property.media.images.length : property.media.videos.length,
        uploadedAt: new Date(),
      };
      
      if (mediaType === 'image') {
        property.media.images.push(mediaItem);
      } else {
        property.media.videos.push(mediaItem);
      }
      
      uploadedMedia.push({
        ...mediaItem,
        _id: property.media[mediaType === 'image' ? 'images' : 'videos'][property.media[mediaType === 'image' ? 'images' : 'videos'].length - 1]._id,
      });
    }
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(201).json({
      success: true,
      message: hasChanges ? 
        `${files.length} media files uploaded successfully. Property marked for admin review.` :
        `${files.length} media files uploaded successfully`,
      uploadedMedia,
      property,
      requiresApproval: hasChanges,
    });
    
  } catch (error) {
    console.error('Upload media error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update Media Tags and Properties
export const updateMediaItem = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;
    const { tags, isCover, displayOrder } = req.body;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Find media item in images or videos
    let mediaItem = null;
    let mediaType = null;
    let mediaIndex = -1;
    
    // Check in images
    mediaIndex = property.media.images.findIndex(img => img._id.toString() === mediaId);
    if (mediaIndex !== -1) {
      mediaItem = property.media.images[mediaIndex];
      mediaType = 'images';
    } else {
      // Check in videos
      mediaIndex = property.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = property.media.videos[mediaIndex];
        mediaType = 'videos';
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not test found');
    }
    
    // Validate tags - ensure at least one tag is provided
    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one tag');
      }
      
      // Filter out empty tags
      const validTags = tags.filter(tag => tag && tag.trim().length > 0);
      if (validTags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one valid tag');
      }
      
      mediaItem.tags = validTags;
    }
    
    // Update display order if provided
    if (typeof displayOrder === 'number') {
      mediaItem.displayOrder = displayOrder;
    }
    
    // Handle cover image setting (only for images)
    if (isCover !== undefined && mediaType === 'images') {
      if (isCover) {
        // Remove cover status from other images
        property.media.images.forEach(img => {
          img.isCover = false;
        });
        mediaItem.isCover = true;
        property.media.coverImage = mediaItem._id;
      } else {
        mediaItem.isCover = false;
        if (property.media.coverImage && property.media.coverImage.toString() === mediaId) {
          property.media.coverImage = null;
        }
      }
    }
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: 'Media item updated successfully',
      mediaItem,
      property,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const validatePropertyMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    const allMedia = [...property.media.images, ...property.media.videos];
    const itemsWithoutTags = [];
    
    // Check each media item for tags
    allMedia.forEach((item, index) => {
      if (!item.tags || item.tags.length === 0) {
        itemsWithoutTags.push({
          id: item._id,
          filename: item.filename,
          type: item.type,
          index: index + 1,
        });
      }
    });
    
    if (itemsWithoutTags.length > 0) {
      return errorResponse(res, 400, 'Some media items are missing tags', {
        itemsWithoutTags,
        message: 'Each media item must have at least one tag before proceeding',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'All media items have valid tags',
      totalMedia: allMedia.length,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete Media Item
export const deleteMediaItem = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;
    
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}

    // Check for changes if property is published (deleting media is a change)
    const hasChanges = property.status === 'published';

    if (hasChanges) {
      await markForReapproval(property, 5, req.user._id);
    }
    
    // Find and remove media item
    let mediaItem = null;
    let mediaIndex = -1;
    
    // Check in images
    mediaIndex = property.media.images.findIndex(img => img._id.toString() === mediaId);
    if (mediaIndex !== -1) {
      mediaItem = property.media.images[mediaIndex];
      property.media.images.splice(mediaIndex, 1);
      
      // If this was the cover image, remove cover reference
      if (property.media.coverImage && property.media.coverImage.toString() === mediaId) {
        property.media.coverImage = null;
      }
    } else {
      // Check in videos
      mediaIndex = property.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = property.media.videos[mediaIndex];
        property.media.videos.splice(mediaIndex, 1);
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not found');
    }
    
    // Delete physical file
    try {
      const filePath = `.${mediaItem.url}`;
      await unlink(filePath);
    } catch (fileError) {
      console.log('Could not delete file:', fileError.message);
    }
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: hasChanges ? 
        'Media item deleted successfully. Property marked for admin review due to changes.' :
        'Media item deleted successfully',
      property,
      requiresApproval: hasChanges,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Upload Media to Specific Room
export const uploadRoomMedia = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }
    
    if (files.length > 20) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload more than 20 files at once',
      });
    }
    
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
    
    const room = property.rooms[roomIndex];
    const uploadedMedia = [];
    
    if (!room.media) {
      room.media = { images: [], videos: [] };
    }
    
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      
      const mediaItem = {
        url: file.location, // S3 URL
        key: file.key, // S3 key
        type: mediaType,
        filename: file.originalname,
        tags: [],
        isCover: false,
        displayOrder: mediaType === 'image' ? room.media.images.length : room.media.videos.length,
        uploadedAt: new Date(),
      };
      
      if (mediaType === 'image') {
        room.media.images.push(mediaItem);
      } else {
        room.media.videos.push(mediaItem);
      }
      
      uploadedMedia.push({
        ...mediaItem,
        _id: room.media[mediaType === 'image' ? 'images' : 'videos'][room.media[mediaType === 'image' ? 'images' : 'videos'].length - 1]._id,
      });
    }
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(201).json({
      success: true,
      message: `${files.length} media files uploaded to room successfully`,
      uploadedMedia,
      room: property.rooms[roomIndex],
      property,
    });
    
  } catch (error) {
    console.error('Upload room media error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update Room Media Item
export const updateRoomMediaItem = async (req, res) => {
  try {
    const { propertyId, roomId, mediaId } = req.params;
    const { tags, isCover, displayOrder } = req.body;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Find the specific room
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    const room = property.rooms[roomIndex];
    
    // Find media item in room's images or videos
    let mediaItem = null;
    let mediaType = null;
    let mediaIndex = -1;
    
    // Check in images
    if (room.media && room.media.images) {
      mediaIndex = room.media.images.findIndex(img => img._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.images[mediaIndex];
        mediaType = 'images';
      }
    }
    
    // Check in videos if not found in images
    if (!mediaItem && room.media && room.media.videos) {
      mediaIndex = room.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.videos[mediaIndex];
        mediaType = 'videos';
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not found in room');
    }
    
    // Validate tags - ensure at least one tag is provided
    if (tags !== undefined) {
      if (!Array.isArray(tags) || tags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one tag');
      }
      
      const validTags = tags.filter(tag => tag && tag.trim().length > 0);
      if (validTags.length === 0) {
        return errorResponse(res, 400, 'Each media item must have at least one valid tag');
      }
      
      mediaItem.tags = validTags;
    }
    
    // Update display order if provided
    if (typeof displayOrder === 'number') {
      mediaItem.displayOrder = displayOrder;
    }
    
    // Handle cover image setting (only for images)
    if (isCover !== undefined && mediaType === 'images') {
      if (isCover) {
        // Remove cover status from other images in this room
        room.media.images.forEach(img => {
          img.isCover = false;
        });
        mediaItem.isCover = true;
        room.media.coverImage = mediaItem._id;
      } else {
        mediaItem.isCover = false;
        if (room.media.coverImage && room.media.coverImage.toString() === mediaId) {
          room.media.coverImage = null;
        }
      }
    }
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: 'Room media item updated successfully',
      mediaItem,
      room: property.rooms[roomIndex],
      property,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete Room Media Item
export const deleteRoomMediaItem = async (req, res) => {
  try {
    const { propertyId, roomId, mediaId } = req.params;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Find the specific room
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    const room = property.rooms[roomIndex];
    
    // Find and remove media item
    let mediaItem = null;
    let mediaIndex = -1;
    
    // Check in images
    if (room.media && room.media.images) {
      mediaIndex = room.media.images.findIndex(img => img._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.images[mediaIndex];
        room.media.images.splice(mediaIndex, 1);
        
        // If this was the cover image, remove cover reference
        if (room.media.coverImage && room.media.coverImage.toString() === mediaId) {
          room.media.coverImage = null;
        }
      }
    }
    
    // Check in videos if not found in images
    if (!mediaItem && room.media && room.media.videos) {
      mediaIndex = room.media.videos.findIndex(vid => vid._id.toString() === mediaId);
      if (mediaIndex !== -1) {
        mediaItem = room.media.videos[mediaIndex];
        room.media.videos.splice(mediaIndex, 1);
      }
    }
    
    if (!mediaItem) {
      return errorResponse(res, 404, 'Media item not found in room');
    }
    
    // Delete physical file
    try {
      const filePath = `.${mediaItem.url}`;
      await unlink(filePath);
    } catch (fileError) {
      console.log('Could not delete file:', fileError.message);
    }
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: 'Room media item deleted successfully',
      room: property.rooms[roomIndex],
      property,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Get Room Media
export const getRoomMedia = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    const { type } = req.query; // 'image' or 'video'
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }
    
    // Find the specific room
    const room = property.rooms.find(room => room._id.toString() === roomId);
    
    if (!room) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    let mediaItems = [];
    
    if (room.media) {
      // Get images or videos based on type parameter
      if (!type || type === 'image') {
        mediaItems = [...mediaItems, ...(room.media.images || [])];
      }
      if (!type || type === 'video') {
        mediaItems = [...mediaItems, ...(room.media.videos || [])];
      }
    }
    
    // Sort by display order
    mediaItems.sort((a, b) => a.displayOrder - b.displayOrder);
    
    return res.status(200).json({
      success: true,
      count: mediaItems.length,
      data: mediaItems,
      room: {
        _id: room._id,
        roomName: room.roomName,
      },
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Get Media by Tags
export const getMediaByTags = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { tags, type } = req.query; // tags as comma-separated string, type: 'image' or 'video'
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found');
    }
    
    let mediaItems = [];
    
    // Get images or videos based on type parameter
    if (!type || type === 'image') {
      mediaItems = [...mediaItems, ...property.media.images];
    }
    if (!type || type === 'video') {
      mediaItems = [...mediaItems, ...property.media.videos];
    }
    
    // Filter by tags if provided
    if (tags) {
      const filterTags = tags.split(',').map(tag => tag.trim().toLowerCase());
      mediaItems = mediaItems.filter(item => 
        item.tags.some(tag => filterTags.includes(tag.toLowerCase())),
      );
    }
    
    // Sort by display order
    mediaItems.sort((a, b) => a.displayOrder - b.displayOrder);
    
    return res.status(200).json({
      success: true,
      count: mediaItems.length,
      data: mediaItems,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Complete Media Step
export const completeMediaStep = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Check if minimum requirements are met (at least 10 media items)
    const totalMedia = property.media.images.length + property.media.videos.length;
    console.log(property);
    
    if (totalMedia < 3) {
      return errorResponse(res, 400, `Minimum 10 media items required. Currently have ${totalMedia} items.`);
    }
    
    // Ensure there's at least one cover image
    const hasCoverImage = property.media.images.some(img => img.isCover) || property.media.coverImage;
    
    if (!hasCoverImage && property.media.images.length > 0) {
      // Automatically set first image as cover if none selected
      property.media.images[0].isCover = true;
      property.media.coverImage = property.media.images[0]._id;
    }
    
    // Mark step 5 as completed
    property.formProgress.step5Completed = true;
    
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: 'Media step completed successfully',
      property,
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Complete Property Listing
export const completePropertyListing = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
const property = await Property.findById(propertyId);

if (!property) {
  return errorResponse(res, 404, 'Property not found');
}

// Check ownership or admin access
if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
  return errorResponse(res, 403, 'Unauthorized access');
}
    
    // Check if all steps are completed
    const { step1Completed, step2Completed, step3Completed, step4Completed, step5Completed, step6Completed, step7Completed  } = property.formProgress;
    
    if (!step1Completed || !step2Completed || !step3Completed || !step4Completed || !step5Completed || !step6Completed || !step7Completed) {
      return errorResponse(res, 400, 'Cannot complete listing - some steps are incomplete', {
        step1Completed,
        step2Completed,
        step3Completed,
        step4Completed,
        step5Completed,
        step6Completed,
        step7Completed,
      });
    }
    
    // Mark property as complete
    property.formProgress.formCompleted = true;
    await property.save({ validateBeforeSave: false });
    
    return res.status(200).json({
      success: true,
      message: 'Property listing completed successfully',
      property,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Admin: Approve or reject property
export const reviewProperty = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
      });
    }
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to review properties',
      });
    }
    
    if (status === 'published') {
      // Save current state as published version
      property.publishedVersion = {
        propertyType: property.propertyType,
        placeName: property.placeName,
        placeRating: property.placeRating,
        propertyBuilt: property.propertyBuilt,
        bookingSince: property.bookingSince,
        rentalForm: property.rentalForm,
        email: property.email,
        mobileNumber: property.mobileNumber,
        landline: property.landline,
        location: property.location,
        amenities: property.amenities,
        rooms: property.rooms,
        media: property.media,
      };
      
      // Clear pending changes
      property.pendingChanges = {
        step1Changed: false,
        step2Changed: false,
        step3Changed: false,
        step4Changed: false,
        step5Changed: false,
        step6Changed: false,
        step7Changed: false,
        changedAt: null,
        changedBy: null,
      };
      
      property.lastApprovedAt = new Date();
    }
    
    property.status = status;
    if (rejectionReason) {
      property.rejectionReason = rejectionReason;
    }
    property.updatedAt = Date.now();
    
    await property.save({ validateBeforeSave: false });
    
    res.status(200).json({
      success: true,
      message: `Property ${status === 'published' ? 'approved and published' : 'rejected'} successfully`,
      data: property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Admin: Property status
export const changePropertyStatus = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const { status, rejectionReason } = req.body;

    // Allow only defined statuses
    const allowedStatuses = ['draft', 'pending', 'published', 'rejected', 'pending_changes'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
      });
    }

    // Find property by ID
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    // Only admin can change status
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to change property status',
      });
    }

    // Special handling when publishing
    if (status === 'published') {
      property.publishedVersion = {
        propertyType: property.propertyType,
        placeName: property.placeName,
        placeRating: property.placeRating,
        propertyBuilt: property.propertyBuilt,
        bookingSince: property.bookingSince,
        rentalForm: property.rentalForm,
        email: property.email,
        mobileNumber: property.mobileNumber,
        landline: property.landline,
        location: property.location,
        amenities: property.amenities,
        rooms: property.rooms,
        media: property.media,
      };

      // Reset pending changes
      property.pendingChanges = {
        step1Changed: false,
        step2Changed: false,
        step3Changed: false,
        step4Changed: false,
        step5Changed: false,
        step6Changed: false,
        step7Changed: false,
        changedAt: null,
        changedBy: null,
      };

      property.lastApprovedAt = new Date();
      property.rejectionReason = undefined;
    }

    // If rejected, optionally store reason
    if (status === 'rejected' && rejectionReason) {
      property.rejectionReason = rejectionReason;
    }

    // Update status
    property.status = status;
    property.updatedAt = Date.now();

    await property.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: `Property status updated to "${status}" successfully`,
      data: property,
    });
  } catch (error) {
    console.error('Error updating property status:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error',
    });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }
    
    // Check if property is published and user is not an admin
    if (property.status === 'published' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete published properties',
      });
    }

    // Check ownership if property is not published
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this property',
      });
    }

    // Delete associated images
    if (property?.images?.cover) {
      fs.unlinkSync(property?.images?.cover);
    }
    
    if (property?.images?.additional && property?.images?.additional?.length > 0) {
      property.images.additional.forEach(imagePath => {
        fs.unlinkSync(imagePath);
      });
    }
    
    await property.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};


// Get properties by state
export const getPropertiesByState = async (req, res) => {
  try {
    const { state } = req.params;
    
    const properties = await Property.find({
      'location.state': state,
      'status': 'published',
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get properties by city
export const getPropertiesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const properties = await Property.find({
      'location.city': city,
      'status': 'published',
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Search properties with filters
export const searchProperties = async (req, res) => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests,
    } = req.query;
    
     // Validate query parameters
      if (!location || !checkIn || !checkOut || !guests) {
        return res.status(400).json({ 
          error: 'Missing required parameters: location, checkIn, checkOut, guests', 
        });
      }
          // Parse and validate dates using dateUtils functions
      let checkInDate, checkOutDate;
      try {
        checkInDate = parseDate(checkIn);
        checkOutDate = parseDate(checkOut);
        validateDateRange(checkInDate, checkOutDate);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }

      
    // Validate guests
    const guestCount = parseInt(guests);
    if (guestCount <= 0) {
      return res.status(400).json({ error: 'Number of guests must be greater than 0' });
    }

    const hotels = await searchPropertiesService({
      location,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
    });

    res.status(200).json({
      success: true,
      data: hotels,
      nights: getNights(checkInDate, checkOutDate),
    });
  } catch (error) {
    console.error('Error in searchHotels:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message, 
    });
  }
};

// Get featured properties
export const getFeaturedProperties = async (req, res) => {
  try {
    // Get properties with highest ratings or most booked
    const properties = await Property.find({ status: 'published' })
      .sort({ 'ratings.average': -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get Indian states with property counts
export const getStateWisePropertyStats = async (req, res) => {
  try {
    const stateStats = await Property.aggregate([
      { $match: { status: 'published' } },
      { $group: {
          _id: '$location.state',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.weekdayPrice' },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    res.status(200).json({
      success: true,
      count: stateStats.length,
      data: stateStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Check property availability for specific dates
export const checkPropertyAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;
    
    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Please provide check-in and check-out dates',
      });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }
    
    // Check if any of the requested dates are in blocked dates
    const isBlocked = property.availability.blockedDates.some(date => {
      const blockedDate = new Date(date);
      return blockedDate >= checkInDate && blockedDate <= checkOutDate;
    });
    
    // Add logic to check booking table for existing bookings
    
    res.status(200).json({
      success: true,
      data: {
        available: !isBlocked,
        property: {
          id: property._id,
          name: property.placeName,
          pricing: property.pricing,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

  export const getSuggestions = async (req, res) => {
    try {
      const { q } = req.query;
      console.log(q);

      if (!q) return res.status(200).json([]);

      try {
        // Try Atlas Search first
        const searchQuery = [
          {
            $search: {
              index: 'suggestions',
              compound: {
                should: [
                  {
                    autocomplete: {
                      query: q,
                      path: 'location.city',
                    },
                  },
                  {
                    autocomplete: {
                      query: q,
                      path: 'location.state',
                    },
                  },
                ],
              },
            },
          },
          {
            $match: {
              status: 'published',
            },
          },
          {
            $group: {
              _id: {
                city: '$location.city',
                state: '$location.state',
              },
              score: { $max: { $meta: 'searchScore' } },
            },
          },
          {
            $project: {
              _id: 0,
              city: '$_id.city',
              state: '$_id.state',
              score: 1,
            },
          },
          { $sort: { score: -1 } },
          { $limit: 10 },
        ];

        const suggestions = await Property.aggregate(searchQuery);
        console.log(suggestions);
        return res.status(200).json(suggestions);
        
      } catch (searchError) {
        // Fallback to regular query if search index doesn't exist
        console.warn('Search index not available, using fallback query');
        
        const regex = new RegExp(q, 'i');
        
        const suggestions = await Property.find({
          status: 'published',
          $or: [
            { 'location.city': regex },
            { 'location.state': regex },
          ],
        })
          .select('location.city location.state -_id')
          .lean();

        // Remove duplicates
        const uniqueLocations = Array.from(
          new Map(
            suggestions.map(item => [
              `${item.location.city}-${item.location.state}`,
              { city: item.location.city, state: item.location.state }
            ])
          ).values()
        ).slice(0, 10);

        return res.status(200).json(uniqueLocations);
      }
      
    } catch (err) {
      console.error('Search suggestion error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  };


export const getPropertiesByQuery = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      location, 
      checkin, 
      checkout, 
      persons, 
      skip = 0,
      limit = 10
    } = req.query; 

    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;

    try {
      // Try Atlas Search first
      const searchQuery = [
        {
          $search: {
            index: 'suggestions',
            compound: {
              should: [
                {
                  autocomplete: {
                    query: location,
                    path: 'placeName',
                  },
                },
                {
                  autocomplete: {
                    query: location,
                    path: 'location.city',
                  },
                },
                {
                  autocomplete: {
                    query: location,
                    path: 'location.state',
                  },
                },
              ].filter(Boolean),
            },
          },
        },
        {
          $match: {
            status: 'published',
          },
        },
        { $skip: skipNum },
        { $limit: limitNum },
      ];

      const propertyList = await Property.aggregate(searchQuery);
      console.log('Properties found:', propertyList.length);
    
      return res.status(200).json({
        success: true,
        data: propertyList,
        pagination: {
          skip: skipNum,
          limit: limitNum,
          count: propertyList.length,
          hasMore: propertyList.length === limitNum
        }
      });
      
    } catch (searchError) {
      // Fallback to regular query
      console.warn('Search index not available, using fallback query');
      
      const regex = new RegExp(location, 'i');
      
      const propertyList = await Property.find({
        status: 'published',
        $or: [
          { placeName: regex },
          { 'location.city': regex },
          { 'location.state': regex },
        ],
      })
        .skip(skipNum)
        .limit(limitNum)
        .lean();

      console.log('Properties found (fallback):', propertyList.length);
      
      return res.status(200).json({
        success: true,
        data: propertyList,
        pagination: {
          skip: skipNum,
          limit: limitNum,
          count: propertyList.length,
          hasMore: propertyList.length === limitNum
        },
        usingFallback: true
      });
    }
    
  } catch (err) {
    console.error('Search suggestion error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Server error',
      message: err.message 
    });
  }
};


export const getFilteredProperties = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      location,
      checkin,
      checkout,
      persons,
      skip = 0,
      limit = 10,
      priceRange,
      starRating,
      distance,
      amenities,
      propertyType,
      sortBy = 'relevance'
    } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location parameter is required'
      });
    }

    const skipNum = parseInt(skip) || 0;
    const limitNum = parseInt(limit) || 10;

    const filters = {
      priceRange: priceRange ? priceRange.split(',') : [],
      starRating: starRating ? starRating.split(',') : [],
      distance: distance ? distance.split(',') : [],
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
      propertyType: propertyType ? propertyType.split(',') : []
    };

    console.log('Applied Filters:', filters);

    try {
      // Try Atlas Search first
      const pipeline = [
        {
          $search: {
            index: 'suggestions',
            compound: {
              should: [
                {
                  autocomplete: {
                    query: location,
                    path: 'placeName',
                  },
                },
                {
                  autocomplete: {
                    query: location,
                    path: 'location.city',
                  },
                },
                {
                  autocomplete: {
                    query: location,
                    path: 'location.state',
                  },
                },
              ],
            },
          },
        },
        {
          $match: {
            status: 'published',
          },
        },
        {
          $unwind: {
            path: '$rooms',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $match: buildFilterMatch(filters, checkin, checkout, persons)
        },
        {
          $match: {
            rooms: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$_id',
            property: { $first: '$$ROOT' },
            rooms: { $push: '$rooms' },
            minPrice: { $min: '$rooms.pricing.baseAdultsCharge' },
            maxPrice: { $max: '$rooms.pricing.baseAdultsCharge' }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$property',
                {
                  rooms: '$rooms',
                  priceRange: {
                    min: '$minPrice',
                    max: '$maxPrice'
                  }
                }
              ]
            }
          }
        },
        {
          $project: {
            'property.rooms': 0
          }
        },
        {
          $sort: buildSortStage(sortBy)
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: skipNum },
              { $limit: limitNum }
            ]
          }
        }
      ];

      console.log('Aggregation Pipeline:', JSON.stringify(pipeline, null, 2));

      const result = await Property.aggregate(pipeline);
      const properties = result[0]?.data || [];
      const total = result[0]?.metadata[0]?.total || 0;
      const filterStats = await calculateFilterStats(location, filters);

      return res.status(200).json({
        success: true,
        data: properties,
        pagination: {
          skip: skipNum,
          limit: limitNum,
          count: properties.length,
          total: total,
          hasMore: skipNum + properties.length < total
        },
        appliedFilters: filters,
        filterStats: filterStats
      });

    } catch (searchError) {
      // Fallback to regular query
      console.warn('Search index not available, using fallback query');
      
      const regex = new RegExp(location, 'i');
      
      const pipeline = [
        {
          $match: {
            status: 'published',
            $or: [
              { placeName: regex },
              { 'location.city': regex },
              { 'location.state': regex },
            ]
          }
        },
        {
          $unwind: {
            path: '$rooms',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $match: buildFilterMatch(filters, checkin, checkout, persons)
        },
        {
          $match: {
            rooms: { $exists: true }
          }
        },
        {
          $group: {
            _id: '$_id',
            property: { $first: '$$ROOT' },
            rooms: { $push: '$rooms' },
            minPrice: { $min: '$rooms.pricing.baseAdultsCharge' },
            maxPrice: { $max: '$rooms.pricing.baseAdultsCharge' }
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$property',
                {
                  rooms: '$rooms',
                  priceRange: {
                    min: '$minPrice',
                    max: '$maxPrice'
                  }
                }
              ]
            }
          }
        },
        {
          $project: {
            'property.rooms': 0
          }
        },
        {
          $sort: buildSortStage(sortBy)
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: skipNum },
              { $limit: limitNum }
            ]
          }
        }
      ];

      const result = await Property.aggregate(pipeline);
      const properties = result[0]?.data || [];
      const total = result[0]?.metadata[0]?.total || 0;
      const filterStats = await calculateFilterStats(location, filters);

      return res.status(200).json({
        success: true,
        data: properties,
        pagination: {
          skip: skipNum,
          limit: limitNum,
          count: properties.length,
          total: total,
          hasMore: skipNum + properties.length < total
        },
        appliedFilters: filters,
        filterStats: filterStats,
        usingFallback: true
      });
    }

  } catch (err) {
    console.error('Filter properties error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
// Helper function to build filter match conditions
const buildFilterMatch = (filters, checkin, checkout, persons) => {
  const match = {};

  // Price range filter
  if (filters.priceRange && filters.priceRange.length > 0) {
    const priceConditions = filters.priceRange.map(range => {
      const [min, max] = range.split('-').map(Number);
      return {
        'rooms.pricing.baseAdultsCharge': { 
          $gte: min, 
          $lte: max 
        }
      };
    });
    if (priceConditions.length > 0) {
      match.$or = priceConditions;
    }
  }

  // Star rating filter
  if (filters.starRating && filters.starRating.length > 0) {
    match.placeRating = { 
      $in: filters.starRating.map(rating => rating.toString()) 
    };
  }

  // Property type filter
  if (filters.propertyType && filters.propertyType.length > 0) {
    match.propertyType = { $in: filters.propertyType };
  }

  // Amenities filter - Case insensitive with mapping
  if (filters.amenities && filters.amenities.length > 0) {
    // Map common variations to actual property names
    const amenityMap = {
      'wifi': 'Wifi',
      'wi-fi': 'Wifi',
      'ac': 'AirConditioning',
      'airconditioning': 'AirConditioning',
      'air conditioning': 'AirConditioning',
      'laundry': 'Laundry',
      'parking': 'Parking',
      'newspaper': 'Newspaper',
      'roomservice': 'Roomservice',
      'room service': 'Roomservice',
      'smokedetector': 'Smokedetector',
      'smoke detector': 'Smokedetector',
      'restaurant': 'RestaurantBhojnalay',
      'restaurantbhojnalay': 'RestaurantBhojnalay',
      'cctv': 'CCTV',
      'fireextinguishers': 'Fireextinguishers',
      'fire extinguishers': 'Fireextinguishers',
      'luggageassistance': 'Luggageassistance',
      'luggage assistance': 'Luggageassistance',
      'tv': 'TV',
      'hairdryer': 'Hairdryer',
      'hair dryer': 'Hairdryer',
      'hotwater': 'HotWater',
      'hot water': 'HotWater',
      'toiletries': 'Toiletries',
      'mineralwater': 'MineralWater',
      'mineral water': 'MineralWater',
      'telephone': 'Telephone'
    };
    
    const amenityConditions = filters.amenities.map(amenity => {
      const normalizedAmenity = amenityMap[amenity.toLowerCase()] || amenity;
      return {
        $or: [
          { [`amenities.mandatory.${normalizedAmenity}.available`]: true },
          { [`rooms.amenities.mandatory.${normalizedAmenity}.available`]: true }
        ]
      };
    });
    
    // All specified amenities must be available
    match.$and = match.$and || [];
    match.$and.push(...amenityConditions);
  }

  // Distance filter (if you have location coordinates)
  if (filters.distance && filters.distance.length > 0) {
    // This would require geospatial queries
    // Implement based on your distance calculation logic
  }

  // Date availability filter
  if (checkin && checkout) {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    
    match['rooms.availability'] = {
      $elemMatch: {
        startDate: { $lte: checkinDate },
        endDate: { $gte: checkoutDate },
        availableUnits: { $gt: 0 }
      }
    };
  }

  // Occupancy filter
  if (persons) {
    const personCount = parseInt(persons);
    match['rooms.occupancy.maximumOccupancy'] = { $gte: personCount };
  }

  return match;
};


// Build sort stage
const buildSortStage = (sortBy) => {
  const sortOptions = {
    'relevance': { _id: 1 }, // Default sort
    'price_low_high': { 'priceRange.min': 1 },
    'price_high_low': { 'priceRange.min': -1 },
    'rating_high_low': { placeRating: -1 },
    'rating_low_high': { placeRating: 1 },
    'newest': { createdAt: -1 },
    'oldest': { createdAt: 1 },
    'name_a_z': { placeName: 1 },
    'name_z_a': { placeName: -1 }
  };

  return sortOptions[sortBy] || sortOptions.relevance;
};

// Calculate filter statistics
const calculateFilterStats = async (location, appliedFilters) => {
  try {
    try {
      // Try Atlas Search first
      const pipeline = [
        {
          $search: {
            index: 'suggestions',
            compound: {
              should: [
                {
                  autocomplete: {
                    query: location,
                    path: 'placeName',
                  },
                },
                {
                  autocomplete: {
                    query: location,
                    path: 'location.city',
                  },
                },
                {
                  autocomplete: {
                    query: location,
                    path: 'location.state',
                  },
                },
              ],
            },
          },
        },
        {
          $match: {
            status: 'published',
          },
        },
        {
          $unwind: {
            path: '$rooms',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$rooms.pricing.baseAdultsCharge' },
            maxPrice: { $max: '$rooms.pricing.baseAdultsCharge' },
            propertyTypes: { $addToSet: '$propertyType' },
            ratings: { $addToSet: '$placeRating' },
            totalProperties: { $sum: 1 }
          }
        }
      ];

      const stats = await Property.aggregate(pipeline);
      
      if (stats.length === 0) {
        return {
          priceRange: { min: 0, max: 0 },
          propertyTypes: [],
          ratings: [],
          totalProperties: 0
        };
      }

      return {
        priceRange: {
          min: stats[0].minPrice || 0,
          max: stats[0].maxPrice || 0
        },
        propertyTypes: stats[0].propertyTypes || [],
        ratings: stats[0].ratings.sort((a, b) => b - a) || [],
        totalProperties: stats[0].totalProperties || 0
      };
      
    } catch (searchError) {
      // Fallback to regular query
      console.warn('Search index not available for stats, using fallback');
      
      const regex = new RegExp(location, 'i');
      
      const pipeline = [
        {
          $match: {
            status: 'published',
            $or: [
              { placeName: regex },
              { 'location.city': regex },
              { 'location.state': regex },
            ]
          }
        },
        {
          $unwind: {
            path: '$rooms',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $group: {
            _id: null,
            minPrice: { $min: '$rooms.pricing.baseAdultsCharge' },
            maxPrice: { $max: '$rooms.pricing.baseAdultsCharge' },
            propertyTypes: { $addToSet: '$propertyType' },
            ratings: { $addToSet: '$placeRating' },
            totalProperties: { $sum: 1 }
          }
        }
      ];

      const stats = await Property.aggregate(pipeline);
      
      if (stats.length === 0) {
        return {
          priceRange: { min: 0, max: 0 },
          propertyTypes: [],
          ratings: [],
          totalProperties: 0
        };
      }

      return {
        priceRange: {
          min: stats[0].minPrice || 0,
          max: stats[0].maxPrice || 0
        },
        propertyTypes: stats[0].propertyTypes || [],
        ratings: stats[0].ratings.sort((a, b) => b - a) || [],
        totalProperties: stats[0].totalProperties || 0
      };
    }
  } catch (error) {
    console.error('Error calculating filter stats:', error);
    return {
      priceRange: { min: 0, max: 0 },
      propertyTypes: [],
      ratings: [],
      totalProperties: 0
    };
  }
};


export const getPropertiesPendingChanges = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const { page = 1, limit = 10, sortBy = 'changedAt', sortOrder = 'desc' } = req.query;
    const skip = (page - 1) * limit;

    const properties = await Property.find({ 
      status: 'pending_changes' 
    })
    .populate('owner', 'name email')
    .populate('pendingChanges.changedBy', 'name email')
    .sort({ [`pendingChanges.${sortBy}`]: sortOrder === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Property.countDocuments({ status: 'pending_changes' });

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get change history for a property
export const getPropertyChangeHistory = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('pendingChanges.changedBy', 'name email')
      .populate('owner', 'name email');

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found',
      });
    }

    // Check authorization
    if (property.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized',
      });
    }

    const changeHistory = {
      propertyId: property._id,
      propertyName: property.placeName,
      currentStatus: property.status,
      pendingChanges: property.pendingChanges,
      lastApprovedAt: property.lastApprovedAt,
      lastChangedAt: property.lastChangedAt,
      hasPublishedVersion: !!property.publishedVersion,
      changedSteps: {
        step1: property.pendingChanges.step1Changed,
        step2: property.pendingChanges.step2Changed,
        step3: property.pendingChanges.step3Changed,
        step4: property.pendingChanges.step4Changed,
        step5: property.pendingChanges.step5Changed,
        step6: property.pendingChanges.step6Changed,
        step7: property.pendingChanges.step7Changed,
      }
    };

    res.status(200).json({
      success: true,
      data: changeHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get property status for user
export const getPropertyStatus = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findOne({
      _id: propertyId,
      owner: req.user._id,
    }).select('status pendingChanges lastApprovedAt lastChangedAt formProgress');

    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }

    const statusInfo = {
      status: property.status,
      formProgress: property.formProgress,
      pendingChanges: property.pendingChanges,
      lastApprovedAt: property.lastApprovedAt,
      lastChangedAt: property.lastChangedAt,
      message: getStatusMessage(property.status, property.pendingChanges),
    };

    return res.status(200).json({
      success: true,
      data: statusInfo,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Helper function to get status message
const getStatusMessage = (status, pendingChanges) => {
  switch (status) {
    case 'draft':
      return 'Property is in draft mode. Complete all steps to submit for review.';
    case 'pending':
      return 'Property is pending admin approval.';
    case 'published':
      return 'Property is live and published.';
    case 'rejected':
      return 'Property was rejected. Please make necessary changes and resubmit.';
    case 'pending_changes':
      const changedSteps = Object.keys(pendingChanges)
        .filter(key => key.includes('Changed') && pendingChanges[key])
        .map(key => key.replace('step', 'Step ').replace('Changed', ''))
        .join(', ');
      return `Changes made to ${changedSteps}. Awaiting admin approval.`;
    default:
      return 'Unknown status';
  }
};