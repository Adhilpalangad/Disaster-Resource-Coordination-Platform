import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
    createRequest,
    getAllRequests,
    getRequestById,
    updateRequest,
    deleteRequest,
} from "./request.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../../../../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `request-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, or WEBP images are allowed"));
        }
    },
});

const router = Router();

router.post("/", upload.single("image"), createRequest);
router.get("/", getAllRequests);
router.get("/:id", getRequestById);
router.put("/:id", updateRequest);
router.delete("/:id", deleteRequest);

export default router;
export { uploadsDir };
