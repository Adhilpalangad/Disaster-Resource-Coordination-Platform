// ─── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = "citizen" | "ngo" | "volunteer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  organizationName?: string; // for NGO accounts
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
}

// ─── Disaster ─────────────────────────────────────────────────────────────────

export type DisasterType =
  | "flood"
  | "earthquake"
  | "cyclone"
  | "landslide"
  | "fire"
  | "tsunami"
  | "other";

export type DisasterStatus = "active" | "monitoring" | "resolved";

export type SeverityLevel = "low" | "moderate" | "high" | "critical";

export interface Disaster {
  _id: string;
  title: string;
  type: DisasterType;
  severity: SeverityLevel;
  status: DisasterStatus;
  location: string;
  description: string;
  createdBy: string;
  affectedArea?: string;
  startedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Relief Request ───────────────────────────────────────────────────────────

export type RequestCategory =
  | "food"
  | "water"
  | "medical"
  | "shelter"
  | "clothing"
  | "rescue"
  | "other";

export type RequestStatus =
  | "pending_verification"
  | "verified"
  | "rejected"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export interface ReliefRequest {
  _id: string;
  disasterId: string;
  disasterTitle?: string;
  createdBy: string;
  createdByName?: string;
  category: RequestCategory;
  description: string;
  urgency: UrgencyLevel;
  location: string;
  contactNumber?: string;
  imageUrl?: string;
  status: RequestStatus;
  verificationNote?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Shelter ──────────────────────────────────────────────────────────────────

export type ShelterStatus = "open" | "full" | "closed";

export interface Shelter {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: ShelterStatus;
  managedBy?: string; // NGO id
  contactNumber?: string;
  availableResources: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export type InventoryCategory =
  | "food"
  | "water"
  | "medicine"
  | "clothing"
  | "rescue_equipment"
  | "other";

export interface InventoryItem {
  _id: string;
  ngoId: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  location?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Assignment (Volunteer Task) ──────────────────────────────────────────────

export type AssignmentStatus =
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Assignment {
  _id: string;
  requestId: string;
  requestDescription?: string;
  volunteerId: string;
  volunteerName?: string;
  assignedBy: string; // NGO id
  assignedByName?: string;
  location: string;
  status: AssignmentStatus;
  notes?: string;
  assignedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
