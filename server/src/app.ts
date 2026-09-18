import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import requestRouter      from "./features/requests/request.routes.js";
import locationRouter     from "./features/location/location.routes.js";
import disasterRouter     from "./features/disasters/disaster.routes.js";
import ngoRouter          from "./features/ngos/ngo.routes.js";
import notificationRouter from "./features/notifications/notification.routes.js";
import authRouter         from "./features/auth/auth.routes.js";
import inventoryRouter    from "./features/inventory/inventory.routes.js";
import contactRouter      from "./features/contact/contact.routes.js";

import mongoSanitize from "express-mongo-sanitize";

import hpp from "hpp";

import { globalLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(globalLimiter);
app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.query) mongoSanitize.sanitize(req.query);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.headers) mongoSanitize.sanitize(req.headers);
  next();
});
import { FilterXSS } from "xss";
const xssFilter = new FilterXSS();

function sanitizeObject(obj: any) {
  if (!obj || typeof obj !== 'object') return;
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = xssFilter.process(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
}

app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
});

app.use(hpp());

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/requests",      requestRouter);
app.use("/api/locations",     locationRouter);
app.use("/api/disasters",     disasterRouter);
app.use("/api/ngos",          ngoRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/auth",          authRouter);
app.use("/api/inventory",    inventoryRouter);
app.use("/api/contact",      contactRouter);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "Disaster Platform API v2 — request routing enabled" });
});

app.use(errorHandler);

export default app;
