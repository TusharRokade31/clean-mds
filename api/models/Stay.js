// Stay.js
import mongoose from 'mongoose';

const StaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a Stay name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Stay = mongoose.model('Stay', StaySchema);

export default Stay;