import { z } from "zod";

/** Matches IRequestLocation in request.model.ts. Required fields mirror the
 *  manual check that used to live in request.controller.ts's createRequest. */
export const requestLocationSchema = z.object({
  stateId:       z.string().trim().optional(),
  stateName:     z.string().trim().optional(),
  districtId:    z.string().trim().min(1, "district is required"),
  districtName:  z.string().trim().optional(),
  talukId:       z.string().trim().min(1, "taluk is required"),
  talukName:     z.string().trim().optional(),
  localBodyId:   z.string().trim().min(1, "local body is required"),
  localBodyName: z.string().trim().optional(),
  localBodyType: z.enum(["panchayat", "municipality", "corporation"]).optional(),
  wardId:        z.string().trim().optional(),
  wardName:      z.string().trim().optional(),
  landmark:      z.string().trim().optional(),
  gpsLat:        z.coerce.number().optional(),
  gpsLng:        z.coerce.number().optional(),
});

/** Validated against the already-deserialised object inside createRequest
 *  (location/ageGroups/specialNeeds arrive as JSON strings over multipart
 *  form-data and are parsed before this schema runs — see request.controller.ts). */
export const createRequestSchema = z.object({
  createdBy:      z.string().min(1, "createdBy is required"),
  fullName:       z.string().trim().min(1, "fullName is required"),
  mobileNumber:   z.string().trim().min(1, "mobileNumber is required"),
  peopleAffected: z.coerce.number().int().min(1, "peopleAffected must be at least 1"),
  ageGroups:      z.array(z.enum(["child", "adult", "elderly"])).default([]),
  specialNeeds:   z.array(z.enum(["disabled", "pregnant", "medical_condition", "none"])).default([]),
  disasterId:     z.string().trim().optional(),
  disasterName:   z.string().trim().optional(),
  category:       z.enum(["food", "water", "medicine", "shelter", "rescue", "transportation", "other"]),
  urgency:        z.enum(["low", "medium", "high", "critical"]).default("medium"),
  description:    z.string().trim().min(1, "description is required"),
  location:       requestLocationSchema,
});

/** Used by PUT /requests/:id (generic update — plain JSON body, not multipart). */
export const updateRequestSchema = z.object({
  fullName:       z.string().trim().min(1).optional(),
  mobileNumber:   z.string().trim().min(1).optional(),
  peopleAffected: z.coerce.number().int().min(1).optional(),
  ageGroups:      z.array(z.enum(["child", "adult", "elderly"])).optional(),
  specialNeeds:   z.array(z.enum(["disabled", "pregnant", "medical_condition", "none"])).optional(),
  category:       z.enum(["food", "water", "medicine", "shelter", "rescue", "transportation", "other"]).optional(),
  urgency:        z.enum(["low", "medium", "high", "critical"]).optional(),
  description:    z.string().trim().min(1).optional(),
  location:       requestLocationSchema.partial().optional(),
  status: z.enum([
    "pending", "location_routed", "ngo_assigned", "ngo_accepted",
    "verified", "resources_reserved", "volunteer_assigned",
    "in_transit", "delivered", "completed", "rejected", "escalated", "closed",
  ]).optional(),
}).partial();

export const rejectRequestSchema = z.object({
  note: z.string().trim().optional(),
});

export const assignVolunteerSchema = z.object({
  volunteerId:       z.string().min(1, "volunteerId is required"),
  volunteerName:     z.string().min(1, "volunteerName is required"),
  estimatedArrival:  z.string().optional(),
});

export const confirmDeliverySchema = z.object({
  feedback: z.string().trim().optional(),
});

export type CreateRequestInput   = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput   = z.infer<typeof updateRequestSchema>;
export type RejectRequestInput   = z.infer<typeof rejectRequestSchema>;
export type AssignVolunteerInput = z.infer<typeof assignVolunteerSchema>;
export type ConfirmDeliveryInput = z.infer<typeof confirmDeliverySchema>;
