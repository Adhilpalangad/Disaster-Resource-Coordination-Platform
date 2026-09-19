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

    // SECURITY TODO: this endpoint is public and does not restrict `role` to an
    // allow-list — the client UI (Register.tsx) hides "admin" as an option, but
    // nothing server-side stops a direct POST with role: "admin" from succeeding,
    // since the Mongoose schema enum also permits "admin". There is currently no
    // other in-app path to create/promote an admin account. Fix: restrict `role`
    // here to ["citizen", "ngo", "volunteer"], and provision admin accounts only
    // through a trusted/internal path (e.g. a separate authenticated admin-only
    // endpoint or direct DB provisioning).

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

    // findOneAndUpdate+upsert is atomic at the database level — unlike a separate
    // findOne() then create()/save(), it can't race with a concurrent sync call for
    // the same supabaseId (e.g. the client firing /auth/sync from two places at once
    // right after login) and throw a duplicate-key error on the unique index.
    const user = await User.findOneAndUpdate(
      { supabaseId },
      { supabaseId, name, email, role, phone, organizationName, district, profession },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: String(error) });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { name, phone, organizationName, district, profession } = req.body;

    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Name is required' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name:             name.trim(),
        phone:            phone?.trim()            || undefined,
        organizationName: organizationName?.trim() || undefined,
        district:         district?.trim()         || undefined,
        profession:       profession?.trim()        || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const doc = user.toJSON ? user.toJSON() : user;
    const id  = (user._id as { toString(): string }).toString();

    res.json({ success: true, message: 'Profile updated', data: { ...doc, id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Update failed', error: String(error) });
  }
};

// GET /api/auth/volunteers?district=Kottayam — volunteers in a given district
export const getVolunteers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { district } = req.query;
    const filter: Record<string, unknown> = { role: "volunteer" };
    if (district) filter.district = district;

    const volunteers = await User.find(filter)
      .select("_id name email phone district profession")
      .sort({ name: 1 })
      .lean();

    // Expose _id as id for client consistency
    const data = volunteers.map(v => ({
      ...v,
      id: (v._id as { toString(): string }).toString(),
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch volunteers", error: String(error) });
  }
};

// ── Predefined admin credentials ──────────────────────────────────────────────
// These are fixed demo credentials. Override via env vars for production.
export const ADMIN_EMAIL    = process.env.ADMIN_SEED_EMAIL    ?? "admin@kdrp.in";
export const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? "Admin@2024";
const ADMIN_NAME            = "Platform Admin";

/** POST /api/auth/seed-admin (public)
 *  Creates the predefined admin account if it doesn't already exist.
 *  Safe to call multiple times — fully idempotent. */
export const seedAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Already in MongoDB? Nothing to do.
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      res.json({ success: true, message: "Admin account already exists", email: ADMIN_EMAIL });
      return;
    }

    const adminClient = getAdminClient();
    let supabaseId: string;

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email:         ADMIN_EMAIL,
      password:      ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME, role: "admin" },
    });

    if (authError) {
      if (
        authError.message.toLowerCase().includes("already been registered") ||
        (authError as { status?: number }).status === 422
      ) {
        // Exists in Supabase but not MongoDB — locate and sync
        const { data: listData } = await adminClient.auth.admin.listUsers();
        const sbUser = (listData?.users ?? []).find(
          (u: { email?: string; id: string }) => u.email === ADMIN_EMAIL
        );
        if (!sbUser) {
          res.status(400).json({ success: false, message: "Could not locate admin in Supabase." });
          return;
        }
        supabaseId = sbUser.id;
      } else {
        res.status(400).json({ success: false, message: authError.message });
        return;
      }
    } else {
      supabaseId = authData.user.id;
    }

    // Upsert MongoDB record
    await User.findOneAndUpdate(
      { supabaseId },
      { supabaseId, name: ADMIN_NAME, email: ADMIN_EMAIL, role: "admin" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, message: "Admin account created", email: ADMIN_EMAIL });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      res.status(500).json({ success: false, message: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set." });
    } else {
      res.status(500).json({ success: false, message: "Seed failed", error: msg });
    }
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

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role } = req.query;
    const query: Record<string, unknown> = {};

    if (role && typeof role === 'string' && role !== 'all') {
      query.role = role.trim();
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { district: regex },
        { profession: regex },
        { organizationName: regex },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users, count: users.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: String(error) });
  }
};

export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, phone, district, profession, organizationName } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(role && { role }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(district !== undefined && { district: district.trim() }),
        ...(profession !== undefined && { profession: profession.trim() }),
        ...(organizationName !== undefined && { organizationName: organizationName.trim() }),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: String(error) });
  }
};

