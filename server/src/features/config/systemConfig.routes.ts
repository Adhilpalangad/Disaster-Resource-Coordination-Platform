import { Router } from "express";
import {
  getSystemDuplicateConfig,
  updateSystemDuplicateConfig,
} from "./systemConfig.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/duplicate", requireAuth, getSystemDuplicateConfig);
router.put(
  "/duplicate",
  requireAuth,
  updateSystemDuplicateConfig
);

export default router;
