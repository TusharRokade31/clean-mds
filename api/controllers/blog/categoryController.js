// Controller (controllers/blogController.js)
import Category from '../../models/Category.js';
import CategoryVersion from '../../models/CategoryVersion.js';
import asyncHandler from '../../middleware/async.js';


// Create category
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const category = await Category.create({ name });
  
  // Create version 1
  await CategoryVersion.create({
    categoryId: category._id,
    name: category.name,
    slug: category.slug
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

// Get all categories
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isDeleted: false }).sort({ name: 1 });

  res.json({
    success: true,
    data: categories
  });
});

// Update category
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category || category.isDeleted) {
    throw createError(404, 'Category not found or deleted');
  }

  // Increment version
  const newVersion = category.currentVersion + 1;

  // Create new version entry
  await CategoryVersion.create({
    categoryId: category._id,
    version: newVersion,
    name: req.body.name || category.name,
    slug: req.body.name
      ? req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : category.slug
  });

  // Update category
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    { ...req.body, currentVersion: newVersion, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedCategory
  });
});


// Delete category (soft delete)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category || category.isDeleted) {
    throw createError(404, 'Category not found or already deleted');
  }

  // Check if category is used in any blogs
  const blogs = await Blog.find({ categories: req.params.id });
  if (blogs.length > 0) {
    throw createError(400, 'Cannot delete category used in blogs');
  }

  // Soft delete by setting isDeleted to true
  await Category.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    updatedAt: Date.now()
  });

  res.json({
    success: true,
    message: 'Category soft deleted successfully'
  });
});

// Get category versions
export const getCategoryVersions = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category || category.isDeleted) {
    throw createError(404, 'Category not found or deleted');
  }

  const versions = await CategoryVersion.find({ categoryId: req.params.id })
    .sort({ version: 1 });

  res.json({
    success: true,
    data: versions
  });
});