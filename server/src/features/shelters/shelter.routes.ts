import { Router } from "express";
import {
  getShelters,
  getShelterById,
  createShelter,
  updateShelter,
  deleteShelter,
} from "./shelter.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, getShelters);
router.get("/:id", requireAuth, getShelterById);
router.post("/", requireAuth, createShelter);
router.put("/:id", requireAuth, updateShelter);
router.patch("/:id", requireAuth, updateShelter);
router.delete("/:id", requireAuth, deleteShelter);

export default router;
