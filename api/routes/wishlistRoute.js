// routes/wishlistRoutes.js
import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlist,
  clearWishlist,
  getWishlistCount,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// Wishlist routes
router.get('/', getWishlist);
router.get('/count', getWishlistCount);
router.get('/check/:propertyId', checkWishlist);
router.post('/:propertyId', addToWishlist);
router.post('/:propertyId/toggle', toggleWishlist);
router.delete('/:propertyId', removeFromWishlist);
router.delete('/', clearWishlist);

export default router;