import { Router } from 'express';
import { registerUser, syncUser, getMe } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

// Routes
router.post('/register', registerUser);       // public — creates user via admin API (auto email confirm)
router.post('/sync', requireAuth, syncUser);  // protected — sync metadata
router.get('/me', requireAuth, getMe);        // protected — get current user

export default router;
