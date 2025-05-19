import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and only for admins
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;