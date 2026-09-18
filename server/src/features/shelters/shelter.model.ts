import { Schema, model, type Document } from "mongoose";

export interface IShelter extends Document {
  name: string;
  location: string;
  capacity: number;
  occupancy: number;
  status: "verified" | "in_progress" | "pending" | "resolved";
  manager: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShelterSchema = new Schema<IShelter>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true, default: 100 },
    occupancy: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["verified", "in_progress", "pending", "resolved"],
      default: "verified",
    },
    manager: { type: String, required: true },
    phone: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

ShelterSchema.index({ name: 1 });
ShelterSchema.index({ location: 1 });

export const Shelter = model<IShelter>("Shelter", ShelterSchema);
