// stateRoutes.js
import express from 'express';
import { 
  getAllstays, 
  getStay, 
  createStay, 
  updateStay, 
  deleteStay,
  getStayProperties,
  
} from '../controllers/stayController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();



// Stay routes
router.get('/', getAllstays);
router.get('/:id', getStay);
router.get('/:id/properties', getStayProperties);

// Admin routes - protected
router.use(protect);
router.use(authorize('admin'));

// Admin state management
router.post('/', upload.single('image'), createStay);
router.put('/:id', upload.single('image'), updateStay);
router.delete('/:id', deleteStay);


export default router;