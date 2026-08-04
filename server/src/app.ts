import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import requestRouter from "./features/requests/request.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
// Relax crossOriginResourcePolicy in Helmet so that clients can access static uploads
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);
app.use(morgan("dev"));
app.use(express.json());

// Serve uploads statically
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// Mount routers
app.use("/api/requests", requestRouter);

app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Disaster Platform API is running 🚀",
    });
});

export default app;