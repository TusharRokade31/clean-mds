// Controller (controllers/blogController.js)
import {Blog} from '../../models/Blog.js';
import asyncHandler from '../../middleware/async.js';


// Create new blog post
export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, image, tags, status } = req.body;
  
  const blog = await Blog.create({
    title,
    content,
    author: req.user._id, // Assuming user ID from auth middleware
    image,
    tags,
    status,
    readTime: estimateReadTime(content)
  });

  res.status(201).json({
    success: true,
    data: blog
  });
});


// Get all blogs (with pagination and filtering)
export const getAllBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, tag } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (tag) query.tags = tag;

  const blogs = await Blog
    .find(query)
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Blog.countDocuments(query);


  res.json({
    success: true,
    data: blogs,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Get single blog by slug
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog
    .findOne({ slug: req.params.slug })
    .populate('author', 'name email');
  
  if (!blog) {
    throw createError(404, 'Blog not found');
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.json({
    success: true,
    data: blog
  });
});


// Get blogs by tag
export const getBlogsByTag = asyncHandler(async (req, res) => {
  const blogs = await Blog
    .find({ tags: req.params.tag })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: blogs
  });
});

// Update blog
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw createError(404, 'Blog not found');
  }

  // Check if user is authorized
  if (blog.author.toString() !== req.user._id.toString()) {
    throw createError(403, 'Not authorized to update this blog');
  }

 const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedBlog
  });
});


// Delete blog
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw createError(404, 'Blog not found');
  }

  // Check if user is authorized
  if (blog.author.toString() !== req.user._id.toString()) {
    throw createError(403, 'Not authorized to delete this blog');
  }

  await blog.remove();

  res.json({
    success: true,
    message: 'Blog deleted successfully'
  });
});

// Helper function to estimate read time
const estimateReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};