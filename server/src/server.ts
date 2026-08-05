import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env lives at the project root, two levels above server/src/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
