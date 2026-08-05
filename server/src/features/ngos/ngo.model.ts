import { Schema, model } from "mongoose";

/**
 * NGO operational profile — separate from the auth user record.
 * Linked to the auth user by userId.
 */
export interface INGOProfile {
  userId: string;       // auth user ID (matches mock/real auth)
  orgName: string;
  email: string;
  phone?: string;
  isActive: boolean;

  // Areas this NGO can service (arrays of location IDs from keralaLocations)
  serviceAreas: {
    districtIds: string[];
    talukIds:    string[];
    localBodyIds: string[];
  };

  // Capacity & load tracking
  resourceCapacity: number;      // max requests they can handle concurrently
  currentWorkload:  number;      // current active requests assigned
  acceptanceTimeoutMinutes: number; // auto-forward timeout (default 30)

  createdAt: Date;
  updatedAt: Date;
}

const NGOProfileSchema = new Schema<INGOProfile>(
  {
    userId:  { type: String, required: true, unique: true },
    orgName: { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String },
    isActive: { type: Boolean, default: true },

    serviceAreas: {
      districtIds:  { type: [String], default: [] },
      talukIds:     { type: [String], default: [] },
      localBodyIds: { type: [String], default: [] },
    },

    resourceCapacity:          { type: Number, default: 50 },
    currentWorkload:           { type: Number, default: 0 },
    acceptanceTimeoutMinutes:  { type: Number, default: 30 },
  },
  { timestamps: true }
);

NGOProfileSchema.index({ "serviceAreas.districtIds": 1 });
NGOProfileSchema.index({ "serviceAreas.talukIds":    1 });
NGOProfileSchema.index({ "serviceAreas.localBodyIds": 1 });

export const NGOProfile = model<INGOProfile>("NGOProfile", NGOProfileSchema);

// ── Seed helper ──────────────────────────────────────────────────────────────
// Call once to register the demo NGO user with proper service areas.
export async function seedDemoNGO(): Promise<void> {
  const exists = await NGOProfile.findOne({ userId: "demo-ngo-001" });
  if (exists) return;

  // Clean up the old seed if it exists
  await NGOProfile.deleteOne({ userId: "demo-ngo-user" });

  await NGOProfile.create({
    userId:  "demo-ngo-001",
    orgName: "Wayanad District Relief Foundation",
    email:   "ngo@demo.com",
    phone:   "+91 90000 00001",
    isActive: true,
    serviceAreas: {
      districtIds:  ["WYD", "KZD"],
      talukIds:     ["WYD-MND", "WYD-SBT", "WYD-VTR"],
      localBodyIds: [],   // covers entire district, not just specific bodies
    },
    resourceCapacity:         100,
    currentWorkload:          0,
    acceptanceTimeoutMinutes: 30,
  });

  console.log("✅ Demo NGO profile seeded (Wayanad District Relief Foundation)");
}
