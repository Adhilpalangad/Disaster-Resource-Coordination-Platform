import React from "react";

export type StatusType =
  | "pending"
  | "verified"
  | "rejected"
  | "in_progress"
  | "completed"
  | "closed"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  style = {},
}) => {
  const normalized = status.toLowerCase().replace(" ", "_");

  let color = "#475569";
  let bg = "rgba(71, 85, 105, 0.1)";

  switch (normalized) {
    case "pending":
      color = "#F59E0B";
      bg = "rgba(245, 158, 11, 0.12)";
      break;
    case "verified":
    case "completed":
      color = "#22C55E";
      bg = "rgba(34, 197, 94, 0.12)";
      break;
    case "rejected":
      color = "#EF4444";
      bg = "rgba(239, 68, 68, 0.12)";
      break;
    case "in_progress":
      color = "#0284C7";
      bg = "rgba(2, 132, 199, 0.12)";
      break;
    case "closed":
      color = "#64748B";
      bg = "rgba(100, 116, 139, 0.12)";
      break;
  }

  const displayText = label || status.replace("_", " ").toUpperCase();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        ...style,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: color,
          marginRight: "6px",
        }}
      />
      {displayText}
    </span>
  );
};

export default StatusBadge;
