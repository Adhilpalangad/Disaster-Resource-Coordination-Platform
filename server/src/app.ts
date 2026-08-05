import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import requestRouter  from "./features/requests/request.routes.js";
import locationRouter from "./features/location/location.routes.js";
import disasterRouter from "./features/disasters/disaster.routes.js";
import ngoRouter      from "./features/ngos/ngo.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan("dev"));
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/requests",  requestRouter);
app.use("/api/locations", locationRouter);
app.use("/api/disasters", disasterRouter);
app.use("/api/ngos",      ngoRouter);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Disaster Platform API v2 — request routing enabled" });
});

export default app;
