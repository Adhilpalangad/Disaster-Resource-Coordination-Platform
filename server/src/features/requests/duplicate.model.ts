import { Schema, model, Document } from "mongoose";
import type { SimilarityBreakdown } from "@disaster-platform/shared";

export type DuplicateActionType = "blocked" | "warning_ignored" | "overridden_by_admin";

export interface IDuplicateAttemptLog extends Document {
  citizenId: string;
  citizenName: string;
  citizenMobile: string;
  existingRequestId: string;
  attemptedPayload: {
    category: string;
    description: string;
    urgency?: string;
    location: Record<string, any>;
    peopleAffected?: number;
  };
  similarityScore: number;
  breakdown: SimilarityBreakdown;
  action: DuplicateActionType;
  confirmToken?: string;
  confirmTokenExpiresAt?: Date;
  overriddenBy?: string;
  overriddenAt?: Date;
  overrideReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DuplicateAttemptLogSchema = new Schema<IDuplicateAttemptLog>(
  {
    citizenId: { type: String, required: true, index: true },
    citizenName: { type: String, required: true },
    citizenMobile: { type: String, required: true },
    existingRequestId: { type: String, required: true, index: true },
    attemptedPayload: {
      category: { type: String, required: true },
      description: { type: String, required: true },
      urgency: { type: String },
      location: { type: Schema.Types.Mixed, required: true },
      peopleAffected: { type: Number },
    },
    similarityScore: { type: Number, required: true },
    breakdown: {
      categoryScore: { type: Number, required: true },
      locationScore: { type: Number, required: true },
      descriptionScore: { type: Number, required: true },
      temporalMultiplier: { type: Number, required: true },
    },
    action: {
      type: String,
      enum: ["blocked", "warning_ignored", "overridden_by_admin"],
      required: true,
    },
    confirmToken: { type: String, index: true },
    confirmTokenExpiresAt: { type: Date },
    overriddenBy: { type: String },
    overriddenAt: { type: Date },
    overrideReason: { type: String },
  },
  { timestamps: true }
);

DuplicateAttemptLogSchema.index({ createdAt: -1 });

export const DuplicateAttemptLog = model<IDuplicateAttemptLog>(
  "DuplicateAttemptLog",
  DuplicateAttemptLogSchema
);
