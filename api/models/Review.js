// Review.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: [true, 'Property reference is required'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  photos: [{
    url: String,
    filename: String,
  }],
  stayDate: {
    checkIn: Date,
    checkOut: Date,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  helpful: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reply: {
    comment: String,
    repliedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    repliedAt: Date,
  },
}, {
  timestamps: true,
});

// Prevent duplicate reviews from same user for same property
ReviewSchema.index({ property: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;