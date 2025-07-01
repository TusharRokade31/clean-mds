import Property from '../models/Property.js';
import fs from 'fs';
import path from 'path';
import City from '../models/City.js';
import State from '../models/State.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { unlink } from 'fs/promises';
import { generateOTP, sendOTPEmail } from '../services/emailService.js';
import OTP from '../models/OTP.js';

const errorResponse = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};


// Get all properties (for admin or host)
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
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


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
      data: draftProperties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single property
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Check if user owns the property or is admin
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this property'
      });
    }
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

 
// Initialize a new property for multistep form
export const initializeProperty = async (req, res) => {
  try {
    const userId = req.user._id;
    const { forceNew } = req.body; // Add this parameter

    // If not forcing new, check for recent draft creation (within last 5 seconds)
    if (!forceNew) {
      const recentDraft = await Property.findOne({ 
        owner: userId, 
        'formProgress.formCompleted': false,
        createdAt: { $gte: new Date(Date.now() - 5000) } // 5 seconds ago
      });

      if (recentDraft) {
        return res.status(200).json({
          success: true,
          message: 'Recent draft found',
          property: recentDraft
        });
      }

      // Check for any existing draft
      const existingDraft = await Property.findOne({ 
        owner: userId, 
        'formProgress.formCompleted': false 
      });

      if (existingDraft) {
        return res.status(200).json({
          success: true,
          message: 'Draft property found',
          property: existingDraft
        });
      }
    }

    // Create a new draft with required fields initialized
    const newProperty = await Property.create({
      owner: userId,
      propertyType: 'Dharamshala',
      placeName: 'Draft Property',
      placeRating: '5.0',
      propertyBuilt: '2024',
      bookingSince: '2024-01-01',
      rentalForm: 'Entire place',
      email: "example@gmail.com",
      mobileNumber: '0123456789',
      location: {
        houseName: 'House/Building Name',
        country: 'India',
        street: 'Draft Street',
        city: 'Draft City',
        state: 'Draft State',
        postalCode: '000000'
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
        safety: new Map()
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
        formCompleted: false
      }
    });

    return res.status(201).json({
      success: true,
      message: 'New property draft created',
      property: newProperty
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

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

// Modified saveBasicInfo with email verification check
export const saveBasicInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const { propertyType, placeName, placeRating, propertyBuilt, bookingSince, rentalForm, email, mobileNumber, landline } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }

    // Check if email is verified (only if email is being changed)
    if (email && email !== property.email) {
      // If email is different, require verification
      const otpRecord = await OTP.findOne({ 
        email, 
        propertyId, 
        userId: req.user._id,
        verified: true
      });

      if (!otpRecord) {
        return errorResponse(res, 400, 'Please verify your email address first');
      }
      
      // Mark new email as verified
      property.emailVerified = true;
    } else if (email === property.email && property.emailVerified) {
      // Same email and already verified - keep verification status
      // No action needed
    } else if (email && !property.emailVerified) {
      // Same email but not verified yet
      return errorResponse(res, 400, 'Please verify your email address first');
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
    property.formProgress.step1Completed = true;
    
    await property.save();

    // Clean up verified OTP records for this email and property
    await OTP.deleteMany({ email, propertyId, verified: true });
    
    return res.status(200).json({
      success: true,
      message: 'Basic info saved successfully',
      property
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Save Step 2: Location
export const saveLocation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const { houseName,
      country, street, roomNumber, city, state, 
      postalCode, coordinates 
    } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
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
        state: stateRef 
      });
      if (cityDoc) {
        cityRef = cityDoc._id;
      }
    }
    
    // Update property with location info
    property.location = {
      houseName,
      country,
      street,
      roomNumber,
      city,
      state,
      stateRef,
      cityRef,
      postalCode,
      coordinates
    };
    property.formProgress.step2Completed = true;
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Location saved successfully',
      property
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
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

// Add a Room
export const addRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const roomData = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Add room to property
    property.rooms.push(roomData);
    
    await property.save();
    
    return res.status(201).json({
      success: true,
      message: 'Room added successfully',
      room: property.rooms[property.rooms.length - 1],
      property
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Update a Room
export const updateRoom = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId, roomId } = req.params;
    const roomData = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find room index
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    // Update room data
    Object.keys(roomData).forEach(key => {
      property.rooms[roomIndex][key] = roomData[key];
    });
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room updated successfully',
      room: property.rooms[roomIndex],
      property
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return errorResponse(res, 400, 'Validation error', error.message);
    }
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete a Room
export const deleteRoom = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find room index
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    // Remove room
    property.rooms.splice(roomIndex, 1);
    property.formProgress.step4Completed = property.rooms.length > 0;
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room deleted successfully',
      property
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};


export const completeRoomsStep = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Ensure at least one room has been added
    if (!Array.isArray(property.rooms) || property.rooms.length < 1) {
      return errorResponse(res, 400, 'You must add at least one room before completing this step');
    }
    
    // Mark step 4 as completed
    property.formProgress.step4Completed = true;
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Rooms step completed successfully',
      property
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
      return errorResponse(res, 400, 'No files uploaded');
    }
    
    // Add file count validation
    if (files.length > 20) {
      return errorResponse(res, 400, 'Cannot upload more than 20 files at once');
    }
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    const uploadedMedia = [];
    
    // Process each uploaded file
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const mediaUrl = `/${file.path.replace(/\\/g, '/')}`; // Normalize path separators
      
      const mediaItem = {
        url: mediaUrl,
        type: mediaType,
        filename: file.filename,
        tags: [], // Will be updated separately
        isCover: false,
        displayOrder: mediaType === 'image' ? property.media.images.length : property.media.videos.length,
        uploadedAt: new Date()
      };
      
      // Add to appropriate array
      if (mediaType === 'image') {
        property.media.images.push(mediaItem);
      } else {
        property.media.videos.push(mediaItem);
      }
      
      uploadedMedia.push({
        ...mediaItem,
        _id: property.media[mediaType === 'image' ? 'images' : 'videos'][property.media[mediaType === 'image' ? 'images' : 'videos'].length - 1]._id
      });
    }
    
    await property.save();
    
    return res.status(201).json({
      success: true,
      message: `${files.length} media files uploaded successfully`,
      uploadedMedia,
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Update Media Tags and Properties
export const updateMediaItem = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;
    const { tags, isCover, displayOrder } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
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
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Media item updated successfully',
      mediaItem,
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

export const validatePropertyMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
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
          index: index + 1
        });
      }
    });
    
    if (itemsWithoutTags.length > 0) {
      return errorResponse(res, 400, 'Some media items are missing tags', {
        itemsWithoutTags,
        message: 'Each media item must have at least one tag before proceeding'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'All media items have valid tags',
      totalMedia: allMedia.length
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Delete Media Item
export const deleteMediaItem = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
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
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Media item deleted successfully',
      property
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
      return errorResponse(res, 400, 'No files uploaded');
    }
    
    if (files.length > 20) {
      return errorResponse(res, 400, 'Cannot upload more than 20 files at once');
    }
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Find the specific room
    const roomIndex = property.rooms.findIndex(room => room._id.toString() === roomId);
    
    if (roomIndex === -1) {
      return errorResponse(res, 404, 'Room not found');
    }
    
    const room = property.rooms[roomIndex];
    const uploadedMedia = [];
    
    // Initialize media object if it doesn't exist
    if (!room.media) {
      room.media = { images: [], videos: [] };
    }
    
    // Process each uploaded file
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      const mediaUrl = `/${file.path.replace(/\\/g, '/')}`; // Normalize path separators
      
      const mediaItem = {
        url: mediaUrl,
        type: mediaType,
        filename: file.filename,
        tags: [], // Will be updated separately
        isCover: false,
        displayOrder: mediaType === 'image' ? room.media.images.length : room.media.videos.length,
        uploadedAt: new Date()
      };
      
      // Add to appropriate array
      if (mediaType === 'image') {
        room.media.images.push(mediaItem);
      } else {
        room.media.videos.push(mediaItem);
      }
      
      uploadedMedia.push({
        ...mediaItem,
        _id: room.media[mediaType === 'image' ? 'images' : 'videos'][room.media[mediaType === 'image' ? 'images' : 'videos'].length - 1]._id
      });
    }
    
    await property.save();
    
    return res.status(201).json({
      success: true,
      message: `${files.length} media files uploaded to room successfully`,
      uploadedMedia,
      room: property.rooms[roomIndex],
      property
    });
    
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Update Room Media Item
export const updateRoomMediaItem = async (req, res) => {
  try {
    const { propertyId, roomId, mediaId } = req.params;
    const { tags, isCover, displayOrder } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
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
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room media item updated successfully',
      mediaItem,
      room: property.rooms[roomIndex],
      property
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
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
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
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Room media item deleted successfully',
      room: property.rooms[roomIndex],
      property
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
        roomName: room.roomName
      }
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
        item.tags.some(tag => filterTags.includes(tag.toLowerCase()))
      );
    }
    
    // Sort by display order
    mediaItems.sort((a, b) => a.displayOrder - b.displayOrder);
    
    return res.status(200).json({
      success: true,
      count: mediaItems.length,
      data: mediaItems
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
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Check if minimum requirements are met (at least 10 media items)
    const totalMedia = property.media.images.length + property.media.videos.length;
    console.log(property)
    
    if (totalMedia < 10) {
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
    
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Media step completed successfully',
      property
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
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user._id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
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
        step7Completed
      });
    }
    
    // Mark property as complete
    property.formProgress.formCompleted = true;
    await property.save();
    
    return res.status(200).json({
      success: true,
      message: 'Property listing completed successfully',
      property
    });
  } catch (error) {
    return errorResponse(res, 500, 'Server error', error.message);
  }
};

// Admin: Approve or reject property
export const reviewProperty = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['published', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    let property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Only admin can approve/reject properties
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to review properties'
      });
    }
    
    property.status = status;
    property.updatedAt = Date.now();
    
    await property.save();
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
        error: 'Property not found'
      });
    }
    
    // Check if property is published and user is not an admin
    if (property.status === 'published' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can delete published properties'
      });
    }

    // Check ownership if property is not published
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this property'
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
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get properties by state
export const getPropertiesByState = async (req, res) => {
  try {
    const { state } = req.params;
    
    const properties = await Property.find({
      'location.state': state,
      'status': 'published'
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get properties by city
export const getPropertiesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const properties = await Property.find({
      'location.city': city,
      'status': 'published'
    });
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Search properties with filters
export const searchProperties = async (req, res) => {
  try {
    const {
      propertyType,
      state,
      city,
      minPrice,
      maxPrice,
      guests,
      amenities
    } = req.query;
    
    let query = { status: 'published' };
    
    // Add filters to query
    if (propertyType) query.propertyType = propertyType;
    if (state) query['location.state'] = state;
    if (city) query['location.city'] = city;
    if (guests) query['size.guests'] = { $gte: Number(guests) };
    
    if (minPrice || maxPrice) {
      query.pricing = {};
      if (minPrice) query.pricing.weekdayPrice = { $gte: Number(minPrice) };
      if (maxPrice) query.pricing.weekdayPrice = { ...query.pricing.weekdayPrice, $lte: Number(maxPrice) };
    }
    
    if (amenities) {
      const amenitiesList = amenities.split(',');
      query['amenities.general'] = { $in: amenitiesList };
    }
    
    const properties = await Property.find(query);
    
    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
          avgPrice: { $avg: '$pricing.weekdayPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      count: stateStats.length,
      data: stateStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
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
        error: 'Please provide check-in and check-out dates'
      });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const property = await Property.findById(id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
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
          pricing: property.pricing
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

