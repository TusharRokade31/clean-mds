import express from 'express';
import { body } from 'express-validator';
import { 
  getMe, 
  updateProfile, 
  uploadProfilePhoto, 
  deleteProfilePhoto 
} from '../controllers/userController.js';
import { validate } from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();

router.use(protect);

router.get('/me', getMe);

router.put('/update-profile', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please include a valid email'),
], validate, updateProfile);

// Profile photo routes
router.post('/upload-profile-photo', upload.single('profilePhoto'), uploadProfilePhoto);
router.delete('/delete-profile-photo', deleteProfilePhoto);

export default router;