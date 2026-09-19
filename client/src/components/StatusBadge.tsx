import React from "react";
import { STATUS_LABELS, STATUS_COLORS } from "@disaster-platform/shared";
import type { RequestStatus } from "@disaster-platform/shared";

export type StatusType = RequestStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  style?: React.CSSProperties;
}

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
