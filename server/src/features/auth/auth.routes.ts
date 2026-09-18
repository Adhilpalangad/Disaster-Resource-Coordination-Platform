import { Router } from 'express';
import { registerUser, syncUser, getMe, updateProfile, getUsers, updateUserById } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

// Routes
router.post('/register', registerUser);              // public — creates user via admin API (auto email confirm)
router.post('/sync', requireAuth, syncUser);         // protected — sync metadata
router.get('/me', requireAuth, getMe);               // protected — get current user
router.put('/profile', requireAuth, updateProfile);  // protected — update profile
router.get('/users', requireAuth, getUsers);         // protected — list all users
router.put('/users/:id', requireAuth, updateUserById);// protected — update user details/role

export default router;

