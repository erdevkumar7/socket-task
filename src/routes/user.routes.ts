import { Router } from 'express';
import { getUserProfile } from '../controllers/user.controller';
import authMiddleware from '../middleware/auth';

const router = Router();

// Fetch user profile route
router.get('/users/profile', authMiddleware, getUserProfile);

export default router;

