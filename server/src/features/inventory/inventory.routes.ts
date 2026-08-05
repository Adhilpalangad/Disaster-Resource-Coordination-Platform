import { Router } from "express";
import multer from "multer";
import {
  parseExcel,
  bulkImport,
  downloadTemplate,
  getInventory,
  addItem,
  updateItem,
  deleteItem,
  clearInventory,
} from "./inventory.controller.js";

const router  = Router();

// Store uploaded Excel in memory (max 5 MB) — we only parse it, never save to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel",                                           // .xls
      "text/csv",
      "application/csv",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx, .xls, or .csv files are allowed."));
    }
  },
});

// ── Special routes (before /:id) ──────────────────────────────────────────────
router.get("/template",     downloadTemplate);
router.post("/parse-excel", upload.single("file"), parseExcel);
router.post("/bulk-import", bulkImport);
router.delete("/clear",     clearInventory);

// ── Standard CRUD ─────────────────────────────────────────────────────────────
router.get("/",     getInventory);
router.post("/",    addItem);
router.put("/:id",  updateItem);
router.delete("/:id", deleteItem);

export default router;
