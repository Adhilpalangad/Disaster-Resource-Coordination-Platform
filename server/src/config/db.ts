import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connString = process.env.MONGODB_URI;
        if (!connString) {
            console.error("❌ Error: MONGODB_URI is not defined in environment variables");
            return;
        }

        mongoose.set('bufferCommands', false);
        const conn = await mongoose.connect(connString, { serverSelectionTimeoutMS: 2000 });
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`⚠️  MongoDB connection warning: ${error instanceof Error ? error.message : error}`);
    }
};
