// Re-export all shared domain types from @disaster-platform/shared
export * from "@disaster-platform/shared";

import type { NGOProfileData } from "@disaster-platform/shared";

// Client-side alias for compatibility
export type NGOProfile = NGOProfileData;

// ─── Client UI-specific Interfaces ────────────────────────────────────────────

export type ShelterStatus = "open" | "full" | "closed";

export interface Shelter {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  currentOccupancy: number;
  status: ShelterStatus;
  managedBy?: string;
  contactNumber?: string;
  availableResources: string[];
  createdAt: string;
  updatedAt: string;
}

export type InventoryCategory = "food" | "water" | "medicine" | "clothing" | "rescue_equipment" | "other";

export type AssignmentStatus = "assigned" | "accepted" | "in_progress" | "completed" | "cancelled";

export interface Assignment {
  _id: string;
  requestId: string;
  requestDescription?: string;
  volunteerId: string;
  volunteerName?: string;
  assignedBy: string;
  assignedByName?: string;
  location: string;
  status: AssignmentStatus;
  notes?: string;
  assignedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

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
