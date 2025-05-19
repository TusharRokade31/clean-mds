// State.js
import mongoose from 'mongoose';

const StateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a state name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please add a state code'],
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

const State = mongoose.model('State', StateSchema);

export default State;