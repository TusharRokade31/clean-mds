// Wishlist.js (Schema)
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  properties: [{
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Ensure one wishlist per user
WishlistSchema.index({ user: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', WishlistSchema);
export default Wishlist;