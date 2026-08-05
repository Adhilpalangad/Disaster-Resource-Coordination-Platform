import { Router } from "express";
import { getActiveDisasters, getDisasterById, getAllDisasters, seedDisasters } from "./disaster.controller.js";

const router = Router();

router.get("/",          getAllDisasters);
router.get("/active",    getActiveDisasters);
router.get("/:id",       getDisasterById);
router.post("/seed",     seedDisasters);   // POST /api/disasters/seed

export default router;
