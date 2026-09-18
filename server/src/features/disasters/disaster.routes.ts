import { Router } from "express";
import {
  getAllDisasters,
  getActiveDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster,
  seedDisasters,
  respondToDisaster,
  getVolunteerResponses,
} from "./disaster.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validateBody } from "../../utils/validate.js";
import { createDisasterSchema, updateDisasterSchema, volunteerResponseSchema } from "./disaster.validation.js";

const router = Router();

router.get("/",         getAllDisasters);
router.get("/active",   getActiveDisasters);
router.get("/:id",      getDisasterById);
router.post("/",        validateBody(createDisasterSchema), createDisaster);
router.put("/:id",      validateBody(updateDisasterSchema), updateDisaster);
router.delete("/:id",   deleteDisaster);
router.post("/seed",    seedDisasters);   // POST /api/disasters/seed

// Volunteer opt-in for a disaster
router.post("/:id/volunteer-response",  requireAuth, validateBody(volunteerResponseSchema), respondToDisaster);
router.get("/:id/volunteer-responses",  requireAuth, getVolunteerResponses);

export default router;
