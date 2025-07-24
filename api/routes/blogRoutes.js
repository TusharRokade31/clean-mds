// bookingRoutes.js
import express from 'express';
import multer from 'multer';
import { createBlog, getAllBlogs, getBlogBySlug, getBlogsByTag, updateBlog, deleteBlog, getBlogsByCategory } from '../controllers/blog/blogController.js';
import {createCategory, getAllCategories, updateCategory, deleteCategory} from '../controllers/blog/categoryController.js'
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer();
// Public routes
router.get('/', getAllBlogs);
router.get('/slug/:slug', getBlogBySlug);
router.get('/tag/:tag', getBlogsByTag);
router.get('/category/:categorySlug', getBlogsByCategory);
router.get('/categories', getAllCategories);


// Protected routes (require authentication)
router.post('/', protect, upload.none(), createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/category', protect, createCategory);
router.put('/category/:id', protect, updateCategory);
router.delete('/category/:id', protect, deleteCategory);

export default router;