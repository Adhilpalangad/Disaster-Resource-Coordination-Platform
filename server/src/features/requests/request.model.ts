import { Schema, model } from "mongoose";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type RequestCategory =
  | "food" | "water" | "medicine" | "shelter"
  | "rescue" | "transportation" | "other";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type AgeGroup = "child" | "adult" | "elderly";

export type SpecialNeed = "disabled" | "pregnant" | "medical_condition" | "none";

/**
 * Full request lifecycle:
 *
 *  pending → location_routed → ngo_assigned → ngo_accepted
 *         → verified → resources_reserved → volunteer_assigned
 *         → in_transit → delivered → completed
 *
 * Side exits: rejected, escalated (no NGO found), closed (archived)
 */
export type RequestStatus =
  | "pending"            // submitted, routing not yet run
  | "location_routed"    // location validated; routing engine searching for NGO
  | "ngo_assigned"       // best NGO assigned, awaiting NGO acceptance
  | "ngo_accepted"       // NGO accepted the request
  | "verified"           // NGO verified request authenticity
  | "resources_reserved" // NGO reserved required resources
  | "volunteer_assigned" // volunteer assigned to deliver
  | "in_transit"         // volunteer en route to citizen
  | "delivered"          // delivered; awaiting citizen confirmation
  | "completed"          // citizen confirmed receipt — request closed successfully
  | "rejected"           // rejected by NGO or admin (with note)
  | "escalated"          // no NGO accepted; escalated to admin
  | "closed";            // manually archived

// ── Sub-document interfaces ───────────────────────────────────────────────────

export interface IRequestLocation {
  stateId:        string;
  stateName:      string;
  districtId:     string;
  districtName:   string;
  talukId:        string;
  talukName:      string;
  localBodyId:    string;
  localBodyName:  string;
  localBodyType:  "panchayat" | "municipality" | "corporation";
  wardId?:        string;
  wardName?:      string;
  landmark?:      string;
  gpsLat?:        number;
  gpsLng?:        number;
  // Computed human-readable string stored for display/search
  fullAddress?:   string;
}

export interface IRoutingHistoryEntry {
  ngoId:         string;
  ngoName:       string;
  assignedAt:    Date;
  respondedAt?:  Date;
  response?:     "accepted" | "declined" | "timeout";
  note?:         string;
}

// ── Main interface ────────────────────────────────────────────────────────────

export interface IReliefRequest {
  // ── Personal Information ─────────────────────────────────────────────────
  createdBy:      string;      // auth user ID
  fullName:       string;
  mobileNumber:   string;
  peopleAffected: number;
  ageGroups:      AgeGroup[];
  specialNeeds:   SpecialNeed[];

  // ── Disaster & Request Details ────────────────────────────────────────────
  disasterId?:    string;
  disasterName?:  string;
  category:       RequestCategory;
  urgency:        UrgencyLevel;
  description:    string;
  imageUrl?:      string;

  // ── Structured Location ───────────────────────────────────────────────────
  location: IRequestLocation;

  // ── Routing ───────────────────────────────────────────────────────────────
  status:          RequestStatus;
  routingHistory:  IRoutingHistoryEntry[];
  assignedNGO?:    string;   // NGOProfile _id
  assignedNGOName?: string;
  ngoAssignedAt?:  Date;

  // ── NGO Workflow ──────────────────────────────────────────────────────────
  ngoAcceptedAt?:     Date;
  verifiedAt?:        Date;
  verificationNote?:  string;
  resourcesReservedAt?: Date;

  // ── Volunteer Workflow ────────────────────────────────────────────────────
  assignedVolunteer?:     string;
  assignedVolunteerName?: string;
  volunteerAssignedAt?:   Date;
  estimatedArrival?:      Date;
  inTransitAt?:           Date;

  // ── Completion ────────────────────────────────────────────────────────────
  deliveredAt?:         Date;
  citizenConfirmedAt?:  Date;
  citizenFeedback?:     string;
  completedAt?:         Date;

  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const LocationSchema = new Schema<IRequestLocation>(
  {
    stateId:       { type: String, required: true },
    stateName:     { type: String, required: true },
    districtId:    { type: String, required: true },
    districtName:  { type: String, required: true },
    talukId:       { type: String, required: true },
    talukName:     { type: String, required: true },
    localBodyId:   { type: String, required: true },
    localBodyName: { type: String, required: true },
    localBodyType: { type: String, enum: ["panchayat", "municipality", "corporation"], required: true },
    wardId:        { type: String },
    wardName:      { type: String },
    landmark:      { type: String },
    gpsLat:        { type: Number },
    gpsLng:        { type: Number },
    fullAddress:   { type: String },
  },
  { _id: false }
);

const RoutingHistorySchema = new Schema<IRoutingHistoryEntry>(
  {
    ngoId:       { type: String, required: true },
    ngoName:     { type: String, required: true },
    assignedAt:  { type: Date,   required: true },
    respondedAt: { type: Date },
    response:    { type: String, enum: ["accepted", "declined", "timeout"] },
    note:        { type: String },
  },
  { _id: false }
);

const ReliefRequestSchema = new Schema<IReliefRequest>(
  {
    // Personal
    createdBy:      { type: String, required: true },
    fullName:       { type: String, required: true },
    mobileNumber:   { type: String, required: true },
    peopleAffected: { type: Number, required: true, min: 1 },
    ageGroups:      { type: [String], enum: ["child", "adult", "elderly"], default: [] },
    specialNeeds:   { type: [String], enum: ["disabled", "pregnant", "medical_condition", "none"], default: [] },

    // Disaster & request
    disasterId:   { type: String },
    disasterName: { type: String },
    category: {
      type: String,
      enum: ["food", "water", "medicine", "shelter", "rescue", "transportation", "other"],
      required: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    description: { type: String, required: true },
    imageUrl:    { type: String },

    // Location
    location: { type: LocationSchema, required: true },

    // Routing
    status: {
      type: String,
      enum: [
        "pending", "location_routed", "ngo_assigned", "ngo_accepted",
        "verified", "resources_reserved", "volunteer_assigned",
        "in_transit", "delivered", "completed",
        "rejected", "escalated", "closed",
      ],
      default: "pending",
    },
    routingHistory: { type: [RoutingHistorySchema], default: [] },
    assignedNGO:     { type: String },
    assignedNGOName: { type: String },
    ngoAssignedAt:   { type: Date },

    // NGO workflow
    ngoAcceptedAt:       { type: Date },
    verifiedAt:          { type: Date },
    verificationNote:    { type: String },
    resourcesReservedAt: { type: Date },

    // Volunteer workflow
    assignedVolunteer:     { type: String },
    assignedVolunteerName: { type: String },
    volunteerAssignedAt:   { type: Date },
    estimatedArrival:      { type: Date },
    inTransitAt:           { type: Date },

    // Completion
    deliveredAt:         { type: Date },
    citizenConfirmedAt:  { type: Date },
    citizenFeedback:     { type: String },
    completedAt:         { type: Date },
  },
  { timestamps: true }
);

// Indexes for common query patterns
ReliefRequestSchema.index({ createdBy: 1, createdAt: -1 });
ReliefRequestSchema.index({ status: 1, createdAt: -1 });
ReliefRequestSchema.index({ assignedNGO: 1, status: 1 });
ReliefRequestSchema.index({ "location.districtId": 1, status: 1 });
ReliefRequestSchema.index({ "location.talukId": 1, status: 1 });

export const ReliefRequest = model<IReliefRequest>("ReliefRequest", ReliefRequestSchema);
