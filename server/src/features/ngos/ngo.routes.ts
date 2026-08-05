import { Router } from "express";
import {
  getAllNGOs, getMyProfile, getNGOById,
  createNGO, updateNGO, toggleActive,
} from "./ngo.controller.js";

const router = Router();

// Must declare /profile/:userId BEFORE /:id so Express doesn't treat "profile" as an id
router.get("/",                 getAllNGOs);
router.get("/profile/:userId",  getMyProfile);
router.get("/:id",              getNGOById);
router.post("/",                createNGO);
router.put("/:id",              updateNGO);
router.post("/:id/toggle",      toggleActive);

export default router;
