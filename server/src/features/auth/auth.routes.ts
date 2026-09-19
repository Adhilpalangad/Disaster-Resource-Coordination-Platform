import { Router } from 'express';
import {
  registerUser, syncUser, getMe, updateProfile, getVolunteers, seedAdmin, getUsers, updateUserById,
} from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.post('/register',   authLimiter, registerUser);  // creates user via admin API (auto email confirm)
router.post('/seed-admin', seedAdmin);                   // idempotent — creates predefined admin account

// Protected routes
router.post('/sync',      requireAuth, syncUser);         // sync metadata
router.get('/me',         requireAuth, getMe);            // get current user
router.put('/profile',    requireAuth, updateProfile);    // update profile
router.get('/volunteers', requireAuth, getVolunteers);    // list volunteers (e.g. NGO assign-volunteer picker)
router.get('/users',      requireAuth, getUsers);         // list all users (admin)
router.put('/users/:id',  requireAuth, updateUserById);   // update user details/role (admin)

export default router;

