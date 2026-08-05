import { Router } from "express";
import {
  getAllDisasters,
  getActiveDisasters,
  getDisasterById,
  createDisaster,
  updateDisaster,
  deleteDisaster,
  seedDisasters,
} from "./disaster.controller.js";

const router = Router();

router.get("/",         getAllDisasters);
router.get("/active",   getActiveDisasters);
router.get("/:id",      getDisasterById);
router.post("/",        createDisaster);
router.put("/:id",      updateDisaster);
router.delete("/:id",   deleteDisaster);
router.post("/seed",    seedDisasters);   // POST /api/disasters/seed

export default router;
