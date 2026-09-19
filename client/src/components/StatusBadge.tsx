import React from "react";

export type StatusType =
  | "pending" | "location_routed" | "ngo_assigned" | "ngo_accepted"
  | "verified" | "resources_reserved" | "volunteer_assigned"
  | "in_transit" | "delivered" | "completed"
  | "rejected" | "escalated" | "closed"
  // legacy
  | "pending_verification" | "assigned" | "in_progress" | "resolved"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  style?: React.CSSProperties;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  // New lifecycle
  pending:             { color: "#d97706", bg: "rgba(217, 119, 6, 0.1)", border: "rgba(217, 119, 6, 0.25)" },
  location_routed:     { color: "#0284c7", bg: "rgba(2, 132, 199, 0.1)", border: "rgba(2, 132, 199, 0.25)" },
  ngo_assigned:        { color: "#0284c7", bg: "rgba(2, 132, 199, 0.1)", border: "rgba(2, 132, 199, 0.25)" },
  ngo_accepted:        { color: "#0369a1", bg: "rgba(3, 105, 161, 0.1)", border: "rgba(3, 105, 161, 0.25)" },
  verified:            { color: "#059669", bg: "rgba(5, 150, 105, 0.1)", border: "rgba(5, 150, 105, 0.25)" },
  resources_reserved:  { color: "#065f46", bg: "rgba(6, 95, 70, 0.1)", border: "rgba(6, 95, 70, 0.25)"  },
  volunteer_assigned:  { color: "#7c3aed", bg: "rgba(124, 58, 237, 0.1)", border: "rgba(124, 58, 237, 0.25)"},
  in_transit:          { color: "#9333ea", bg: "rgba(147, 51, 234, 0.1)", border: "rgba(147, 51, 234, 0.25)"},
  delivered:           { color: "#16a34a", bg: "rgba(22, 163, 74, 0.1)", border: "rgba(22, 163, 74, 0.25)" },
  completed:           { color: "#059669", bg: "rgba(5, 150, 105, 0.1)", border: "rgba(5, 150, 105, 0.25)" },
  rejected:            { color: "#dc2626", bg: "rgba(220, 38, 38, 0.1)", border: "rgba(220, 38, 38, 0.25)" },
  escalated:           { color: "#ea580c", bg: "rgba(234, 88, 12, 0.1)", border: "rgba(234, 88, 12, 0.25)" },
  closed:              { color: "#64748b", bg: "rgba(100, 116, 139, 0.1)", border: "rgba(100, 116, 139, 0.25)"},
  // Legacy
  pending_verification:{ color: "#d97706", bg: "rgba(217, 119, 6, 0.1)", border: "rgba(217, 119, 6, 0.25)" },
  assigned:            { color: "#0284c7", bg: "rgba(2, 132, 199, 0.1)", border: "rgba(2, 132, 199, 0.25)" },
  in_progress:         { color: "#7c3aed", bg: "rgba(124, 58, 237, 0.1)", border: "rgba(124, 58, 237, 0.25)"},
  resolved:            { color: "#059669", bg: "rgba(5, 150, 105, 0.1)", border: "rgba(5, 150, 105, 0.25)" },
};

const STATUS_LABEL: Record<string, string> = {
  pending:             "Pending",
  location_routed:     "Routing…",
  ngo_assigned:        "NGO Assigned",
  ngo_accepted:        "NGO Accepted",
  verified:            "Verified",
  resources_reserved:  "Resources Reserved",
  volunteer_assigned:  "Volunteer Assigned",
  in_transit:          "In Transit",
  delivered:           "Delivered",
  completed:           "Completed",
  rejected:            "Rejected",
  escalated:           "Escalated",
  closed:              "Closed",
  // Legacy
  pending_verification:"Pending Review",
  assigned:            "Assigned",
  in_progress:         "In Progress",
  resolved:            "Resolved",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, style = {} }) => {
  const key    = status?.toLowerCase() ?? "";
  const config = STATUS_CONFIG[key] ?? { color: "var(--secondary)", bg: "var(--accent-bg)", border: "var(--border)" };
  const text   = label ?? STATUS_LABEL[key] ?? key.replace(/_/g, " ").toUpperCase();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "99px",
        fontSize: "11.5px",
        fontWeight: 700,
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: config.color, marginRight: "6px", flexShrink: 0 }} />
      {text}
    </span>
  );
};

export default StatusBadge;
