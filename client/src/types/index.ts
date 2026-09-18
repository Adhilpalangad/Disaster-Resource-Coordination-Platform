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

export interface LoginCredentials { email: string; password: string; }

export interface RegisterPayload {
  name: string; email: string; password: string; role: UserRole;
  phone?: string; organizationName?: string;
  district?: string; profession?: string;
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

/**
 * Full lifecycle:
 * pending → location_routed → ngo_assigned → ngo_accepted
 *   → verified → resources_reserved → volunteer_assigned
 *   → in_transit → delivered → completed
 *
 * Side exits: rejected | escalated | closed
 */
export type RequestStatus =
  | "pending"
  | "location_routed"
  | "ngo_assigned"
  | "ngo_accepted"
  | "verified"
  | "resources_reserved"
  | "volunteer_assigned"
  | "in_transit"
  | "delivered"
  | "completed"
  | "rejected"
  | "escalated"
  | "closed";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type AgeGroup     = "child" | "adult" | "elderly";
export type SpecialNeed  = "disabled" | "pregnant" | "medical_condition" | "none";

export interface RequestLocation {
  stateId:       string;
  stateName:     string;
  districtId:    string;
  districtName:  string;
  talukId:       string;
  talukName:     string;
  localBodyId:   string;
  localBodyName: string;
  localBodyType: "panchayat" | "municipality" | "corporation";
  wardId?:       string;
  wardName?:     string;
  landmark?:     string;
  gpsLat?:       number;
  gpsLng?:       number;
  fullAddress?:  string;
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
  _id: string;

  // Personal
  createdBy:      string;
  fullName:       string;
  mobileNumber:   string;
  peopleAffected: number;
  ageGroups:      AgeGroup[];
  specialNeeds:   SpecialNeed[];

  // Disaster & request
  disasterId?:   string;
  disasterName?: string;
  category:      RequestCategory;
  urgency:       UrgencyLevel;
  description:   string;
  imageUrl?:     string;

  // Structured location
  location: RequestLocation;

  // Routing
  status:           RequestStatus;
  routingHistory:   RoutingHistoryEntry[];
  assignedNGO?:     string;
  assignedNGOName?: string;
  ngoAssignedAt?:   string;

  // NGO workflow
  ngoAcceptedAt?:      string;
  verifiedAt?:         string;
  verificationNote?:   string;
  resourcesReservedAt?: string;

  // Volunteer workflow
  assignedVolunteer?:     string;
  assignedVolunteerName?: string;
  volunteerAssignedAt?:   string;
  estimatedArrival?:      string;
  inTransitAt?:           string;

  // Completion
  deliveredAt?:        string;
  citizenConfirmedAt?: string;
  citizenFeedback?:    string;
  completedAt?:        string;

  createdAt: string;
  updatedAt: string;
}

// ─── NGO Profile ──────────────────────────────────────────────────────────────

export interface NGOProfile {
  _id: string;
  userId: string;
  orgName: string;
  email:   string;
  isActive: boolean;
  serviceAreas: {
    districtIds:  string[];
    talukIds:     string[];
    localBodyIds: string[];
  };
  currentWorkload:           number;
  acceptanceTimeoutMinutes:  number;
  createdAt: string;
  updatedAt: string;
}

// ─── Location (Kerala hierarchy) ─────────────────────────────────────────────

export interface Ward       { id: string; name: string; }
export interface LocalBody  { id: string; name: string; type: "panchayat" | "municipality" | "corporation"; }
export interface Taluk      { id: string; name: string; }
export interface District   { id: string; name: string; }

// ─── Shelter ──────────────────────────────────────────────────────────────────

export type ShelterStatus = "open" | "full" | "closed";

export interface Shelter {
  _id: string; name: string; location: string;
  capacity: number; currentOccupancy: number; status: ShelterStatus;
  managedBy?: string; contactNumber?: string;
  availableResources: string[];
  createdAt: string; updatedAt: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type InventoryCategory = "food" | "water" | "medicine" | "clothing" | "rescue_equipment" | "other";

export interface InventoryItem {
  _id: string; ngoId: string; name: string;
  category: InventoryCategory; quantity: number; unit: string;
  location?: string; expiresAt?: string;
  createdAt: string; updatedAt: string;
}

// ─── Assignment ────────────────────────────────────────────────────────────────

export type AssignmentStatus = "assigned" | "accepted" | "in_progress" | "completed" | "cancelled";

export interface Assignment {
  _id: string; requestId: string; requestDescription?: string;
  volunteerId: string; volunteerName?: string;
  assignedBy: string; assignedByName?: string;
  location: string; status: AssignmentStatus;
  notes?: string; assignedAt: string; completedAt?: string;
  createdAt: string; updatedAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> { success: boolean; message: string; data?: T; errors?: string[]; }
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: { page: number; limit: number; total: number; totalPages: number; };
}
