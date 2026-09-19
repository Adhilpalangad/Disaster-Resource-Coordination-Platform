import { Schema, model } from "mongoose";
import type {
  RequestCategory,
  UrgencyLevel,
  AgeGroup,
  SpecialNeed,
  RequestStatus,
  RequestLocation as IRequestLocation,
} from "@disaster-platform/shared";

export type {
  RequestCategory,
  UrgencyLevel,
  AgeGroup,
  SpecialNeed,
  RequestStatus,
  IRequestLocation,
};

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

  // Duplicate Detection Tracking
  duplicateOf?:       string;   // original ReliefRequest _id
  duplicateAttempts?: number;   // count of duplicate attempts logged against this request

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
        "rejected", "escalated", "closed", "duplicate_detected"
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

    // Duplicate tracking
    duplicateOf:       { type: String },
    duplicateAttempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for common query patterns
ReliefRequestSchema.index({ createdBy: 1, createdAt: -1 });
ReliefRequestSchema.index({ createdBy: 1, category: 1, createdAt: -1 });
ReliefRequestSchema.index({ status: 1, createdAt: -1 });
ReliefRequestSchema.index({ assignedNGO: 1, status: 1 });
ReliefRequestSchema.index({ "location.districtId": 1, status: 1 });
ReliefRequestSchema.index({ "location.talukId": 1, status: 1 });

export const ReliefRequest = model<IReliefRequest>("ReliefRequest", ReliefRequestSchema);
