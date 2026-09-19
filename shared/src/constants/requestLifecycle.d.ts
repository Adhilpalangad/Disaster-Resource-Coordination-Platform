import type { RequestStatus } from "../types/index.js";
/**
 * Sequential request lifecycle timeline steps
 */
export declare const ORDERED_REQUEST_STATUSES: RequestStatus[];
/**
 * Status groupings for UI filter tabs and queries
 */
export declare const STATUS_GROUPS: Record<"pending" | "active" | "completed" | "cancelled" | "terminal", RequestStatus[]>;
/**
 * Statuses from which a user/citizen can safely delete a request
 */
export declare const DELETEABLE_STATUSES: RequestStatus[];
/**
 * Human-readable status labels
 */
export declare const STATUS_LABELS: Record<RequestStatus, string>;
/**
 * Color semantic mappings for status badges
 */
export declare const STATUS_COLORS: Record<RequestStatus, {
    bg: string;
    color: string;
    border: string;
}>;
/**
 * Check if request is in terminal state
 */
export declare function isTerminalStatus(status: RequestStatus): boolean;
/**
 * Check if request can be deleted by owner
 */
export declare function canDeleteRequest(status: RequestStatus): boolean;
//# sourceMappingURL=requestLifecycle.d.ts.map