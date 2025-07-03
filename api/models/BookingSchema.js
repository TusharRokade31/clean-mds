// BookingSchema.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GuestSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  idType: {
    type: String,
    enum: ['passport', 'driving_license', 'aadhar', 'voter_id', 'other'],
    required: [true, 'ID type is required']
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  }
});

const BookingSchema = new Schema({
  bookingId: {
    type: String,
    unique: true,
  },
  
  // Property and Room References
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required']
  },
  room: {
    type: Schema.Types.ObjectId,
    required: [true, 'Room reference is required']
  },
  
  // Guest Information
  primaryGuest: {
    type: GuestSchema,
    required: [true, 'Primary guest information is required']
  },
  additionalGuests: [GuestSchema],
  
  // Booking Dates
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  
  // Guest Count
  guestCount: {
    adults: {
      type: Number,
      required: [true, 'Adult count is required'],
      min: [1, 'At least one adult is required']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative']
    }
  },
  
  // Pricing Details
  pricing: {
    baseCharge: {
      type: Number,
      required: [true, 'Base charge is required']
    },
    extraAdultCharge: {
      type: Number,
      default: 0
    },
    childCharge: {
      type: Number,
      default: 0
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days is required']
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required']
    },
    taxes: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required']
    }
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
      required: [true, 'Payment method is required']
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAmount: {
      type: Number,
      default: 0
    },
    pendingAmount: {
      type: Number,
      default: 0
    },
    transactionId: String,
    paymentDate: Date
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'confirmed'
  },
  
  // Special Requests
  specialRequests: {
    type: String,
    trim: true
  },
  
  // Booking Source
  source: {
    type: String,
    enum: ['walk-in', 'phone', 'online', 'agent'],
    default: 'walk-in'
  },
  
  // Staff who created the booking
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Cancellation details
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Generate booking ID before saving
BookingSchema.pre('save', async function(next) {
  if (!this.bookingId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count bookings for today to generate sequence
    const todayStart = new Date(year, date.getMonth(), date.getDate());
    const todayEnd = new Date(year, date.getMonth(), date.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const sequence = String(count + 1).padStart(3, '0');
    this.bookingId = `BK${year}${month}${day}${sequence}`;
  }
  next();
});

// Calculate pending amount before saving
BookingSchema.pre('save', function(next) {
  this.payment.pendingAmount = this.pricing.totalAmount - this.payment.paidAmount;
  next();
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;