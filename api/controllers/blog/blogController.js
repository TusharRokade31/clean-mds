// Controller (controllers/blogController.js)
import {Blog} from '../../models/Blog.js';
import asyncHandler from '../../middleware/async.js';
import Category from '../../models/Category.js';
import ErrorResponse from '../../utils/errorResponse.js';
import logger from '../../utils/logger.js';


// Create new blog post
export const createBlog = asyncHandler(async (req, res) => {
  
  const { title, content, image, tags, categories, status } = req.body;

  const logDetails = {
  title: title || 'not provided',
  tags: tags || 'not provided',  
  categories: categories || 'not provided',
};
  

  logger.info(`Create blog request received, meta: ${JSON.stringify(logDetails)}`);

  // Validate category IDs and ensure not deleted
  const validCategories = await Category.find({ name: { $in: categories }, isDeleted: false });

  if (!validCategories.length) {
    logger.warn(`Invalid categories in blog creation, meta: ${JSON.stringify(logDetails)}`);
    throw ErrorResponse(400, 'Invalid category');
  }

  const blog = await Blog.create({
    title,
    content,
    author: req.user._id,
    image,
    tags,
    category: validCategories[0].id,
    status,
    slug: title,
    readTime: estimateReadTime(content),
  });

  logger.info(`Blog Created Successfullt, id:${blog._id}, meta: ${JSON.stringify(logDetails)}`);

  res.status(201).json({
    success: true,
    data: blog,
  });
});


// Get all blogs (with pagination and filtering)
export const getAllPublicBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, tag, category } = req.query;
  
  const query = {status: 'published', isDeleted: false};
  if (tag) query.tags = tag;
  if (category) query.category = category;

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
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get all blogs (with pagination and filtering)
export const getAllBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, tag, category, isDeleted } = req.query;
  const { role } = req.user;

  if(role !== 'admin'){
      throw new ErrorResponse('Not Authorize User to use this', 403);
  }
  
  const query = {};
  
  if (status) query.status = status;
  if (tag) query.tags = tag;
  if (category) query.tags = category;
  query.isDeleted = isDeleted ? true : false;


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
      totalPages: Math.ceil(total / limit),
    },
  });
});

// Get single blog by slug
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog
    .findOne({ slug: req.params.slug })
    .populate('author', 'name email');
  
  if (!blog) {
    throw new ErrorResponse('Blog not found', 404);
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.json({
    success: true,
    data: blog,
  });
});



// Update blog
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new ErrorResponse('Blog not found', 404);
  }

  // Check if user is authorized
  if (req.user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to update this blog', 403);
  }

 const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: Date.now() },
    { new: true, runValidators: true },
  );

  res.json({
    success: true,
    data: updatedBlog,
  });
});




// Delete blog
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new ErrorResponse('Blog not found', 404);
  }

  // Check if user is authorized
  if (blog.author.toString() !== req.user._id.toString()) {
    throw new ErrorResponse('Not authorized to delete this blog', 403);
  }
 
  blog.isDeleted = true;

  await blog.save();

  res.json({
    success: true,
    message: 'Blog deleted successfully',
  });
});

// Helper function to estimate read time
const estimateReadTime = (content) => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};