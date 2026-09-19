import { z } from "zod";

export const createDisasterSchema = z.object({
  title:                  z.string().trim().min(1, "title is required"),
  type:                   z.enum(["flood", "earthquake", "cyclone", "landslide", "fire", "tsunami", "other"]),
  severity:               z.enum(["low", "moderate", "high", "critical"]).optional(),
  status:                 z.enum(["active", "monitoring", "resolved"]).optional(),
  affectedDistrictIds:    z.array(z.string()).optional(),
  affectedDistrictNames:  z.array(z.string()).optional(),
  startedAt:              z.string().optional(),
  description:            z.string().trim().min(1, "description is required"),
});

export const updateDisasterSchema = createDisasterSchema.partial();

export const volunteerResponseSchema = z.object({
  status: z.enum(["available", "unavailable"]),
});

export type CreateDisasterInput = z.infer<typeof createDisasterSchema>;
export type UpdateDisasterInput = z.infer<typeof updateDisasterSchema>;
