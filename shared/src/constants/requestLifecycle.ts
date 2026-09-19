// Request Lifecycle Business Rules & Workflow Constants

import type { RequestStatus } from "../types/index.js";

/**
 * Sequential request lifecycle timeline steps
 */
export const ORDERED_REQUEST_STATUSES: RequestStatus[] = [
  "pending",
  "location_routed",
  "ngo_assigned",
  "ngo_accepted",
  "verified",
  "resources_reserved",
  "volunteer_assigned",
  "in_transit",
  "delivered",
  "completed",
];

/**
 * Status groupings for UI filter tabs and queries
 */
export const STATUS_GROUPS: Record<"pending" | "active" | "completed" | "cancelled" | "terminal", RequestStatus[]> = {
  pending: ["pending", "pending_verification", "location_routed"],
  active: [
    "ngo_assigned",
    "ngo_accepted",
    "verified",
    "resources_reserved",
    "volunteer_assigned",
    "assigned",
    "in_progress",
    "in_transit",
    "delivered",
  ],
  completed: ["completed", "resolved"],
  cancelled: ["rejected", "closed", "duplicate_detected"],
  terminal: ["completed", "resolved", "rejected", "closed", "duplicate_detected"],
};

/**
 * Statuses from which a user/citizen can safely delete a request
 */
export const DELETEABLE_STATUSES: RequestStatus[] = [
  "pending",
  "pending_verification",
  "location_routed",
];

/**
 * Human-readable status labels
 */
export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Pending",
  pending_verification: "Pending Verification",
  location_routed: "Location Routed",
  ngo_assigned: "NGO Assigned",
  ngo_accepted: "NGO Accepted",
  verified: "Verified",
  resources_reserved: "Resources Reserved",
  volunteer_assigned: "Volunteer Assigned",
  assigned: "Assigned",
  in_progress: "In Progress",
  in_transit: "In Transit",
  delivered: "Delivered",
  completed: "Completed",
  resolved: "Resolved",
  rejected: "Rejected",
  escalated: "Escalated",
  closed: "Closed",
  duplicate_detected: "Duplicate Detected",
};

/**
 * Color semantic mappings for status badges
 */
export const STATUS_COLORS: Record<RequestStatus, { bg: string; color: string; border: string }> = {
  pending: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  pending_verification: { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  location_routed: { bg: "#e0f2fe", color: "#075985", border: "#bae6fd" },
  ngo_assigned: { bg: "#e0e7ff", color: "#3730a3", border: "#c7d2fe" },
  ngo_accepted: { bg: "#e0e7ff", color: "#3730a3", border: "#c7d2fe" },
  verified: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  resources_reserved: { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  volunteer_assigned: { bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" },
  assigned: { bg: "#f3e8ff", color: "#6b21a8", border: "#e9d5ff" },
  in_progress: { bg: "#ffedd5", color: "#9a3412", border: "#fed7aa" },
  in_transit: { bg: "#ffedd5", color: "#9a3412", border: "#fed7aa" },
  delivered: { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
  completed: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  resolved: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  rejected: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" },
  escalated: { bg: "#fae8ff", color: "#86198f", border: "#f5d0fe" },
  closed: { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" },
  duplicate_detected: { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
};

/**
 * Check if request is in terminal state
 */
export function isTerminalStatus(status: RequestStatus): boolean {
  return STATUS_GROUPS.terminal.includes(status);
}

/**
 * Check if request can be deleted by owner
 */
export function canDeleteRequest(status: RequestStatus): boolean {
  return DELETEABLE_STATUSES.includes(status);
}
