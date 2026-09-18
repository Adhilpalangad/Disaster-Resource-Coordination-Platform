import { Router } from "express";
import {
  getAllNGOs, getMyProfile, getNGOById,
  createNGO, updateNGO, toggleActive,
} from "./ngo.controller.js";
import { validateBody } from "../../utils/validate.js";
import { createNGOSchema, updateNGOSchema } from "./ngo.validation.js";

const router = Router();

// Must declare /profile/:userId BEFORE /:id so Express doesn't treat "profile" as an id
router.get("/",                 getAllNGOs);
router.get("/profile/:userId",  getMyProfile);
router.get("/:id",              getNGOById);
router.post("/",                validateBody(createNGOSchema), createNGO);
router.put("/:id",              validateBody(updateNGOSchema), updateNGO);
router.post("/:id/toggle",      toggleActive);

export default router;
