import { Router } from 'express';
import { registerUser, syncUser, getMe, updateProfile } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Routes
router.post('/register', authLimiter, registerUser);              // public — creates user via admin API (auto email confirm)
router.post('/sync', requireAuth, syncUser);         // protected — sync metadata
router.get('/me', requireAuth, getMe);               // protected — get current user
router.put('/profile', requireAuth, updateProfile);  // protected — update profile

export default router;
