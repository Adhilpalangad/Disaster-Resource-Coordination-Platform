import React from "react";
import type { ReliefRequest } from "@disaster-platform/shared";
import { StatusBadge } from "../StatusBadge.js";
import { MapPin, Users, Calendar, ArrowRight, Trash2 } from "lucide-react";

interface RequestCardProps {
  request: ReliefRequest;
  onViewDetails?: (id: string) => void;
  onDelete?: (id: string, status: string) => void;
  canDelete?: boolean;
  extraActions?: React.ReactNode;
}

const URGENCY_STYLES: Record<string, { bg: string; color: string }> = {
  critical: { bg: "#fee2e2", color: "#991b1b" },
  high:     { bg: "#ffedd5", color: "#9a3412" },
  medium:   { bg: "#fef3c7", color: "#92400e" },
  low:      { bg: "#f3f4f6", color: "#374151" },
};

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onViewDetails,
  onDelete,
  canDelete = false,
  extraActions,
}) => {
  const urgencyStyle = URGENCY_STYLES[request.urgency?.toLowerCase()] ?? URGENCY_STYLES.medium;
  const createdDate = request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "";

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-surface, #ffffff)",
        border: "1px solid var(--color-border, #e2e8f0)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
            <span
              style={{
                textTransform: "uppercase",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                color: "var(--color-primary, #2563eb)",
                backgroundColor: "rgba(37,99,235,0.08)",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              {request.category}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: urgencyStyle.bg,
                color: urgencyStyle.color,
              }}
            >
              {request.urgency} Urgency
            </span>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text, #0f172a)", margin: 0 }}>
            {request.fullName}
          </h3>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Description */}
      <p style={{ fontSize: "14px", color: "var(--color-text-muted, #475569)", margin: 0, lineClamp: 2, WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {request.description}
      </p>

      {/* Metadata grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "var(--color-text-muted, #64748b)" }}>
        {request.location && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={14} />
            <span>
              {request.location.localBodyName ?? request.location.districtName ?? "Kerala"}
            </span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Users size={14} />
          <span>{request.peopleAffected} affected</span>
        </div>
        {createdDate && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={14} />
            <span>{createdDate}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--color-border-subtle, #f1f5f9)" }}>
        <div>
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(request._id, request.status)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "13px",
                color: "#dc2626",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {extraActions}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(request._id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                fontSize: "13px",
                fontWeight: 600,
                borderRadius: "6px",
                backgroundColor: "var(--color-primary, #2563eb)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Details <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
