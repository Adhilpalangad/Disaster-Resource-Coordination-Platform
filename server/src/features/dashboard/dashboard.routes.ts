import { Router } from "express";
import { getDashboardStats } from "./dashboard.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", requireAuth, getDashboardStats);
router.get("/", requireAuth, getDashboardStats);

export default router;
