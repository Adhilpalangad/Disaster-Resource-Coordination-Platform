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

const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  // New lifecycle
  pending:             { color: "#D97706", bg: "rgba(217,119,6,0.12)" },
  location_routed:     { color: "#0284C7", bg: "rgba(2,132,199,0.12)" },
  ngo_assigned:        { color: "#0284C7", bg: "rgba(2,132,199,0.12)" },
  ngo_accepted:        { color: "#0369A1", bg: "rgba(3,105,161,0.12)" },
  verified:            { color: "#059669", bg: "rgba(5,150,105,0.12)" },
  resources_reserved:  { color: "#065F46", bg: "rgba(6,95,70,0.12)"  },
  volunteer_assigned:  { color: "#7C3AED", bg: "rgba(124,58,237,0.12)"},
  in_transit:          { color: "#9333EA", bg: "rgba(147,51,234,0.12)"},
  delivered:           { color: "#16A34A", bg: "rgba(22,163,74,0.12)" },
  completed:           { color: "#059669", bg: "rgba(5,150,105,0.12)" },
  rejected:            { color: "#DC2626", bg: "rgba(220,38,38,0.12)" },
  escalated:           { color: "#EA580C", bg: "rgba(234,88,12,0.12)" },
  closed:              { color: "#64748B", bg: "rgba(100,116,139,0.12)"},
  // Legacy
  pending_verification:{ color: "#D97706", bg: "rgba(217,119,6,0.12)" },
  assigned:            { color: "#0284C7", bg: "rgba(2,132,199,0.12)" },
  in_progress:         { color: "#7C3AED", bg: "rgba(124,58,237,0.12)"},
  resolved:            { color: "#059669", bg: "rgba(5,150,105,0.12)" },
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
  const config = STATUS_CONFIG[key] ?? { color: "#475569", bg: "rgba(71,85,105,0.1)" };
  const text   = label ?? STATUS_LABEL[key] ?? key.replace(/_/g, " ").toUpperCase();

  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "3px 10px", borderRadius: "6px",
        fontSize: "11px", fontWeight: 700,
        backgroundColor: config.bg, color: config.color,
        letterSpacing: "0.4px", textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: config.color, marginRight: "5px", flexShrink: 0 }} />
      {text}
    </span>
  );
};

export default StatusBadge;
