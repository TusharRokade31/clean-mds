// Current routes from your propertyRoutes.js
import express from 'express';
import { 
  deleteProperty, 
  // finalizeProperty, 
  getAllProperties, 
  getProperty, 
  initializeProperty, 
  reviewProperty, 
  saveBasicInfo,
  saveLocation,
  saveAmenities,
  addRoom,
  updateRoom,
  deleteRoom,
  completePropertyListing,

  // New routes I suggested
  getPropertiesByState,
  getPropertiesByCity,
  searchProperties,
  getFeaturedProperties,
  getStateWisePropertyStats,
  checkPropertyAvailability,
  getDraftProperties,
  uploadPropertyMedia,
  updateMediaItem,
  deleteMediaItem,
  getMediaByTags,
  completeMediaStep,
  uploadRoomMedia,
  updateRoomMediaItem,
  getRoomMedia,
  deleteRoomMediaItem
} from '../controllers/propertyController.js';


import {
  getPrivacyPolicy,
  createOrUpdatePrivacyPolicy,
  updatePrivacyPolicySection,
  getPrivacyPolicyHistory,
  deletePrivacyPolicy,
  getPrivacyPolicyTemplate,
  addCustomPolicy,
  updateCustomPolicy,
  deleteCustomPolicy
} from '../controllers/privacyPolicyController.js';


import { 
  getFinanceLegal,
  updateFinanceDetails,
  updateLegalDetails,
  uploadRegistrationDocument,
  deleteFinanceLegal
} from '../controllers/financeLegalController.js';


import { protect } from '../middleware/authMiddleware.js';
import { check } from 'express-validator' ;
import { upload, uploadMedia } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Initialize a new property
router.post('/', protect, initializeProperty);

router.put(
  '/:propertyId/basic-info',
  protect,
  [
    check('propertyType', 'Property type is required').not().isEmpty(),
    check('placeName', 'Place name is required').not().isEmpty(),
    check('placeRating', 'Place rating is required').not().isEmpty(),
    check('propertyBuilt', 'Property built year is required').not().isEmpty(),
    check('bookingSince', 'Booking since date is required').not().isEmpty(),
    check('rentalForm', 'Rental form is required').not().isEmpty()
  ],
  saveBasicInfo
);

// Step 2: Save Location
router.put(
  '/:propertyId/location',
  protect,
  [
    check('country', 'Country is required').not().isEmpty(),
    check('street', 'Street address is required').not().isEmpty(),
    check('city', 'City is required').not().isEmpty(),
    check('state', 'State is required').not().isEmpty(),
    check('postalCode', 'Postal code is required').not().isEmpty()
  ],
  saveLocation
);

// Step 3: Save Amenities
router.put(
  '/:propertyId/amenities',
  protect,
  saveAmenities
);

// Step 4: Room Management
router.post(
  '/:propertyId/rooms',
  protect,
  [
    check('roomName', 'Room name is required').not().isEmpty(),
    check('roomSize', 'Room size is required').isNumeric(),
    check('sizeUnit', 'Size unit is required').not().isEmpty()
  ],
  addRoom
);

router.put(
  '/:propertyId/rooms/:roomId',
  protect,
  updateRoom
);

router.delete(
  '/:propertyId/rooms/:roomId',
  protect,
  deleteRoom
);

router.post('/:propertyId/rooms/:roomId/media', protect, upload.array('media', 20), uploadRoomMedia);
router.put('/:propertyId/rooms/:roomId/media/:mediaId', protect, updateRoomMediaItem);
router.delete('/:propertyId/rooms/:roomId/media/:mediaId', protect, deleteRoomMediaItem);
router.get('/:propertyId/rooms/:roomId/media', getRoomMedia);


// Complete media step
router.put(
  '/:propertyId/media/complete',  // This must come FIRST
  protect,
  completeMediaStep
);


router.post(
  '/:propertyId/media/upload',
  protect,
  uploadMedia.array('media', 20), // Allow up to 20 files
  uploadPropertyMedia
);

// Update media item (tags, cover status, display order)
router.put(
  '/:propertyId/media/:mediaId',  // This must come SECOND
  protect,
  updateMediaItem
);

// Delete media item
router.delete(
  '/:propertyId/media/:mediaId',
  protect,
  deleteMediaItem
);

// Get media by tags
router.get(
  '/:propertyId/media',
  getMediaByTags
);



// Complete Property Listing
router.put(
  '/:propertyId/complete',
  protect,
  completePropertyListing
);


// Get all properties
router.get('/', protect, getAllProperties);

//Get Draft properties
router.get('/draft', protect, getDraftProperties); // Protect route so only authenticated users can access


// Get single property
router.get('/:id', protect, getProperty);

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



router.post('/:propertyId/custom-policies', addCustomPolicy);
router.put('/:propertyId/custom-policies/:policyId', updateCustomPolicy);
router.delete('/:propertyId/custom-policies/:policyId', deleteCustomPolicy);

// Privacy Policy routes
router.get('/template/privacy-policy', getPrivacyPolicyTemplate);
router.get('/:propertyId/privacy-policy', getPrivacyPolicy);
router.post('/:propertyId/privacy-policy', createOrUpdatePrivacyPolicy);
router.put('/:propertyId/privacy-policy/section', updatePrivacyPolicySection);
router.get('/:propertyId/privacy-policy/history', getPrivacyPolicyHistory);
router.delete('/:propertyId/privacy-policy', deletePrivacyPolicy);



// Get or create finance legal data
router.get('/:propertyId/finance-legal', protect, getFinanceLegal);

// Update finance details
router.put('/:propertyId/finance', 
  protect,
  [
    check('bankDetails.accountNumber', 'Account number is required').optional().not().isEmpty(),
    check('bankDetails.ifscCode', 'Valid IFSC code is required').optional().matches(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    check('taxDetails.pan', 'Valid PAN is required').optional().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
  ],
  updateFinanceDetails
);

// Update legal details
router.put('/:propertyId/legal',
  protect,
  [
    check('ownershipDetails.ownershipType', 'Ownership type is required').optional().not().isEmpty(),
    check('ownershipDetails.propertyAddress', 'Property address is required').optional().not().isEmpty()
  ],
  updateLegalDetails
);

// Upload registration document
router.post('/:propertyId/legal/upload-document',
  protect,
  upload.single('registrationDocument'),
  uploadRegistrationDocument
);

// Delete finance legal data
router.delete('/:propertyId/finance-legal', protect, deleteFinanceLegal);
export default router;