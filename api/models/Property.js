// PropertySchema.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import City from './City.js'
import State from './State.js';

// Amenity selection schema (for handling Yes/No + options)
const AmenitySelectionSchema = new Schema({
  available: {
    type: Boolean,
    default: false
  },
  option: [{
    type: String,
  }],
  subOptions: [{
    type: String
  }]
});


const MediaSchema = new Schema({
  url: {
    type: String,
    required: [true, 'Media URL is required']
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Media type is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isCover: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});



// Room schema
const RoomSchema = new Schema({
  roomType: { 
    type: String, 
    required: [true, 'Room type is required'] 
  },
  roomName: { 
    type: String, 
    required: [true, 'Room name is required'] 
  },
  roomSize: { 
    type: Number,
    required: [true, 'Room size is required']
  },
  sizeUnit: {
    type: String,
    enum: ['sqft', 'sqm'],
    required: [true, 'Size unit is required']
  },
  description: { 
    type: String 
  },
  
  // Sleeping arrangement
  beds: [{
    bedType: { 
      type: String,
      required: [true, 'Bed type is required']
    },
    count: { 
      type: Number,
      required: [true, 'Bed count is required'],
      min: [1, 'Must have at least one bed']
    },
    accommodates: { 
      type: Number,
      required: [true, 'Number of people the bed accommodates is required']
    }
  }],
  
  // Alternative sleeping arrangement
  alternativeBeds: [{
    bedType: { type: String },
    count: { type: Number, min: 0 },
    accommodates: { type: Number, min: 0 }
  }],
  
  // Occupancy
  occupancy: {
    baseAdults: { 
      type: Number, 
      required: [true, 'Base adults count is required'],
      min: [1, 'Must accommodate at least one adult']
    },
    maximumAdults: { 
      type: Number, 
      required: [true, 'Maximum adults count is required'] 
    },
    maximumChildren: { 
      type: Number, 
      required: [true, 'Maximum children count is required'] 
    },
    maximumOccupancy: { 
      type: Number, 
      required: [true, 'Maximum occupancy is required'] 
    }
  },
  
  // Bathroom details
  bathrooms: {
    count: { 
      type: Number, 
      required: [true, 'Bathroom count is required'],
      min: [0, 'Bathroom count cannot be negative']
    },
    private: { 
      type: Boolean, 
      default: true 
    }
  },
  
  // Meal plan
  mealPlan: {
    available: { type: Boolean, default: false },
    planType: { type: String }
  },
  
  // Room pricing
  pricing: {
    baseAdultsCharge: { 
      type: Number, 
      required: [true, 'Base charge for adults is required'] 
    },
    extraAdultsCharge: { 
      type: Number, 
      required: [true, 'Extra adult charge is required'] 
    },
    childCharge: { 
      type: Number, 
      required: [true, 'Child charge is required'] 
    }
  },
  
  // Room availability
  availability: [{
    startDate: { 
      type: Date, 
      required: [true, 'Start date is required'] 
    },
    endDate: { 
      type: Date, 
      required: [true, 'End date is required'] 
    },
    availableUnits: {
      type: Number,
      required: [true, 'Available units is required'],
      min: [0, 'Available units cannot be negative']
    }
  }],
  
  // Room amenities with Yes/No selection
  amenities: {
    mandatory: {
      type: Map,
      of: AmenitySelectionSchema
    },
    popularWithGuests: {
      type: Map,
      of: AmenitySelectionSchema
    },
    bathroom: {
      type: Map,
      of: AmenitySelectionSchema
    },
    roomFeatures: {
      type: Map,
      of: AmenitySelectionSchema
    },
    kitchenAppliances: {
      type: Map,
      of: AmenitySelectionSchema
    },
    bedsAndBlanket: {
      type: Map,
      of: AmenitySelectionSchema
    },
    safetyAndSecurity: {
      type: Map,
      of: AmenitySelectionSchema
    },
    otherFacilities: {
      type: Map,
      of: AmenitySelectionSchema
    }
  }
}, {
  timestamps: true
});

// Property Schema
const PropertySchema = new Schema({
  // Step 1 - Basic Info
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['Hotel', 'Cottage', 'Villa', 'Cabin', 'Farm stay', 'Houseboat', 'Lighthouse']
  },
  placeName: {
    type: String,
    required: [true, 'Place name is required']
  },
  placeRating: {
    type: String,
    required: [true, 'Place rating is required']
  },
  propertyBuilt: {
    type: String,
    required: [true, 'Property built year is required']
  },
  bookingSince: {
    type: String,
    required: [true, 'Booking since date is required']
  },
  rentalForm: {
    type: String,
    required: [true, 'Rental form is required'],
    enum: ['Entire place', 'Private room', 'Share room']
  },
  
  // Step 2 - Location
  location: {
    country: { 
      type: String, 
      required: [true, 'Country is required'] 
    },
    street: { 
      type: String, 
      required: [true, 'Street address is required'] 
    },
    roomNumber: { 
      type: String 
    },
    city: { 
      type: String, 
      required: [true, 'City is required'] 
    },
    state: { 
      type: String, 
      required: [true, 'State is required'] 
    },
    stateRef: { 
      type: Schema.Types.ObjectId, 
      ref: State 
    },
    cityRef: { 
      type: Schema.Types.ObjectId, 
      ref: City
    },
    postalCode: { 
      type: String, 
      required: [true, 'Postal code is required'] 
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },

  // Step 3 - Property Amenities
  amenities: {
    mandatory: {
      type: Map,
      of: AmenitySelectionSchema
    },
    basicFacilities: {
      type: Map,
      of: AmenitySelectionSchema
    },
    generalServices: {
      type: Map,
      of: AmenitySelectionSchema
    },
    commonArea: {
      type: Map,
      of: AmenitySelectionSchema
    },
    foodBeverages: {
      type: Map,
      of: AmenitySelectionSchema
    },
    healthWellness: {
      type: Map,
      of: AmenitySelectionSchema
    },
    mediaTechnology: {
      type: Map,
      of: AmenitySelectionSchema
    },
    paymentServices: {
      type: Map,
      of: AmenitySelectionSchema
    },
    security: {
      type: Map,
      of: AmenitySelectionSchema
    },
    safety: {
      type: Map,
      of: AmenitySelectionSchema
    }
  },

  // Step 4 - Rooms (multiple rooms can be added to a property)
  rooms: [RoomSchema],

  // Step 5 - Media (Photos and Videos)
media: {
  images: [MediaSchema],
  videos: [MediaSchema],
  coverImage: {
    type: Schema.Types.ObjectId,
    ref: 'Media'  // Reference to the cover image
  }
},
  
  // Tracking form completion status
  formProgress: {
    step1Completed: { type: Boolean, default: false },
    step2Completed: { type: Boolean, default: false },
    step3Completed: { type: Boolean, default: false },
    step4Completed: { type: Boolean, default: false },
     step5Completed: { type: Boolean, default: false },
    formCompleted: { type: Boolean, default: false }
  },
  
    status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'draft'
  },
  
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property must belong to a user']
  }
}, {
  timestamps: true
});

const Property = mongoose.model('Property', PropertySchema);

export default Property;