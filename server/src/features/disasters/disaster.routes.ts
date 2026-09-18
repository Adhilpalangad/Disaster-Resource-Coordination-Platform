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

const router = Router();

router.get("/",         getAllDisasters);
router.get("/active",   getActiveDisasters);
router.get("/:id",      getDisasterById);
router.post("/",        createDisaster);
router.put("/:id",      updateDisaster);
router.delete("/:id",   deleteDisaster);
router.post("/seed",    seedDisasters);   // POST /api/disasters/seed

// Volunteer opt-in for a disaster
router.post("/:id/volunteer-response",  requireAuth, respondToDisaster);
router.get("/:id/volunteer-responses",  requireAuth, getVolunteerResponses);

export default router;
