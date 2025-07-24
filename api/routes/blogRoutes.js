// bookingRoutes.js
import express from 'express';
import { createBlog, getAllBlogs, getBlogBySlug, getBlogsByTag, updateBlog, deleteBlog } from '../controllers/blog/blogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/:slug', getBlogBySlug);
router.get('/tag/:tag', getBlogsByTag);


// Protected routes (require authentication)
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

export default router;