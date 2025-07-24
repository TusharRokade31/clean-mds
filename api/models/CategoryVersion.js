import mongoose from 'mongoose';

const categoryVersionSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category ID is required']
  },
  version: {
    type: Number,
    default:1,
    required: [true, 'Version number is required']
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique version per category
categoryVersionSchema.index({ categoryId: 1, version: 1 }, { unique: true });

export default mongoose.model('CategoryVersion', categoryVersionSchema);