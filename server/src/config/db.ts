import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connString = process.env.MONGODB_URI;
        if (!connString) {
            console.error("❌ Error: MONGODB_URI is not defined in environment variables");
            process.exit(1);
        }

        const conn = await mongoose.connect(connString);
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
};
