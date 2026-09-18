import type { Request, Response, NextFunction } from "express";
import { Disaster } from "./disaster.model.js";
import { VolunteerDisasterResponse } from "./volunteer-response.model.js";
import { User } from "../auth/user.model.js";
import { notificationService } from "../notifications/notification.service.js";
import { AppError } from "../../utils/AppError.js";
import { getPagination, buildPaginationMeta } from "../../utils/pagination.js";
import { buildSearchFilter } from "../../utils/search.js";
import type { CreateDisasterInput, UpdateDisasterInput } from "./disaster.validation.js";

const SEARCH_FIELDS = ["title", "description", "type", "affectedDistrictNames"];

// ── Read ──────────────────────────────────────────────────────────────────────

/** GET /api/disasters — supports ?search=, ?page=, ?limit=, ?skip= (all optional,
 *  backward-compatible: with none supplied, behaves exactly as before). */
export const getAllDisasters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter = { ...buildSearchFilter(req.query["search"], SEARCH_FIELDS) };
    const pagination = getPagination(req.query);

    if (!pagination.applied) {
      const data = await Disaster.find(filter).sort({ startedAt: -1 });
      res.json({ success: true, data, ...buildPaginationMeta(data.length, pagination) });
      return;
    }

    const [data, total] = await Promise.all([
      Disaster.find(filter).sort({ startedAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      Disaster.countDocuments(filter),
    ]);
    res.json({ success: true, data, ...buildPaginationMeta(total, pagination) });
  } catch (err) {
    next(err);
  }
};

export const getActiveDisasters = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { status: { $in: ["active", "monitoring"] } };
    Object.assign(filter, buildSearchFilter(req.query["search"], SEARCH_FIELDS));
    const pagination = getPagination(req.query);

    if (!pagination.applied) {
      const data = await Disaster.find(filter).sort({ startedAt: -1 });
      res.json({ success: true, data, ...buildPaginationMeta(data.length, pagination) });
      return;
    }

    const [data, total] = await Promise.all([
      Disaster.find(filter).sort({ startedAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      Disaster.countDocuments(filter),
    ]);
    res.json({ success: true, data, ...buildPaginationMeta(total, pagination) });
  } catch (err) {
    next(err);
  }
};

export const getDisasterById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Disaster.findById(req.params["id"]);
    if (!doc) throw AppError.notFound("Disaster not found");
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// ── Create ────────────────────────────────────────────────────────────────────

export const createDisaster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(createDisasterSchema) in disaster.routes.ts
    const parsed = req.body as CreateDisasterInput;

    const doc = await Disaster.create({
      title:                  parsed.title,
      type:                   parsed.type,
      severity:                parsed.severity ?? "high",
      status:                  parsed.status   ?? "active",
      affectedDistrictIds:     parsed.affectedDistrictIds  ?? [],
      affectedDistrictNames:   parsed.affectedDistrictNames ?? [],
      startedAt:                parsed.startedAt ? new Date(parsed.startedAt) : new Date(),
      description:              parsed.description,
    });

    res.status(201).json({ success: true, data: doc });

    // ── Fire-and-forget: notify all volunteers in affected districts ──────────
    setImmediate(async () => {
      try {
        const names: string[] = parsed.affectedDistrictNames ?? [];
        if (names.length === 0) return;

        const volunteers = await User.find({ role: "volunteer", district: { $in: names } })
          .select("_id name email district")
          .lean();

        if (volunteers.length === 0) {
          console.log("[Disaster] No volunteers found in affected districts — skip notify");
          return;
        }

        await notificationService.sendMany(
          volunteers.map(v => ({
            userId:    (v._id as { toString(): string }).toString(),
            userEmail: v.email,
            title:     `🚨 Disaster Alert: ${doc.title}`,
            message:   `A ${doc.type} has been declared in ${names.join(", ")}. ` +
                       `Are you available to serve as a volunteer? ` +
                       `Please respond on your dashboard.`,
            type:      "warning" as const,
            category:  "system" as const,
            link:      "/volunteer/dashboard",
          }))
        );

        console.log(`[Disaster] Notified ${volunteers.length} volunteer(s) about "${doc.title}"`);
      } catch (err) {
        console.error("[Disaster] Volunteer notification failed:", err);
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateDisaster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // req.body was already validated/coerced by validateBody(updateDisasterSchema) in disaster.routes.ts
    const parsed = req.body as UpdateDisasterInput;

    const update: Record<string, unknown> = {};
    if (parsed.title !== undefined)                 update.title                  = parsed.title;
    if (parsed.type !== undefined)                  update.type                   = parsed.type;
    if (parsed.severity !== undefined)              update.severity               = parsed.severity;
    if (parsed.status !== undefined)                update.status                 = parsed.status;
    if (parsed.affectedDistrictIds !== undefined)   update.affectedDistrictIds    = parsed.affectedDistrictIds;
    if (parsed.affectedDistrictNames !== undefined) update.affectedDistrictNames  = parsed.affectedDistrictNames;
    if (parsed.startedAt !== undefined)             update.startedAt              = new Date(parsed.startedAt);
    if (parsed.description !== undefined)           update.description            = parsed.description;

    const doc = await Disaster.findByIdAndUpdate(req.params["id"], update, { new: true, runValidators: true });
    if (!doc) throw AppError.notFound("Disaster not found");
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteDisaster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doc = await Disaster.findByIdAndDelete(req.params["id"]);
    if (!doc) throw AppError.notFound("Disaster not found");
    res.json({ success: true, message: "Disaster deleted" });
  } catch (err) {
    next(err);
  }
};

// ── Volunteer Response ────────────────────────────────────────────────────────

/** POST /api/disasters/:id/volunteer-response
 *  Body: { status: "available" | "unavailable" }
 *  Volunteer records (or updates) their opt-in status for a disaster. */
export const respondToDisaster = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw AppError.unauthorized("Unauthorized");

    // req.body was already validated by validateBody(volunteerResponseSchema) in disaster.routes.ts
    const { status } = req.body as { status: "available" | "unavailable" };

    const disaster = await Disaster.findById(req.params["id"]);
    if (!disaster) throw AppError.notFound("Disaster not found");

    const volunteerId = (req.user._id as { toString(): string }).toString();

    const response = await VolunteerDisasterResponse.findOneAndUpdate(
      { disasterId: req.params["id"], volunteerId },
      {
        disasterId:     req.params["id"],
        volunteerId,
        volunteerName:  req.user.name,
        volunteerEmail: req.user.email,
        district:       req.user.district ?? "",
        status,
        respondedAt:    new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: response });
  } catch (err) {
    next(err);
  }
};

/** GET /api/disasters/:id/volunteer-responses
 *  Returns all volunteer opt-in responses for a given disaster. */
export const getVolunteerResponses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const responses = await VolunteerDisasterResponse.find({ disasterId: req.params["id"] })
      .sort({ respondedAt: -1 })
      .lean();
    res.json({ success: true, data: responses });
  } catch (err) {
    next(err);
  }
};

// ── Seed ──────────────────────────────────────────────────────────────────────

export const seedDisasters = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Disaster.countDocuments();
    if (existing > 0) {
      res.json({ success: true, message: `Seed skipped — ${existing} disaster(s) already exist` });
      return;
    }

    await Disaster.create([
      {
        title: "Wayanad Flood Relief Operation 2024",
        type: "flood",
        severity: "critical",
        status: "active",
        affectedDistrictIds: ["WYD"],
        affectedDistrictNames: ["Wayanad"],
        startedAt: new Date("2024-07-30"),
        description:
          "Severe flooding and landslides triggered by heavy monsoon rainfall. " +
          "Mananthavady, Vythiri, and Sulthan Bathery taluks severely affected. " +
          "Multiple villages isolated; road connectivity disrupted. " +
          "Immediate relief required for food, water, medical, and shelter needs.",
      },
      {
        title: "Kozhikode District Flood Alert",
        type: "flood",
        severity: "high",
        status: "monitoring",
        affectedDistrictIds: ["KZD"],
        affectedDistrictNames: ["Kozhikode"],
        startedAt: new Date("2024-08-01"),
        description:
          "IMD red alert issued for Kozhikode district. River levels rising. " +
          "Low-lying areas and coastal villages at risk of flooding.",
      },
    ]);

    res.status(201).json({ success: true, message: "Demo disaster data seeded successfully" });
  } catch (err) {
    next(err);
  }
};
