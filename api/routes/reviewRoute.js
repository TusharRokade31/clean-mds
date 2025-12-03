// routes/reviewRoutes.js
import express from 'express';
import {
  createReview,
  getPropertyReviews,
  getReview,
  updateReview,
  deleteReview,
  getMyReviews,
  markReviewHelpful,
  replyToReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/properties/:propertyId/reviews', getPropertyReviews);
router.get('/:reviewId', getReview);

// Protected routes (require authentication)
router.use(protect); // All routes below this require authentication

// User review routes
router.post('/properties/:propertyId/reviews', createReview);
router.get('/me/reviews', getMyReviews);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);
router.post('/:reviewId/helpful', markReviewHelpful);

// Property owner reply route
router.post('/:reviewId/reply', replyToReview);

export default router;