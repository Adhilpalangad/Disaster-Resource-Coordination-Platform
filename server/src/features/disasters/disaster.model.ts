import { Schema, model } from "mongoose";

export interface IDisaster {
  title: string;
  type: "flood" | "earthquake" | "cyclone" | "landslide" | "fire" | "tsunami" | "other";
  severity: "low" | "moderate" | "high" | "critical";
  status: "active" | "monitoring" | "resolved";
  affectedDistrictIds: string[];   // district IDs from kerala location data
  affectedDistrictNames: string[]; // for display
  startedAt: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const DisasterSchema = new Schema<IDisaster>(
  {
    title:    { type: String, required: true },
    type:     { type: String, enum: ["flood", "earthquake", "cyclone", "landslide", "fire", "tsunami", "other"], required: true },
    severity: { type: String, enum: ["low", "moderate", "high", "critical"], default: "high" },
    status:   { type: String, enum: ["active", "monitoring", "resolved"], default: "active" },
    affectedDistrictIds:   { type: [String], default: [] },
    affectedDistrictNames: { type: [String], default: [] },
    startedAt:   { type: Date, default: Date.now },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

DisasterSchema.index({ status: 1 });

export const Disaster = model<IDisaster>("Disaster", DisasterSchema);
