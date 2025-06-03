import Property from '../models/Property.js';
import fs from 'fs';
import path from 'path';
import City from '../models/City.js';
import State from '../models/State.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { unlink } from 'fs/promises';

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
      query.host = req.user.id;
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
      query.host = req.user.id;  
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
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
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
    const userId = req.user.id;

    // Check for existing draft
    const existingDraft = await Property.findOne({ 
      owner: userId, 
      'formProgress.formCompleted': false 
    });

    // if (existingDraft) {
    //   return res.status(200).json({
    //     success: true,
    //     message: 'Draft property found',
    //     property: existingDraft
    //   });
    // }

    // Create a new draft with required fields initialized
    const newProperty = await Property.create({
      owner: userId,
      propertyType: 'Hotel',
      placeName: 'Draft Property',
      placeRating: '5.0',
      propertyBuilt: '2024',
      bookingSince: '2024-01-01',
      rentalForm: 'Entire place',
      location: {
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
      rooms: [], // start with an empty array
      formProgress: {
        step1Completed: false,
        step2Completed: false,
        step3Completed: false,
        step4Completed: false,
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

// Save Step 1: Basic Info
export const saveBasicInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, 'Validation errors', errors.array());
    }

    const { propertyId } = req.params;
    const { propertyType, placeName, placeRating, propertyBuilt, bookingSince, rentalForm } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Update property with basic info
    property.propertyType = propertyType;
    property.placeName = placeName;
    property.placeRating = placeRating;
    property.propertyBuilt = propertyBuilt;
    property.bookingSince = bookingSince;
    property.rentalForm = rentalForm;
    property.formProgress.step1Completed = true;
    
    await property.save();
    
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
    const { 
      country, street, roomNumber, city, state, 
      postalCode, coordinates 
    } = req.body;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
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
      owner: req.user.id
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
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Add room to property
    property.rooms.push(roomData);
    property.formProgress.step4Completed = property.rooms.length > 0;
    
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
      owner: req.user.id
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
      owner: req.user.id
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


// Upload Media (Images and Videos)
export const uploadPropertyMedia = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return errorResponse(res, 400, 'No files uploaded');
    }
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
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
      owner: req.user.id
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
      return errorResponse(res, 404, 'Media item not found');
    }
    
    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      mediaItem.tags = tags;
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

// Delete Media Item
export const deleteMediaItem = async (req, res) => {
  try {
    const { propertyId, mediaId } = req.params;
    
    // Check if property exists and belongs to user
    const property = await Property.findOne({ 
      _id: propertyId,
      owner: req.user.id
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
      owner: req.user.id
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
      owner: req.user.id
    });
    
    if (!property) {
      return errorResponse(res, 404, 'Property not found or unauthorized');
    }
    
    // Check if all steps are completed
    const { step1Completed, step2Completed, step3Completed, step4Completed, step5Completed  } = property.formProgress;
    
    if (!step1Completed || !step2Completed || !step3Completed || !step4Completed || !step5Completed) {
      return errorResponse(res, 400, 'Cannot complete listing - some steps are incomplete', {
        step1Completed,
        step2Completed,
        step3Completed,
        step4Completed,
        step5Completed
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
    
    // Check ownership
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this property'
      });
    }
    
    // Delete associated images
    if (property.images.cover) {
      fs.unlinkSync(property.images.cover);
    }
    
    if (property.images.additional && property.images.additional.length > 0) {
      property.images.additional.forEach(imagePath => {
        fs.unlinkSync(imagePath);
      });
    }
    
    await property.remove();
    
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

