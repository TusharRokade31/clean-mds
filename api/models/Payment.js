// api/models/Payment.js
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  merchantTransactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  transactionId: {
    type: String,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  gateway: {
    type: String,
    default: 'phonepe'
  },
  paymentDate: {
    type: Date
  },
  failureReason: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ booking: 1, status: 1 });

export default mongoose.model('Payment', PaymentSchema);