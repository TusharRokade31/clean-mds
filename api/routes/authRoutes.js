import express from 'express';
import { body } from 'express-validator';
import { signup, login, getMe, createAdmin, logout } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';
import { googleLogin } from '../controllers/googleAuthController.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  validate,
  signup,
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  validate,
  login,
);

router.post('/google', googleLogin);


router.post('/logout', protect, logout);



router.post(
  '/create-admin',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  validate,
  createAdmin,
);




router.get('/me', protect, getMe);

export default router;