import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { User } from './user.model.js';

let adminClientInstance: any = null;

// Admin client for user creation (bypasses email confirmation).
// Node.js v22+ has native WebSocket, so no 'ws' package needed.
const getAdminClient = () => {
  if (adminClientInstance) return adminClientInstance;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  adminClientInstance = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClientInstance;
};

// POST /api/auth/register — creates user via admin API (auto email confirm)
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, organizationName, district, profession } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'name, email, password, and role are required' });
      return;
    }

    console.log(`[${new Date().toISOString()}] Starting registration for ${email}`);
    const adminClient = getAdminClient();

    console.log(`[${new Date().toISOString()}] Calling Supabase admin.createUser`);
    // Create user in Supabase with email_confirm: true (auto-confirmed, no email required)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, phone, organizationName, district, profession },
    });
    console.log(`[${new Date().toISOString()}] Supabase admin.createUser returned`);

    if (authError) {
      // Handle duplicate email gracefully
      if (authError.message.toLowerCase().includes('already been registered') || authError.status === 422) {
        res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
      } else {
        res.status(400).json({ success: false, message: authError.message });
      }
      return;
    }

    const supabaseId = authData.user.id;

    console.log(`[${new Date().toISOString()}] Starting MongoDB upsert for ${supabaseId}`);
    // Upsert into MongoDB
    let user = await User.findOne({ supabaseId });
    if (user) {
      user.name = name; user.email = email; user.role = role;
      user.phone = phone; user.organizationName = organizationName;
      user.district = district; user.profession = profession;
      await user.save();
    } else {
      user = await User.create({ supabaseId, name, email, role, phone, organizationName, district, profession });
    }
    console.log(`[${new Date().toISOString()}] MongoDB upsert finished`);

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      res.status(500).json({ success: false, message: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set in the server .env file.' });
    } else {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Internal server error', error: msg });
    }
  }
};

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseId = req.supabaseId;
    if (!supabaseId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, email, role, phone, organizationName, district, profession } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({ success: false, message: 'Name, email, and role are required' });
      return;
    }

    let user = await User.findOne({ supabaseId });

    if (user) {
      // Update existing user
      user.name = name;
      user.email = email;
      user.role = role;
      user.phone = phone;
      user.organizationName = organizationName;
      user.district = district;
      user.profession = profession;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        supabaseId,
        name,
        email,
        role,
        phone,
        organizationName,
        district,
        profession,
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: String(error) });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User profile not found in database' });
      return;
    }
    // Explicitly include id = _id.toString() so clients can always rely on user.id
    const doc = req.user.toJSON ? req.user.toJSON() : req.user;
    const id  = (req.user._id as { toString(): string }).toString();
    res.status(200).json({ success: true, data: { ...doc, id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: String(error) });
  }
};
