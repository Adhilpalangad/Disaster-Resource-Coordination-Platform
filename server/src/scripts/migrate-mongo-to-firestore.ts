import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { initializeFirebase } from "../config/firebase.config.js";
import { firestoreAdapter } from "../features/resilience/firestore.adapter.js";

// Models
import { User } from "../features/auth/user.model.js";
import { SystemConfig } from "../features/config/systemConfig.model.js";
import { Disaster } from "../features/disasters/disaster.model.js";
import { VolunteerDisasterResponse } from "../features/disasters/volunteer-response.model.js";
import { InventoryItem } from "../features/inventory/inventory.model.js";
import { NGOProfile } from "../features/ngos/ngo.model.js";
import { Notification } from "../features/notifications/notification.model.js";
import { DuplicateAttemptLog } from "../features/requests/duplicate.model.js";
import { ReliefRequest } from "../features/requests/request.model.js";
import { Shelter } from "../features/shelters/shelter.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const MODELS_TO_MIGRATE = [
  { name: "User", model: User },
  { name: "SystemConfig", model: SystemConfig },
  { name: "Disaster", model: Disaster },
  { name: "VolunteerDisasterResponse", model: VolunteerDisasterResponse },
  { name: "InventoryItem", model: InventoryItem },
  { name: "NGOProfile", model: NGOProfile },
  { name: "Notification", model: Notification },
  { name: "DuplicateAttemptLog", model: DuplicateAttemptLog },
  { name: "ReliefRequest", model: ReliefRequest },
  { name: "Shelter", model: Shelter },
];

export async function runMigration() {
  console.log("🚀 Starting MongoDB ➔ Firestore Initial Migration Process...");

  const connString = process.env.MONGODB_URI;
  if (!connString) {
    console.error("❌ MONGODB_URI missing in environment variables.");
    process.exit(1);
  }

  await mongoose.connect(connString);
  console.log("📡 Connected to MongoDB.");

  initializeFirebase();

  let totalMigrated = 0;
  const summary: Record<string, { mongoCount: number; migratedCount: number }> = {};

  for (const { name, model } of MODELS_TO_MIGRATE) {
    const collectionName = (model as any).collection.name;
    const mongoDocs = await (model as any).find({}).lean().exec();
    console.log(`📦 Processing '${name}' (Collection: ${collectionName}) — ${mongoDocs.length} documents found...`);

    let count = 0;
    for (const doc of mongoDocs) {
      const docId = String((doc as any)._id);
      const cleanDoc = { ...(doc as any) };
      delete cleanDoc.__v;

      await firestoreAdapter.writeDocument(collectionName, docId, cleanDoc);
      count++;
    }

    summary[name] = {
      mongoCount: mongoDocs.length,
      migratedCount: count,
    };
    totalMigrated += count;
    console.log(`✅ Completed '${name}': ${count}/${mongoDocs.length} synced to Firestore.`);
  }

  console.log("\n=======================================================");
  console.log("🎉 Migration Summary:");
  console.table(summary);
  console.log(`Total Documents Migrated: ${totalMigrated}`);
  console.log("=======================================================\n");

  await mongoose.disconnect();
  console.log("👋 Disconnected from MongoDB. Migration complete.");
}

// Allow direct execution via CLI
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/"))) {
  runMigration().catch((err) => {
    console.error("❌ Migration failed with error:", err);
    process.exit(1);
  });
}

