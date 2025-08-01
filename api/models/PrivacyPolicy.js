// models/PrivacyPolicy.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PrivacyPolicySchema = new Schema({
  // Property reference
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
  },
  
  // Check-in & Check-out Times
  checkInCheckOut: {
    checkInTime: {
      type: String,
      required: [true, 'Check-in time is required'],
      default: '12:00 pm (noon)',
    },
    checkOutTime: {
      type: String,
      required: [true, 'Check-out time is required'],
      default: '12:00 pm (noon)',
    },
    has24HourCheckIn: {
      type: Boolean,
      default: false,
    },
  },
  
  // Cancellation Policy
cancellationPolicy: {
  type: String,
  enum: [
    'free_cancellation_checkin', 
    'free_cancellation_24h',
    'free_cancellation_48h', 
    'free_cancellation_72h',
    'free_cancellation_custom',
    'non_refundable',
  ],
  required: [true, 'Cancellation policy is required'],
  default: 'free_cancellation_checkin',
},
customCancellationHours: {
  type: Number,
  min: 1,
  max: 168, // 7 days max
},
  // Property Rules
  propertyRules: {
    guestProfile: {
      allowUnmarriedCouples: {
        type: Boolean,
        default: false,
      },
      allowGuestsBelow18: {
        type: Boolean,
        default: false,
      },
      allowOnlyMaleGuests: {
        type: Boolean,
        default: false,
      },
    },
    
    acceptableIdentityProofs: [{
      type: String,
      enum: [
        'passport',
        'drivers_license',
        'national_id',
        'voter_id',
        'aadhaar_card',
        'pan_card',
      ],
    }],
    

  },

  // Property Restrictions
  propertyRestrictions: {
    nonVegetarianFood: {
      allowed: {
        type: Boolean,
        default: true,
      },
      restrictions: {
        type: String,
        default: '',
      },
    },
    alcoholSmoking: {
      alcoholAllowed: {
        type: Boolean,
        default: false,
      },
      smokingAllowed: {
        type: Boolean,
        default: false,
      },
      smokingAreas: {
        type: String,
        enum: ['not_allowed', 'designated_areas', 'everywhere'],
        default: 'not_allowed',
      },
      restrictions: {
        type: String,
        default: '',
      },
    },
    noiseRestrictions: {
      quietHours: {
        enabled: {
          type: Boolean,
          default: true,
        },
        startTime: {
          type: String,
          default: '10:00 PM',
        },
        endTime: {
          type: String,
          default: '7:00 AM',
        },
      },
      musicAllowed: {
        type: Boolean,
        default: true,
      },
      partyAllowed: {
        type: Boolean,
        default: false,
      },
      restrictions: {
        type: String,
        default: '',
      },
    },
  },

  // Pet Policy
  petPolicy: {
    petsAllowed: {
      type: Boolean,
      default: false,
    },
    petTypes: [{
      type: String,
      enum: ['dogs', 'cats', 'birds', 'fish', 'small_pets', 'others'],
    }],
    petDeposit: {
      required: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        default: 0,
      },
    },
    petRules: {
      type: String,
      default: '',
    },
  },

  // Custom Policies
  customPolicies: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],

  // Meal Rack Prices
  mealPrices: {
    breakfast: {
      available: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
        default: '',
      },
    },
    lunch: {
      available: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
        default: '',
      },
    },
    dinner: {
      available: {
        type: Boolean,
        default: false,
      },
      price: {
        type: Number,
        default: 0,
      },
      description: {
        type: String,
        default: '',
      },
    },
  },
  
  // Data Collection & Privacy
  dataCollection: {
    personalDataCollection: {
      type: Boolean,
      default: true,
    },
    dataTypes: [{
      type: String,
      enum: [
        'name',
        'email',
        'phone',
        'address', 
        'identity_proof',
        'payment_info',
        'booking_history',
        'preferences',
      ],
    }],
    dataRetentionPeriod: {
      type: Number, // in months
      default: 24,
    },
    shareDataWithThirdParties: {
      type: Boolean,
      default: false,
    },
    thirdPartyServices: [{
      serviceName: String,
      purpose: String,
    }],
  },
  
  // Communication Preferences
  communication: {
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'whatsapp', 'sms'],
      default: 'phone',
    },
    allowMarketingCommunication: {
      type: Boolean,
      default: false,
    },
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  effectiveDate: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required'],
  },
}, {
  timestamps: true,
});

// Indexes
PrivacyPolicySchema.index({ property: 1 });
PrivacyPolicySchema.index({ property: 1, isActive: 1 });

// Pre-save middleware to update version and lastUpdated
PrivacyPolicySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
    this.lastUpdated = new Date();
  }
  next();
});

const PrivacyPolicy = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);
export default PrivacyPolicy;