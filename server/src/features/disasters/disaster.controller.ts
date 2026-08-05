import type { Request, Response } from "express";
import { Disaster } from "./disaster.model.js";

// List all active / monitoring disasters (used by the request form dropdown)
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

export const getAllDisasters = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Disaster.find().sort({ startedAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch disasters", error: String(err) });
  }
};

// Seed demo data — call POST /api/disasters/seed to bootstrap
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
