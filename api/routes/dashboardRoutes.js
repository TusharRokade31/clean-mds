// routes/dashboard.js (or add to your existing routes)
import express from 'express';
import { dashboardController } from '../controllers/stats/dashboardController.js';


const router = express.Router();

// Dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);
router.get('/recent-bookings', dashboardController.getRecentBookings);
router.get('/monthly-revenue', dashboardController.getMonthlyRevenue);

export default router;