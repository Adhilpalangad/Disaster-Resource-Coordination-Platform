import type { Request, Response } from "express";
import { NGOProfile } from "./ngo.model.js";

// ── GET /api/ngos — all profiles (admin) ─────────────────────────────────────
export const getAllNGOs = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query["isActive"] !== undefined) {
      filter.isActive = req.query["isActive"] === "true";
    }
    const ngos = await NGOProfile.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: ngos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch NGOs", error: String(error) });
  }
};

// ── GET /api/ngos/profile/:userId — NGO user's own profile ───────────────────
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.params["userId"] ?? "");
    const ngo = await NGOProfile.findOne({ userId });
    if (!ngo) {
      res.status(404).json({ success: false, message: "No NGO profile found for this user account. Contact your administrator." });
      return;
    }
    res.json({ success: true, data: ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch NGO profile", error: String(error) });
  }
};

// ── GET /api/ngos/:id — get by MongoDB _id ───────────────────────────────────
export const getNGOById = async (req: Request, res: Response): Promise<void> => {
  try {
    const ngo = await NGOProfile.findById(String(req.params["id"] ?? ""));
    if (!ngo) {
      res.status(404).json({ success: false, message: "NGO not found" });
      return;
    }
    res.json({ success: true, data: ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch NGO", error: String(error) });
  }
};

// ── POST /api/ngos — create (admin) ──────────────────────────────────────────
export const createNGO = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId, orgName, email, phone,
      serviceAreas,
      resourceCapacity, acceptanceTimeoutMinutes,
    } = req.body as {
      userId: string; orgName: string; email: string; phone?: string;
      serviceAreas?: { districtIds?: string[]; talukIds?: string[]; localBodyIds?: string[] };
      resourceCapacity?: number; acceptanceTimeoutMinutes?: number;
    };

    if (!userId || !orgName || !email) {
      res.status(400).json({ success: false, message: "userId, orgName, and email are required" });
      return;
    }

    const existing = await NGOProfile.findOne({ userId });
    if (existing) {
      res.status(409).json({ success: false, message: "An NGO profile already exists for this user" });
      return;
    }

    const ngo = await NGOProfile.create({
      userId,
      orgName,
      email,
      ...(phone && { phone }),
      isActive: true,
      serviceAreas: {
        districtIds:  serviceAreas?.districtIds  ?? [],
        talukIds:     serviceAreas?.talukIds     ?? [],
        localBodyIds: serviceAreas?.localBodyIds ?? [],
      },
      resourceCapacity:         resourceCapacity         ?? 50,
      currentWorkload:          0,
      acceptanceTimeoutMinutes: acceptanceTimeoutMinutes ?? 30,
    });

    res.status(201).json({ success: true, message: "NGO registered successfully", data: ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create NGO", error: String(error) });
  }
};

// ── PUT /api/ngos/:id — update profile ───────────────────────────────────────
export const updateNGO = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      orgName, email, phone,
      serviceAreas,
      resourceCapacity, acceptanceTimeoutMinutes,
    } = req.body as {
      orgName?: string; email?: string; phone?: string;
      serviceAreas?: { districtIds?: string[]; talukIds?: string[]; localBodyIds?: string[] };
      resourceCapacity?: number; acceptanceTimeoutMinutes?: number;
    };

    const patch: Record<string, unknown> = {};
    if (orgName)                        patch.orgName                = orgName;
    if (email)                          patch.email                  = email;
    if (phone !== undefined)            patch.phone                  = phone;
    if (serviceAreas)                   patch.serviceAreas           = serviceAreas;
    if (resourceCapacity !== undefined) patch.resourceCapacity       = resourceCapacity;
    if (acceptanceTimeoutMinutes !== undefined) patch.acceptanceTimeoutMinutes = acceptanceTimeoutMinutes;

    const updated = await NGOProfile.findByIdAndUpdate(
      String(req.params["id"] ?? ""),
      patch,
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ success: false, message: "NGO not found" });
      return;
    }
    res.json({ success: true, message: "NGO updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update NGO", error: String(error) });
  }
};

// ── POST /api/ngos/:id/toggle — activate / deactivate ────────────────────────
export const toggleActive = async (req: Request, res: Response): Promise<void> => {
  try {
    const ngo = await NGOProfile.findById(String(req.params["id"] ?? ""));
    if (!ngo) {
      res.status(404).json({ success: false, message: "NGO not found" });
      return;
    }
    ngo.isActive = !ngo.isActive;
    await ngo.save();
    res.json({ success: true, message: `NGO ${ngo.isActive ? "activated" : "deactivated"}`, data: ngo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle NGO status", error: String(error) });
  }
};
