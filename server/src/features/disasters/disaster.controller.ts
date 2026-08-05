import type { Request, Response } from "express";
import { Disaster } from "./disaster.model.js";
import type { IDisaster } from "./disaster.model.js";

// ── Read ──────────────────────────────────────────────────────────────────────

export const getAllDisasters = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Disaster.find().sort({ startedAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch disasters", error: String(err) });
  }
};

export const getActiveDisasters = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Disaster.find({ status: { $in: ["active", "monitoring"] } }).sort({ startedAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch disasters", error: String(err) });
  }
};

export const getDisasterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await Disaster.findById(req.params.id);
    if (!doc) { res.status(404).json({ success: false, message: "Disaster not found" }); return; }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch disaster", error: String(err) });
  }
};

// ── Create ────────────────────────────────────────────────────────────────────

export const createDisaster = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title, type, severity, status,
      affectedDistrictIds, affectedDistrictNames,
      startedAt, description,
    } = req.body as {
      title: string;
      type: IDisaster["type"];
      severity: IDisaster["severity"];
      status: IDisaster["status"];
      affectedDistrictIds: string[];
      affectedDistrictNames: string[];
      startedAt?: string;
      description: string;
    };

    if (!title?.trim() || !type || !description?.trim()) {
      res.status(400).json({ success: false, message: "title, type, and description are required" });
      return;
    }

    const doc = await Disaster.create({
      title:                title.trim(),
      type,
      severity:             severity ?? "high",
      status:               status   ?? "active",
      affectedDistrictIds:  affectedDistrictIds  ?? [],
      affectedDistrictNames: affectedDistrictNames ?? [],
      startedAt:            startedAt ? new Date(startedAt) : new Date(),
      description:          description.trim(),
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create disaster", error: String(err) });
  }
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateDisaster = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title, type, severity, status,
      affectedDistrictIds, affectedDistrictNames,
      startedAt, description,
    } = req.body as Partial<{
      title: string;
      type: IDisaster["type"];
      severity: IDisaster["severity"];
      status: IDisaster["status"];
      affectedDistrictIds: string[];
      affectedDistrictNames: string[];
      startedAt: string;
      description: string;
    }>;

    const update: Record<string, unknown> = {};
    if (title !== undefined)                 update.title                  = title.trim();
    if (type !== undefined)                  update.type                   = type;
    if (severity !== undefined)              update.severity               = severity;
    if (status !== undefined)                update.status                 = status;
    if (affectedDistrictIds !== undefined)   update.affectedDistrictIds    = affectedDistrictIds;
    if (affectedDistrictNames !== undefined) update.affectedDistrictNames  = affectedDistrictNames;
    if (startedAt !== undefined)             update.startedAt              = new Date(startedAt);
    if (description !== undefined)           update.description            = description.trim();

    const doc = await Disaster.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!doc) { res.status(404).json({ success: false, message: "Disaster not found" }); return; }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update disaster", error: String(err) });
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteDisaster = async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await Disaster.findByIdAndDelete(req.params.id);
    if (!doc) { res.status(404).json({ success: false, message: "Disaster not found" }); return; }
    res.json({ success: true, message: "Disaster deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete disaster", error: String(err) });
  }
};

// ── Seed ──────────────────────────────────────────────────────────────────────

export const seedDisasters = async (_req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ success: false, message: "Seed failed", error: String(err) });
  }
};
