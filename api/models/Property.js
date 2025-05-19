import mongoose from 'mongoose';
import State from './State.js';
import City from './City.js'
import Stay from './Stay.js';


const PropertySchema = new mongoose.Schema({
  // Page 1 - Basic Info
  propertyType: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: 'Stay',
    required: true,
    enum: ['Hotel', 'Cottage', 'Villa', 'Cabin', 'Farm stay', 'Houseboat', 'Lighthouse']
  },
  placeName: {
    type: String,
    required: true
  },
  rentalForm: {
    type: String,
    required: true,
    enum: ['Entire place', 'Private room', 'Share room']
  },
  
  // Page 2 - Location
  location: {
    country: { type: String, required: true },
    street: { type: String, required: true },
    roomNumber: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    stateRef: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: State
    },
    cityRef: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: City
    },
    postalCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  // Page 3 - Size
  size: {
    acreage: { type: Number, required: true },
    guests: { type: Number, default: 1 },
    bedrooms: { type: Number, default: 1 },
    beds: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    kitchens: { type: Number, default: 1 }
  },
  
  // Page 4 - Amenities
  amenities: {
    general: [String],
    other: [String],
    safety: [String]
  },
  
  // Page 5 - Rules
  rules: {
    smoking: { type: String, enum: ['Do not allow', 'Allow', 'Charge'], default: 'Do not allow' },
    pets: { type: String, enum: ['Do not allow', 'Allow', 'Charge'], default: 'Do not allow' },
    partyOrganizing: { type: String, enum: ['Do not allow', 'Allow', 'Charge'], default: 'Do not allow' },
    cooking: { type: String, enum: ['Do not allow', 'Allow', 'Charge'], default: 'Do not allow' },
    additionalRules: [String]
  },
  
  // Page 6 - Description
  description: {
    type: String,
    required: true
  },
  
  // Page 7 - Images
  images: {
    cover: { type: String },
    additional: [String]
  },
  
  // Page 8 - Pricing
  pricing: {
    currency: { type: String, default: 'USD' },
    weekdayPrice: { type: Number, required: true },
    weekendPrice: { type: Number, required: true },
    monthlyDiscount: { type: Number, default: 0 }
  },
  
  // Page 9 - Availability
  availability: {
    minNights: { type: Number, default: 1 },
    maxNights: { type: Number, default: 99 },
    blockedDates: [Date] 
  },

  // For Indian properties
indianSpecifics: {
  gstRegistered: { type: Boolean, default: false },
  gstNumber: { type: String },
  nearbyLandmarks: [String],
  localLanguagesSpoken: [String]
},

// For reviews and ratings
ratings: {
  average: { type: Number, default: 0 },
  cleanliness: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  checkIn: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  location: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
},

// For Indian seasons and festivals pricing
seasonalPricing: [{
  season: { type: String, enum: ['Summer', 'Monsoon', 'Winter', 'Spring'] },
  startDate: Date,
  endDate: Date,
  priceMultiplier: { type: Number, default: 1 }
}],

festivalPricing: [{
  festival: String,
  date: Date,
  priceMultiplier: { type: Number, default: 1.5 }
}],
  
  // Additional fields
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  currentStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Property = mongoose.model('Property', PropertySchema);


export default Property;