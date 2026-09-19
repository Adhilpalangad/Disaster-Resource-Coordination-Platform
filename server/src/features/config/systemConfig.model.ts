import { Schema, model, Document } from "mongoose";
import { DEFAULT_DUPLICATE_CONFIG, type IDuplicateConfig } from "@disaster-platform/shared";

export interface ISystemConfigDocument extends Document {
  key: string;
  duplicateDetection: IDuplicateConfig;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfigDocument>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    duplicateDetection: {
      enabled: { type: Boolean, default: DEFAULT_DUPLICATE_CONFIG.enabled },
      exactCategoryMatchOnly: { type: Boolean, default: DEFAULT_DUPLICATE_CONFIG.exactCategoryMatchOnly },
      weights: {
        category: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.weights.category },
        location: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.weights.location },
        description: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.weights.description },
        temporal: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.weights.temporal },
      },
      thresholdActionMap: {
        warnMinScore: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.thresholdActionMap.warnMinScore },
        blockMinScore: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.thresholdActionMap.blockMinScore },
      },
      temporalDecayDays: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.temporalDecayDays },
      confirmTokenTtlMinutes: { type: Number, default: DEFAULT_DUPLICATE_CONFIG.confirmTokenTtlMinutes },
    },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const SystemConfig = model<ISystemConfigDocument>("SystemConfig", SystemConfigSchema);

/**
 * Helper to fetch the system duplicate config or return defaults if not configured
 */
export async function getDuplicateConfigFromDb(): Promise<IDuplicateConfig> {
  try {
    const configDoc = await SystemConfig.findOne({ key: "default" }).lean();
    if (configDoc && configDoc.duplicateDetection) {
      return configDoc.duplicateDetection;
    }
  } catch (err) {
    console.error("[SystemConfig] Error reading duplicate config, falling back to defaults:", err);
  }
  return DEFAULT_DUPLICATE_CONFIG;
}
