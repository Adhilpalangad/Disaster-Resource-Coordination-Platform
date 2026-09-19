import React, { useEffect, useState } from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import { useParams, Link } from "react-router-dom";
import { MapPin, AlertTriangle, Calendar, FileText } from "lucide-react";
import { disastersApi } from "../../services/disastersApi.js";
import type { Disaster } from "../../types/index.js";

const SEVERITY_COLOR: Record<string, string> = {
  low:      "var(--success)",
  moderate: "var(--warning)",
  high:     "orange",
  critical: "var(--danger)",
};

export const DisasterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    disastersApi.getById(id)
      .then(setDisaster)
      .catch(() => setError("Disaster not found or could not be loaded."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px 0" }}>
          {[1, 2].map(i => (
            <div key={i} style={{ height: "140px", backgroundColor: "var(--border)", borderRadius: "14px", opacity: 0.4 }} />
          ))}
        </div>
      </PageContainer>
    );
  }

  // ── Error / Not Found state ─────────────────────────────────────────────────
  if (error || !disaster) {
    return (
      <PageContainer>
        <PageHeader
          title="Disaster Not Found"
          description="This disaster record may have been removed or does not exist."
          breadcrumbs={[
            { label: "Overview", path: "/dashboard" },
            { label: "Disasters", path: "/disasters" },
            { label: "Not Found" },
          ]}
        />
        <div style={{
          padding: "20px", borderRadius: "10px",
          backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)",
          color: "var(--danger)", fontSize: "14px", marginBottom: "20px",
        }}>
          {error || "Disaster record not found."}
        </div>
        <Link
          to="/disasters"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "8px",
            backgroundColor: "var(--primary)", color: "#fff",
            textDecoration: "none", fontWeight: 600, fontSize: "14px",
          }}
        >
          ← Back to Disasters
        </Link>
      </PageContainer>
    );
  }

  const statusLabel =
    disaster.status === "active"    ? "Active Response" :
    disaster.status === "monitoring" ? "Monitoring"     : "Resolved";

  const statusBadgeStatus =
    disaster.status === "active"    ? "verified" :
    disaster.status === "monitoring" ? "pending"  : "resolved";

  const startedDate = new Date(disaster.startedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <PageContainer>
      <PageHeader
        title={disaster.title}
        description={`${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)} · ${disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)} Severity · Started ${startedDate}`}
        breadcrumbs={[
          { label: "Overview", path: "/dashboard" },
          { label: "Disasters", path: "/disasters" },
          { label: disaster.title },
        ]}
        actions={<StatusBadge status={statusBadgeStatus} label={statusLabel} />}
      />

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Type</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>
            {disaster.type}
          </h3>
        </Card>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Severity</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)", textTransform: "capitalize" }}>
            {disaster.severity}
          </h3>
        </Card>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Status</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)", textTransform: "capitalize" }}>
            {disaster.status}
          </h3>
        </Card>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Affected Districts</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: "var(--primary)" }}>
            {disaster.affectedDistrictNames.length > 0
              ? disaster.affectedDistrictNames.length
              : "0"}
          </h3>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>

        {/* Overview */}
        <Card title="Campaign Overview & Scope">
          {/* Meta info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", fontSize: "13px", color: "var(--secondary)" }}>
            {disaster.affectedDistrictNames.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <MapPin size={15} style={{ color: "var(--primary)", marginTop: "2px", flexShrink: 0 }} />
                <span>
                  <strong style={{ color: "var(--text-h)" }}>Affected Areas:</strong>{" "}
                  {disaster.affectedDistrictNames.join(", ")}
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <span><strong style={{ color: "var(--text-h)" }}>Started:</strong> {startedDate}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={15} style={{ color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)", flexShrink: 0 }} />
              <span>
                <strong style={{ color: "var(--text-h)" }}>Severity:</strong>{" "}
                <span style={{ color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)", fontWeight: 700, textTransform: "capitalize" }}>
                  {disaster.severity}
                </span>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "20px" }}>
            <FileText size={15} style={{ color: "var(--secondary)", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-h)", lineHeight: 1.65 }}>
              {disaster.description}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              to={`/requests/create`}
              style={{
                backgroundColor: "var(--primary)", color: "white",
                padding: "10px 16px", borderRadius: "8px",
                textDecoration: "none", fontSize: "14px", fontWeight: 600,
              }}
            >
              + Submit Needs for this Disaster
            </Link>
            <Link
              to="/requests"
              style={{
                border: "1px solid var(--border)", color: "var(--text-h)",
                padding: "10px 16px", borderRadius: "8px",
                textDecoration: "none", fontSize: "14px", fontWeight: 600,
              }}
            >
              View All Requests Feed
            </Link>
          </div>
        </Card>

        {/* Operational summary */}
        <Card title="Operational Details">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Disaster ID:</span>
              <code style={{ fontSize: "12px", color: "var(--text-h)" }}>{disaster._id}</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Type:</span>
              <strong style={{ color: "var(--text-h)", textTransform: "capitalize" }}>{disaster.type}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Status:</span>
              <strong style={{ color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)", textTransform: "capitalize" }}>{disaster.status}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Severity:</span>
              <strong style={{ color: SEVERITY_COLOR[disaster.severity] ?? "var(--warning)", textTransform: "capitalize" }}>{disaster.severity}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Districts Affected:</span>
              <strong style={{ color: "var(--text-h)" }}>
                {disaster.affectedDistrictNames.length > 0
                  ? disaster.affectedDistrictNames.join(", ")
                  : "Not specified"}
              </strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Started On:</span>
              <strong style={{ color: "var(--text-h)" }}>{startedDate}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Last Updated:</span>
              <strong style={{ color: "var(--text-h)" }}>
                {new Date(disaster.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </strong>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default DisasterDetails;
