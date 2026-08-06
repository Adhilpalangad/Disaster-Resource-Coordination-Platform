import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  createRequest, getAllRequests, getRequestById, updateRequest, deleteRequest,
  verifyRequest, rejectRequest, ngoAcceptRequest, reserveResources, assignVolunteer,
  markInTransit, markDelivered, confirmDelivery,
} from "./request.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../../../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `request-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/;
    if (ok.test(file.mimetype) && ok.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
    }
  },
});

const router = Router();

// CRUD
router.post("/",    upload.single("image"), createRequest);
router.get("/",     requireAuth, getAllRequests);
router.get("/:id",  getRequestById);
router.put("/:id",  updateRequest);
router.delete("/:id", deleteRequest);

// NGO lifecycle actions
router.post("/:id/accept",            ngoAcceptRequest);
router.post("/:id/verify",            verifyRequest);
router.post("/:id/reject",            rejectRequest);
router.post("/:id/reserve-resources", reserveResources);
router.post("/:id/assign-volunteer",  assignVolunteer);

// Volunteer actions
router.post("/:id/in-transit",  markInTransit);
router.post("/:id/delivered",   markDelivered);

// Citizen confirmation
router.post("/:id/confirm",     confirmDelivery);

export default router;
export { uploadsDir };
