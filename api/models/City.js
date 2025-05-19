// City.js
import mongoose from 'mongoose';
import State from './State.js';

const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a city name'],
    trim: true
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: State,
    required: [true, 'Please add a state']
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

// Make sure city names are unique within a state
CitySchema.index({ name: 1, state: 1 }, { unique: true });

const City = mongoose.model('City', CitySchema);

export default City;