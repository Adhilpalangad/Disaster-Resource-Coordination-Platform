import { Router } from "express";
import {
  getVolunteers,
  getVolunteerById,
  updateVolunteer,
  deleteVolunteer,
} from "./volunteer.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getVolunteers);
router.get("/:id", requireAuth, getVolunteerById);
router.patch("/:id", requireAuth, updateVolunteer);
router.put("/:id", requireAuth, updateVolunteer);
router.delete("/:id", requireAuth, deleteVolunteer);

export default router;
