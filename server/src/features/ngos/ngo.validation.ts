import { z } from "zod";

const serviceAreasSchema = z.object({
  districtIds:  z.array(z.string()).optional(),
  talukIds:     z.array(z.string()).optional(),
  localBodyIds: z.array(z.string()).optional(),
});

export const createNGOSchema = z.object({
  userId:                    z.string().min(1, "userId is required"),
  orgName:                   z.string().trim().min(1, "orgName is required"),
  email:                     z.string().trim().min(1, "email is required").email("a valid email is required"),
  phone:                     z.string().trim().optional(),
  serviceAreas:              serviceAreasSchema.optional(),
  resourceCapacity:          z.coerce.number().int().positive().optional(),
  acceptanceTimeoutMinutes:  z.coerce.number().int().positive().optional(),
});

export const updateNGOSchema = createNGOSchema.omit({ userId: true }).partial();

export type CreateNGOInput = z.infer<typeof createNGOSchema>;
export type UpdateNGOInput = z.infer<typeof updateNGOSchema>;
