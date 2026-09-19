import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// .env lives at the project root, two levels above server/src/
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initializeFirebase } from "./config/firebase.config.js";
import { syncManager } from "./features/resilience/sync.manager.js";

const PORT = process.env.PORT || 5000;

initializeFirebase();

connectDB().then(async () => {
  // Seed demo data on first run
  try {
    const { seedDemoNGO }    = await import("./features/ngos/ngo.model.js");

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

    // Trigger sync worker to drain any outbox operations from previous downtime
    syncManager.triggerSync().catch((e) => console.warn("⚠️ Initial sync replay warning:", e));
  } catch (e) {
    console.warn("⚠️  Seed step failed (non-fatal):", e instanceof Error ? e.message : e);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});


