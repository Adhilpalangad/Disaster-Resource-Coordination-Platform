import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { User } from '../features/auth/user.model.js';
import type { IUser } from '../features/auth/user.model.js';

// Extend Express Request object
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      supabaseId?: string;
    }
  }
}

// Initialize Supabase client for token verification (Node v22+ has native WebSocket)
let supabase: ReturnType<typeof createClient> | null = null;

const getSupabaseClient = () => {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables are missing');
    }
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabase;
};

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No authorization header provided' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ success: false, message: 'No authorization token provided' });
    return;
  }

  try {
    // Verify the token by calling Supabase's auth.getUser()
    // This is the most secure way for ES256 tokens and checks if the user is not banned/deleted.
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !data.user) {
      console.error('Supabase token verification error:', error?.message);
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    req.supabaseId = data.user.id;

    const user = await User.findOne({ supabaseId: data.user.id });
    if (user) {
      req.user = user;
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
