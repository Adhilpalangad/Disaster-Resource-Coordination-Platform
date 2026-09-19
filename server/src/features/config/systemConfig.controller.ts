import type { Request, Response } from "express";
import { SystemConfig, getDuplicateConfigFromDb } from "./systemConfig.model.js";

export const getSystemDuplicateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getDuplicateConfigFromDb();
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch duplicate configuration",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateSystemDuplicateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const adminId = (req.user as any)?._id?.toString() || "admin";

    let configDoc = await SystemConfig.findOne({ key: "default" });
    if (!configDoc) {
      configDoc = new SystemConfig({ key: "default", duplicateDetection: updates, updatedBy: adminId });
    } else {
      configDoc.duplicateDetection = {
        ...configDoc.duplicateDetection,
        ...updates,
      };
      configDoc.updatedBy = adminId;
    }

    await configDoc.save();

    res.json({
      success: true,
      message: "Duplicate detection configuration updated successfully",
      data: configDoc.duplicateDetection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update duplicate configuration",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
