import { Schema, model } from "mongoose";

export interface IVolunteerDisasterResponse {
  disasterId:     string;
  volunteerId:    string;
  volunteerName:  string;
  volunteerEmail: string;
  district:       string;
  status:         "available" | "unavailable";
  respondedAt:    Date;
  createdAt:      Date;
  updatedAt:      Date;
}

const VolunteerResponseSchema = new Schema<IVolunteerDisasterResponse>(
  {
    disasterId:     { type: String, required: true },
    volunteerId:    { type: String, required: true },
    volunteerName:  { type: String, required: true },
    volunteerEmail: { type: String, required: true },
    district:       { type: String, default: "" },
    status:         { type: String, enum: ["available", "unavailable"], required: true },
    respondedAt:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One response per volunteer per disaster — upsert safe
VolunteerResponseSchema.index({ disasterId: 1, volunteerId: 1 }, { unique: true });
VolunteerResponseSchema.index({ disasterId: 1, status: 1 });

export const VolunteerDisasterResponse = model<IVolunteerDisasterResponse>(
  "VolunteerDisasterResponse",
  VolunteerResponseSchema
);
