// bookingRoutes.js
import express from 'express';
import { bookingController } from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';


const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Booking CRUD operations
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/stats', bookingController.getBookingStats);
router.get('/:id', bookingController.getBookingById);
router.put('/:id', bookingController.updateBooking);

// Payment operations
router.post('/:id/payment', bookingController.updatePayment);

// Booking status operations
router.post('/:id/checkin', bookingController.checkIn);
router.post('/:id/update-status', bookingController.updateStatus);
router.post('/:id/checkout', bookingController.checkOut);
router.post('/:id/cancel', bookingController.cancelBooking);

export default router;