// BookingSchema.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const GuestSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  idType: {
    type: String,
    enum: ['passport', 'driving_license', 'aadhar', 'voter_id', 'other'],
    required: [true, 'ID type is required'],
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Guest must be at least 18 years old'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required'],
  },
});

// ─── NEW: per-room sub-document inside a booking ─────────────────────────────
const BookedRoomSchema = new Schema({
  // Reference to the room sub-document inside Property.rooms
  room: {
    type: Schema.Types.ObjectId,
    required: [true, 'Room reference is required'],
  },

  // Snapshot of the room name so it remains readable even if property is edited
  roomName: {
    type: String,
  },

  // Guests assigned to this specific room
  guestCount: {
    adults: {
      type: Number,
      required: [true, 'Adult count is required'],
      min: [1, 'At least one adult is required'],
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative'],
    },
  },

  // Pricing breakdown per room
  pricing: {
    baseCharge:      { type: Number, required: true },
    extraAdultCharge:{ type: Number, default: 0 },
    childCharge:     { type: Number, default: 0 },
    subtotal:        { type: Number, required: true },
    taxes:           { type: Number, default: 0 },
    discount:        { type: Number, default: 0 },
    totalAmount:     { type: Number, required: true },
  },
}, { _id: false });
// ─────────────────────────────────────────────────────────────────────────────

const BookingSchema = new Schema({
  bookingId: {
    type: String,
    unique: true,
  },

  // Property Reference
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
  },

  // ── MULTI-ROOM: replaces the old single `room` field ──────────────────────
  rooms: {
    type: [BookedRoomSchema],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one room must be booked',
    },
  },
  // ──────────────────────────────────────────────────────────────────────────

  // Guest Information
  primaryGuest: {
    type: GuestSchema,
    required: [true, 'Primary guest information is required'],
  },
  additionalGuests: [GuestSchema],

  // Booking Dates (shared across all rooms in one booking)
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
  },

  // Total days (derived, stored for convenience)
  totalDays: {
    type: Number,
    required: [true, 'Total days is required'],
  },

  // Aggregate guest count across all rooms
  guestCount: {
    adults: {
      type: Number,
      required: [true, 'Adult count is required'],
      min: [1, 'At least one adult is required'],
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Children count cannot be negative'],
    },
  },

  // Aggregate Pricing (sum of all rooms)
  pricing: {
    baseCharge:       { type: Number, required: true },
    extraAdultCharge: { type: Number, default: 0 },
    childCharge:      { type: Number, default: 0 },
    totalDays:        { type: Number, required: true },
    subtotal:         { type: Number, required: true },
    taxes:            { type: Number, default: 0 },
    discount:         { type: Number, default: 0 },
    totalAmount:      { type: Number, required: true },
  },

  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'other'],
      required: [true, 'Payment method is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAmount:    { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    transactionId: String,
    paymentDate:   Date,
  },

  // Booking Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled', 'no-show'],
    default: 'draft',
  },

  specialRequests: { type: String, trim: true },

  source: {
    type: String,
    enum: ['walk-in', 'phone', 'online', 'agent'],
    default: 'walk-in',
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  cancellation: {
    cancelledAt: Date,
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    refundAmount: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Generate booking ID before saving
BookingSchema.pre('save', async function (next) {
  if (!this.bookingId) {
    const date  = new Date();
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');

    const todayStart = new Date(year, date.getMonth(), date.getDate());
    const todayEnd   = new Date(year, date.getMonth(), date.getDate() + 1);

    const count    = await this.constructor.countDocuments({ createdAt: { $gte: todayStart, $lt: todayEnd } });
    const sequence = String(count + 1).padStart(3, '0');
    this.bookingId = `BK${year}${month}${day}${sequence}`;
  }
  next();
});

// Recalculate pending amount before every save
BookingSchema.pre('save', function (next) {
  this.payment.pendingAmount = this.pricing.totalAmount - this.payment.paidAmount;
  next();
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;