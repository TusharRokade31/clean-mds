// Current routes from your propertyRoutes.js
import express from 'express';
import { 
  deleteProperty, 
  finalizeProperty, 
  getAllProperties, 
  getProperty, 
  initializeProperty, 
  reviewProperty, 
  updatePropertyStep1, 
  updatePropertyStep2, 
  updatePropertyStep3, 
  updatePropertyStep4, 
  updatePropertyStep5, 
  updatePropertyStep6, 
  updatePropertyStep7, 
  updatePropertyStep8, 
  updatePropertyStep9,
  // New routes I suggested
  getPropertiesByState,
  getPropertiesByCity,
  searchProperties,
  getFeaturedProperties,
  getStateWisePropertyStats,
  checkPropertyAvailability,
  getDraftProperties
} from '../controllers/propertyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Initialize a new property
router.post('/', protect, initializeProperty);

// Get all properties
router.get('/', protect, getAllProperties);

//Get Draft properties
router.get('/draft', protect, getDraftProperties); // Protect route so only authenticated users can access


// Get single property
router.get('/:id', protect, getProperty);

// Update property by steps
router.put('/:id/step1', protect, updatePropertyStep1);
router.put('/:id/step2', protect, updatePropertyStep2);
router.put('/:id/step3', protect, updatePropertyStep3);
router.put('/:id/step4', protect, updatePropertyStep4);
router.put('/:id/step5', protect, updatePropertyStep5);
router.put('/:id/step6', protect, updatePropertyStep6);

// For step 7 - handle file uploads
router.put(
  '/:id/step7', 
  protect, 
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'additional', maxCount: 10 }
  ]),
  updatePropertyStep7
);

router.put('/:id/step8', protect, updatePropertyStep8);
router.put('/:id/step9', protect, updatePropertyStep9);
router.put('/:id/finalize', protect, finalizeProperty);

// Admin routes
router.put('/:id/review', protect, reviewProperty);

// Delete property
router.delete('/:id', protect, deleteProperty);

// NEW ROUTES for state-wise and other features (add these)

// Get properties by state - public route
router.get('/state/:state', getPropertiesByState);

// Get properties by city - public route
router.get('/city/:city', getPropertiesByCity);

// Search properties with filters - public route
router.get('/search', searchProperties);

// Get featured properties - public route
router.get('/featured', getFeaturedProperties);

// Get state-wise property statistics - public route
router.get('/stats/states', getStateWisePropertyStats);

// Check property availability for specific dates - public route
router.get('/:id/availability', checkPropertyAvailability);

export default router;