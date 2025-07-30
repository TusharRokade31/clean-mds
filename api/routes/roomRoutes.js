// routes/roomRoutes.js
import express from 'express';
import { body, param, query } from 'express-validator';
import { roomController } from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validatePropertyId = [
  param('propertyId').isMongoId().withMessage('Invalid property ID'),
];

const validateRoomId = [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
];

const validateRoomStatus = [
  body('status')
    .isIn(['available', 'booked', 'maintenance'])
    .withMessage('Status must be available, booked, or maintenance'),
];

const validateDateRange = [
  query('startDate').isISO8601().withMessage('Invalid start date format'),
  query('endDate').isISO8601().withMessage('Invalid end date format'),
];

// Routes
router.get(
  '/properties/:propertyId/rooms',
  protect,
  validatePropertyId,
  roomController.getAllRooms,
);

router.get(
  '/rooms/:roomId',
  protect,
  validateRoomId,
  roomController.getRoomById,
);

router.put(
  '/rooms/:roomId/status',
  protect,
  validateRoomId,
  validateRoomStatus,
  roomController.updateRoomStatus,
);

router.get(
  '/rooms/:roomId/availability',
  protect,
  validateRoomId,
  validateDateRange,
  roomController.getRoomAvailability,
);

export default router;