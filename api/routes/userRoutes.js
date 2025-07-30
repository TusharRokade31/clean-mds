import express from 'express';
import { body } from 'express-validator';
import { getMe, updateProfile } from '../controllers/userController.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/me', getMe);

router.put('/update-profile', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
], validate, updateProfile);

export default router;