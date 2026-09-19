// Shared TypeScript Domain Types & Interfaces

// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = "citizen" | "ngo" | "volunteer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  organizationName?: string;
  district?: string;
  profession?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  organizationName?: string;
  district?: string;
  profession?: string;
}

// ─── Disaster ─────────────────────────────────────────────────────────────────

export type DisasterType   = "flood" | "earthquake" | "cyclone" | "landslide" | "fire" | "tsunami" | "other";
export type DisasterStatus = "active" | "monitoring" | "resolved";
export type SeverityLevel  = "low" | "moderate" | "high" | "critical";

export interface Disaster {
  _id: string;
  title: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: DisasterStatus;
  affectedDistrictIds:   string[];
  affectedDistrictNames: string[];
  startedAt: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface VolunteerDisasterResponse {
  _id: string;
  disasterId:     string;
  volunteerId:    string;
  volunteerName:  string;
  volunteerEmail: string;
  district:       string;
  status:         "available" | "unavailable";
  respondedAt:    string;
  createdAt:      string;
  updatedAt:      string;
}

// ─── Relief Request ───────────────────────────────────────────────────────────

export type RequestCategory =
  | "food" | "water" | "medicine" | "shelter"
  | "rescue" | "transportation" | "other";

export type RequestStatus =
  | "pending"
  | "pending_verification"
  | "location_routed"
  | "ngo_assigned"
  | "ngo_accepted"
  | "verified"
  | "resources_reserved"
  | "volunteer_assigned"
  | "assigned"
  | "in_progress"
  | "in_transit"
  | "delivered"
  | "completed"
  | "resolved"
  | "rejected"
  | "escalated"
  | "closed"
  | "duplicate_detected";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type AgeGroup     = "child" | "adult" | "elderly";
export type SpecialNeed  = "disabled" | "pregnant" | "medical_condition" | "none";

export interface RequestLocation {
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
  fullAddress?:   string;
}

export interface RoutingHistoryEntry {
  ngoId:        string;
  ngoName:      string;
  assignedAt:   string;
  respondedAt?: string;
  response?:    "accepted" | "declined" | "timeout";
  note?:        string;
}

export interface ReliefRequest {
  _id:              string;
  createdBy:        string;
  fullName:         string;
  mobileNumber:     string;
  peopleAffected:   number;
  ageGroups:        AgeGroup[];
  specialNeeds:     SpecialNeed[];
  disasterId?:      string;
  disasterName?:    string;
  category:         RequestCategory;
  urgency:          UrgencyLevel;
  description:      string;
  imageUrl?:        string;
  location:         RequestLocation;
  status:           RequestStatus;
  routingHistory?:  RoutingHistoryEntry[];
  assignedNGO?:     string;
  assignedNGOName?: string;
  ngoAssignedAt?:   string;
  ngoAcceptedAt?:   string;
  verifiedAt?:      string;
  verificationNote?: string;
  resourcesReservedAt?: string;
  assignedVolunteer?: string;
  assignedVolunteerName?: string;
  volunteerAssignedAt?: string;
  estimatedArrival?: string;
  inTransitAt?:     string;
  deliveredAt?:     string;
  citizenConfirmedAt?: string;
  citizenFeedback?: string;
  completedAt?:     string;
  closedAt?:        string;
  cancellationReason?: string;
  duplicateOf?:     string;
  duplicateAttempts?: number;
  createdAt:        string;
  updatedAt:        string;
}

// ─── NGO & Inventory ──────────────────────────────────────────────────────────

export interface NGOProfileData {
  _id:     string;
  userId:  string;
  orgName: string;
  email:   string;
  phone?:  string;
  isActive: boolean;
  serviceAreas: {
    districtIds:  string[];
    talukIds:     string[];
    localBodyIds: string[];
  };
  resourceCapacity:         number;
  currentWorkload:          number;
  acceptanceTimeoutMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  _id:        string;
  ngoId:      string;
  name:       string;
  category:   "food" | "water" | "medicine" | "clothing" | "rescue_equipment" | "other";
  quantity:   number;
  unit:       string;
  location?:  string;
  expiresAt?: string;
  notes?:     string;
  createdAt:  string;
  updatedAt:  string;
}
