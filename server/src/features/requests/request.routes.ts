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

import { v2 as cloudinary } from "cloudinary";

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  } as any);
}

const handleCloudinaryUpload = async (req: any, _res: any, next: any) => {
  if (req.file && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "disaster_requests",
      });
      req.file.filename = result.secure_url;
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (err) {
      console.error("[Cloudinary] Upload failed, using local file:", err);
    }
  }
  next();
};

const router = Router();

// CRUD
router.post("/",    upload.single("image"), handleCloudinaryUpload, createRequest);
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
