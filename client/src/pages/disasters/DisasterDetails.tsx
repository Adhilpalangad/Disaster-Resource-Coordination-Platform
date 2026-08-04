import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import { useParams, Link } from "react-router-dom";

export const DisasterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const campaignId = id || "disaster-2026-1";

  return (
    <PageContainer>
      <PageHeader
        title={`Kerala Flood Relief Campaign 2026 (${campaignId})`}
        description="Live operational command metrics, active relief centers, linked shelters, and request queue."
        breadcrumbs={[
          { label: "Overview", path: "/dashboard" },
          { label: "Disasters", path: "/disasters" },
          { label: campaignId },
        ]}
        actions={<StatusBadge status="verified" label="Active Response" />}
      />

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Affected Area</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700 }}>Wayanad & Calicut</h3>
        </Card>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Citizens Affected</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: "var(--danger)" }}>15,400</h3>
        </Card>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Linked Shelters</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: "var(--success)" }}>8 Active</h3>
        </Card>
        <Card>
          <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Open Requests</span>
          <h3 style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: 700, color: "var(--warning)" }}>42 Pending</h3>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
        <Card title="Campaign Overview & Scope">
          <p style={{ fontSize: "14px", color: "var(--text-h)", lineHeight: 1.6, margin: "0 0 16px" }}>
            Heavy monsoon rain has triggered flash floods and localized landslides across Wayanad sectors. Emergency relief efforts are underway to provide clean drinking water, ready-to-eat meal packs, emergency medical supplies, and temporary shelter.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link to="/requests/create" style={{ backgroundColor: "var(--primary)", color: "white", padding: "10px 16px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
              + Submit Needs for this Disaster
            </Link>
            <Link to="/requests" style={{ border: "1px solid var(--border)", color: "var(--text-h)", padding: "10px 16px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
              View All Requests Feed
            </Link>
          </div>
        </Card>

        <Card title="Operational Command Summary">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", color: "var(--secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Primary Coordinating NGO:</span>
              <strong style={{ color: "var(--text-h)" }}>Red Cross Disaster Operations</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
              <span>Deployed Volunteers:</span>
              <strong style={{ color: "var(--text-h)" }}>85 Active Personnel</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Last Status Update:</span>
              <strong style={{ color: "var(--text-h)" }}>Today, 11:30 AM</strong>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default DisasterDetails;
