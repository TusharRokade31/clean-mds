// stateRoutes.js
import express from 'express';
import { 
  getAllStates, 
  getState, 
  createState, 
  updateState, 
  deleteState,
  getStateProperties,
  getAllCities,
  getCity,
  createCity,
  updateCity,
  deleteCity,
  getCityProperties,
} from '../controllers/stateController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/s3UploadMiddleware.js';

const router = express.Router();

// City routes
router.get('/cities', getAllCities);
router.get('/cities/:id', getCity);
router.get('/cities/:id/properties', getCityProperties);

// State routes
router.get('/', getAllStates);
router.get('/:id', getState);
router.get('/:id/properties', getStateProperties);

// Admin routes - protected
router.use(protect);
router.use(authorize('admin'));

// Admin state management
router.post('/', upload.single('image'), createState);
router.put('/:id', upload.single('image'), updateState);
router.delete('/:id', deleteState);

// Admin city management
router.post('/cities', upload.single('image'), createCity);
router.put('/cities/:id', upload.single('image'), updateCity);
router.delete('/cities/:id', deleteCity);

export default router;