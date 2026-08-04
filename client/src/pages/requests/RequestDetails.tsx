import React from "react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import { useParams } from "react-router-dom";
import { MapPin, User, Clock, ShieldCheck, Truck } from "lucide-react";

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const requestId = id || "REQ-8492";

  return (
    <PageContainer>
      <PageHeader
        title={`Relief Request #${requestId}`}
        description="Detailed record, verification status history, assigned NGO, and fulfillment tracker."
        breadcrumbs={[
          { label: "Overview", path: "/dashboard" },
          { label: "Relief Requests", path: "/requests" },
          { label: requestId },
        ]}
        actions={<StatusBadge status="verified" label="Verified Request" />}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Request Overview */}
        <Card title="Request Details">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Category</span>
              <p style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>Food & Clean Drinking Water</p>
            </div>

            <div>
              <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Urgency Level</span>
              <div style={{ marginTop: "4px" }}>
                <StatusBadge status="rejected" label="High Priority" />
              </div>
            </div>

            <div>
              <span style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase" }}>Description</span>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--text-h)", lineHeight: 1.5 }}>
                12 families stranded in community hall require immediate ready-to-eat food packets and clean drinking water cans. Ground access partially clear.
              </p>
            </div>

            <div style={{ display: "flex", gap: "20px", fontSize: "13px", color: "var(--secondary)", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={16} /> 11.2588, 75.7804 (Sector 4)
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <User size={16} /> Citizen Reporter: Alex M.
              </div>
            </div>
          </div>
        </Card>

        {/* Fulfillment Timeline */}
        <Card title="Operational Workflow Progress">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ padding: "8px", borderRadius: "50%", backgroundColor: "rgba(34, 197, 94, 0.12)", color: "var(--success)" }}>
                <Clock size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>Request Logged</h4>
                <span style={{ fontSize: "12px", color: "var(--secondary)" }}>Today at 10:14 AM by Alex M.</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ padding: "8px", borderRadius: "50%", backgroundColor: "rgba(34, 197, 94, 0.12)", color: "var(--success)" }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>Verified by Red Cross NGO</h4>
                <span style={{ fontSize: "12px", color: "var(--secondary)" }}>Today at 10:30 AM by Inspector R. Kumar</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <div style={{ padding: "8px", borderRadius: "50%", backgroundColor: "rgba(2, 132, 199, 0.12)", color: "var(--primary)" }}>
                <Truck size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>Volunteer Dispatched</h4>
                <span style={{ fontSize: "12px", color: "var(--secondary)" }}>Volunteer Alpha assigned • ETA 25 mins</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default RequestDetails;
