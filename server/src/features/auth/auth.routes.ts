import { Router } from 'express';
import { registerUser, syncUser, getMe, updateProfile, getVolunteers, seedAdmin } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.post('/register',   registerUser);   // create user via admin API (auto email confirm)
router.post('/seed-admin', seedAdmin);      // idempotent — creates predefined admin account

// Protected routes
router.post('/sync',     requireAuth, syncUser);
router.get('/me',        requireAuth, getMe);
router.put('/profile',   requireAuth, updateProfile);
router.get('/volunteers', requireAuth, getVolunteers);
// Routes
router.post('/register', authLimiter, registerUser);              // public — creates user via admin API (auto email confirm)
router.post('/sync', requireAuth, syncUser);         // protected — sync metadata
router.get('/me', requireAuth, getMe);               // protected — get current user
router.put('/profile', requireAuth, updateProfile);  // protected — update profile

export default router;
