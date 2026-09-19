import mongoose from "mongoose";
import { healthService } from "../features/resilience/health.service.js";

export const connectDB = async () => {
    healthService.init();

    try {
        const connString = process.env.MONGODB_URI;
        if (!connString) {
            console.error("❌ Error: MONGODB_URI is not defined in environment variables. Starting in Fallback mode.");
            healthService.transitionTo("MONGODB_UNAVAILABLE", "MONGODB_URI not defined");
            return;
        }

        const conn = await mongoose.connect(connString, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
        healthService.transitionTo("HEALTHY", "Connected successfully");
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error(`❌ MongoDB connection error: ${msg}`);
        healthService.transitionTo("MONGODB_UNAVAILABLE", msg);
        console.warn("⚠️ Server proceeding in Fallback/Offline Mode using Firebase resilience layer.");
    }
};

