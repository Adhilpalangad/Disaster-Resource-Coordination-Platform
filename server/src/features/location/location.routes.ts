import { Router } from "express";
import { getDistricts, getTaluks, getLocalBodies, getWards } from "./location.controller.js";

const router = Router();

router.get("/districts", getDistricts);
router.get("/districts/:districtId/taluks", getTaluks);
router.get("/taluks/:talukId/local-bodies", getLocalBodies);
router.get("/local-bodies/:localBodyId/wards", getWards);

export default router;
