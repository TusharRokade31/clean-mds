// PropertySchema.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import City from './City.js';
import State from './State.js';

// Amenity selection schema (for handling Yes/No + options)
const AmenitySelectionSchema = new Schema({
  available: {
    type: Boolean,
    default: false,
  },
  option: [{
    type: String,
  }],
  subOptions: [{
    type: String,
  }],
});

const MediaSchema = new Schema({
  url: {
    type: String,
    required: [true, 'Media URL is required'],
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Media type is required'],
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isCover: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Room schema
const RoomSchema = new Schema({
  numberRoom: { 
    type: Number, 
    required: [true, 'Room name is required'], 
  },
  roomName: { 
    type: String, 
    required: [true, 'Room name is required'], 
  },
  roomSize: { 
    type: Number,
    required: [true, 'Room size is required'],
  },
  sizeUnit: {
    type: String,
    enum: ['sqft', 'sqm'],
    required: [true, 'Size unit is required'],
  },
  description: { 
    type: String, 
  },

  // Add media support to rooms
  media: {
    images: [MediaSchema],
    videos: [MediaSchema],
    coverImage: {
      type: String, // Changed from ObjectId to String for direct URL storage
    },
  },

  FloorBedding: {
    available: { type: Boolean, default: false },
    count: { type: String },
  },
  
  // ... rest of your room schema
  beds: [{
    bedType: { 
      type: String,
      required: [true, 'Bed type is required'],
    },
    count: { 
      type: Number,
      required: [true, 'Bed count is required'],
      min: [1, 'Must have at least one bed'],
    },
    accommodates: { 
      type: Number,
      required: [true, 'Number of people the bed accommodates is required'],
    },
  }],
  
  alternativeBeds: [{
    bedType: { type: String },
    count: { type: Number, min: 0 },
    accommodates: { type: Number, min: 0 },
  }],
  
  occupancy: {
    baseAdults: { 
      type: Number, 
      required: [true, 'Base adults count is required'],
      min: [1, 'Must accommodate at least one adult'],
    },
    maximumAdults: { 
      type: Number, 
      required: [true, 'Maximum adults count is required'], 
    },
    maximumChildren: { 
      type: Number, 
      required: [true, 'Maximum children count is required'], 
    },
    maximumOccupancy: { 
      type: Number, 
      required: [true, 'Maximum occupancy is required'], 
    },
  },
  
  bathrooms: {
    count: { 
      type: Number, 
      required: [true, 'Bathroom count is required'],
      min: [0, 'Bathroom count cannot be negative'],
    },
    private: { 
      type: Boolean, 
      default: true, 
    },
    shared: { 
      type: Boolean, 
      default: false,
    },
  },
  
  mealPlan: {
    available: { type: Boolean, default: false },
    planType: { type: String },
  },
  
  pricing: {
    baseAdultsCharge: { 
      type: Number, 
      required: [true, 'Base charge for adults is required'], 
    },
    extraAdultsCharge: { 
      type: Number, 
      required: [true, 'Extra adult charge is required'], 
    },
    childCharge: { 
      type: Number, 
      required: [true, 'Child charge is required'], 
    },
  },
  
  availability: [{
    startDate: { 
      type: Date, 
      required: [true, 'Start date is required'], 
    },
    endDate: { 
      type: Date, 
      required: [true, 'End date is required'], 
    },
    availableUnits: {
      type: Number,
      required: [true, 'Available units is required'],
      min: [0, 'Available units cannot be negative'],
    },
  }],
  
  amenities: {
    mandatory: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    popularWithGuests: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    bathroom: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    roomFeatures: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    kitchenAppliances: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    bedsAndBlanket: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    safetyAndSecurity: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    otherFacilities: {
      type: Map,
      of: AmenitySelectionSchema,
    },
  },
}, {
  timestamps: true,
});

// Property Schema
const PropertySchema = new Schema({
  // Step 1 - Basic Info
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: [
      'Dharamshala (Basic spiritual lodging run by religious trusts or communities)', 
      'Dharamshala', 
      'Ashram(Spiritual centers offering meditation/yoga stay with a guru or community)', 
      'Trust Guest House( Guesthouses owned/operated by temple or religious trusts)', 
      'Yatri Niwas / Pilgrim Lodge(Budget stays designed for pilgrims by governments or religious orgs)',
    ],
  },
  placeName: {
    type: String,
    required: [true, 'Place name is required'],
  },
  placeRating: {
    type: String,
  },
  propertyBuilt: {
    type: String,
    required: [true, 'Property built year is required'],
  },
  bookingSince: {
    type: String,
    required: [true, 'Booking since date is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile Number is required'],
  },
  landline: {
    type: String,
  },
  rentalForm: {
    type: String,
    enum: ['Entire place', 'Private room', 'Share room'],
  },
  
  // Step 2 - Location
  location: {
    houseName: { 
      type: String, 
      required: [true, 'House/Building Name is required'], 
    },
    country: { 
      type: String, 
      required: [true, 'Country is required'], 
    },
    street: { 
      type: String, 
      required: [true, 'Street address is required'], 
    },
    roomNumber: { 
      type: String, 
    },
    city: { 
      type: String, 
      required: [true, 'City is required'], 
    },
    state: { 
      type: String, 
      required: [true, 'State is required'], 
    },
    stateRef: { 
      type: Schema.Types.ObjectId, 
      ref: 'State', 
    },
    cityRef: { 
      type: Schema.Types.ObjectId, 
      ref: 'City',
    },
    postalCode: { 
      type: String, 
      required: [true, 'Postal code is required'], 
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },

  // Step 3 - Property Amenities
  amenities: {
    mandatory: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    basicFacilities: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    generalServices: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    commonArea: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    foodBeverages: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    healthWellness: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    mediaTechnology: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    paymentServices: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    security: {
      type: Map,
      of: AmenitySelectionSchema,
    },
    safety: {
      type: Map,
      of: AmenitySelectionSchema,
    },
  },

  // Step 4 - Rooms
  rooms: [RoomSchema],

  // Step 5 - Media (Photos and Videos) - FIXED
  media: {
    images: [MediaSchema],
    videos: [MediaSchema],
    coverImage: {
      type: String, // Changed from ObjectId reference to direct string URL
    },
  },
  
  // Tracking form completion status
  formProgress: {
    step1Completed: { type: Boolean, default: false },
    step2Completed: { type: Boolean, default: false },
    step3Completed: { type: Boolean, default: false },
    step4Completed: { type: Boolean, default: false },
    step5Completed: { type: Boolean, default: false },
    step6Completed: { type: Boolean, default: false },
    step7Completed: { type: Boolean, default: false },
    formCompleted: { type: Boolean, default: false },
  },
  
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected', 'pending_changes'],
    default: 'draft',
  },


    // Track what was changed
  pendingChanges: {
    step1Changed: { type: Boolean, default: false },
    step2Changed: { type: Boolean, default: false },
    step3Changed: { type: Boolean, default: false },
    step4Changed: { type: Boolean, default: false },
    step5Changed: { type: Boolean, default: false },
    step6Changed: { type: Boolean, default: false },
    step7Changed: { type: Boolean, default: false },
    changedAt: { type: Date },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  
  // Keep original published data for comparison
  publishedVersion: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  lastApprovedAt: { type: Date },
  lastChangedAt: { type: Date },
  
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property must belong to a user'],
  },
}, {
  timestamps: true,
});

const Property = mongoose.model('Property', PropertySchema);

export default Property;