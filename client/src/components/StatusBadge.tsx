import React from "react";
import { STATUS_LABELS, STATUS_COLORS } from "@disaster-platform/shared";
import type { RequestStatus } from "@disaster-platform/shared";

export type StatusType = RequestStatus | string;

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
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, style = {} }) => {
  const key = (status?.toLowerCase() ?? "") as RequestStatus;
  const config = STATUS_COLORS[key] ?? { color: "#475569", bg: "rgba(71,85,105,0.1)", border: "#e2e8f0" };
  const text = label ?? STATUS_LABELS[key] ?? (status ? status.replace(/_/g, " ").toUpperCase() : "UNKNOWN");

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "11px",
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
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: config.color,
          marginRight: "5px",
          flexShrink: 0,
        }}
      />
      {text}
    </span>
  );
};

export default StatusBadge;
