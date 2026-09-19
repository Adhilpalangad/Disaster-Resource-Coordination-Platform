import type { Request, Response, NextFunction } from "express";
import { NGOProfile } from "./ngo.model.js";
import { AppError } from "../../utils/AppError.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";
import { buildSearchFilter } from "../../utils/search.js";
import type { CreateNGOInput, UpdateNGOInput } from "./ngo.validation.js";

const SEARCH_FIELDS = ["orgName", "email", "phone"];

// ── GET /api/ngos — all profiles (admin). Supports ?isActive=, ?search=,
//    ?page=, ?limit=, ?skip= (all optional, backward-compatible). ─────────────
export const getAllNGOs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.query["isActive"] !== undefined) {
      filter["isActive"] = req.query["isActive"] === "true";
    }
    Object.assign(filter, buildSearchFilter(req.query["search"], SEARCH_FIELDS));

    const pagination = getPagination(req.query);

    if (!pagination.applied) {
      const ngos = await NGOProfile.find(filter).sort({ createdAt: -1 });
      res.json({ success: true, data: ngos, ...buildPaginationMeta(ngos.length, pagination) });
      return;
    }

    const [ngos, total] = await Promise.all([
      NGOProfile.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      NGOProfile.countDocuments(filter),
    ]);
    res.json({ success: true, data: ngos, ...buildPaginationMeta(total, pagination) });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/ngos/profile/:userId — NGO user's own profile ───────────────────
export const getMyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = String(req.params["userId"] ?? "");
    const ngo = await NGOProfile.findOne({ userId });
    if (!ngo) {
      throw AppError.notFound("No NGO profile found for this user account. Contact your administrator.");
    }
    res.json({ success: true, data: ngo });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/ngos/:id — get by MongoDB _id ───────────────────────────────────
export const getNGOById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ngo = await NGOProfile.findById(String(req.params["id"] ?? ""));
    if (!ngo) throw AppError.notFound("NGO not found");
    res.json({ success: true, data: ngo });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/ngos — create (admin) ──────────────────────────────────────────
export const createNGO = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(createNGOSchema) in ngo.routes.ts
    const {
      userId, orgName, email, phone,
      serviceAreas,
      resourceCapacity, acceptanceTimeoutMinutes,
    } = req.body as CreateNGOInput;

    const existing = await NGOProfile.findOne({ userId });
    if (existing) {
      throw AppError.conflict("An NGO profile already exists for this user");
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
    next(error);
  }
};

// ── PUT /api/ngos/:id — update profile ───────────────────────────────────────
export const updateNGO = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(updateNGOSchema) in ngo.routes.ts
    const {
      orgName, email, phone,
      serviceAreas,
      resourceCapacity, acceptanceTimeoutMinutes,
    } = req.body as UpdateNGOInput;

    const patch: Record<string, unknown> = {};
    if (orgName)                        patch["orgName"]                = orgName;
    if (email)                          patch["email"]                  = email;
    if (phone !== undefined)            patch["phone"]                  = phone;
    if (serviceAreas)                   patch["serviceAreas"]           = serviceAreas;
    if (resourceCapacity !== undefined) patch["resourceCapacity"]       = resourceCapacity;
    if (acceptanceTimeoutMinutes !== undefined) patch["acceptanceTimeoutMinutes"] = acceptanceTimeoutMinutes;

    const updated = await NGOProfile.findByIdAndUpdate(
      String(req.params["id"] ?? ""),
      patch,
      { new: true }
    );

    if (!updated) throw AppError.notFound("NGO not found");
    res.json({ success: true, message: "NGO updated", data: updated });
  } catch (error) {
    next(error);
  }
};

// ── POST /api/ngos/:id/toggle — activate / deactivate ────────────────────────
export const toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ngo = await NGOProfile.findById(String(req.params["id"] ?? ""));
    if (!ngo) throw AppError.notFound("NGO not found");
    ngo.isActive = !ngo.isActive;
    await ngo.save();
    res.json({ success: true, message: `NGO ${ngo.isActive ? "activated" : "deactivated"}`, data: ngo });
  } catch (error) {
    next(error);
  }
};
