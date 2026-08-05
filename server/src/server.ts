import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env lives at the project root, two levels above server/src/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  // Seed demo data on first run
  try {
    const { seedDisasters }  = await import("./features/disasters/disaster.controller.js");
    const { seedDemoNGO }    = await import("./features/ngos/ngo.model.js");

    // seedDisasters expects req/res — call internal seeding logic directly
    const { Disaster } = await import("./features/disasters/disaster.model.js");
    const existing = await Disaster.countDocuments();
    if (existing === 0) {
      await Disaster.create([
        {
          title: "Wayanad Flood Relief Operation 2024",
          type: "flood", severity: "critical", status: "active",
          affectedDistrictIds: ["WYD"], affectedDistrictNames: ["Wayanad"],
          startedAt: new Date("2024-07-30"),
          description:
            "Severe flooding and landslides triggered by heavy monsoon rainfall. " +
            "Mananthavady, Vythiri, and Sulthan Bathery taluks severely affected. " +
            "Immediate relief required for food, water, medical, and shelter needs.",
        },
        {
          title: "Kozhikode District Flood Alert",
          type: "flood", severity: "high", status: "monitoring",
          affectedDistrictIds: ["KZD"], affectedDistrictNames: ["Kozhikode"],
          startedAt: new Date("2024-08-01"),
          description: "IMD red alert issued. River levels rising. Coastal villages at risk.",
        },
      ]);
      console.log("✅ Demo disaster data seeded");
    }

    await seedDemoNGO();
  } catch (e) {
    console.warn("⚠️  Seed step failed (non-fatal):", e instanceof Error ? e.message : e);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
