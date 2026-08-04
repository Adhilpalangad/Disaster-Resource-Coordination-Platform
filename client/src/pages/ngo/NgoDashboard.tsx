import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  UserCheck,
  Package,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import EmptyState from "../../components/EmptyState.js";
import { useAuth } from "../../context/AuthContext.js";

const pendingRequests = [
  { id: "REQ-901", category: "Medical Supplies", urgency: "high" as const, location: "Sector 4 Camp", submittedAt: "10 min ago" },
  { id: "REQ-904", category: "Food & Water", urgency: "medium" as const, location: "Community Center B", submittedAt: "25 min ago" },
  { id: "REQ-909", category: "Emergency Shelter", urgency: "high" as const, location: "Hillside Road", submittedAt: "40 min ago" },
];

const URGENCY_COLOR: Record<string, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--success)",
};

const KPI = [
  { label: "Awaiting Verification", value: "14", color: "var(--warning)", icon: <Clock size={20} /> },
  { label: "Verified & Queued", value: "28", color: "var(--primary)", icon: <FileText size={20} /> },
  { label: "Volunteers Active", value: "42", color: "var(--success)", icon: <UserCheck size={20} /> },
  { label: "Low Stock Alerts", value: "3", color: "var(--danger)", icon: <Package size={20} /> },
];

export const NgoDashboard: React.FC = () => {
  const { user } = useAuth();
  const orgName = user?.organizationName ?? "Your Organisation";

  return (
    <PageContainer>
      {/* Active disaster callout */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "10px",
        backgroundColor: "rgba(239,68,68,0.07)",
        border: "1px solid rgba(239,68,68,0.2)",
        marginBottom: "24px",
      }}>
        <AlertTriangle size={16} style={{ color: "var(--danger)", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "var(--text-h)" }}>
          <strong>Active:</strong> Wayanad Flood Relief 2025 — 14 incoming requests require verification.
        </p>
        <Link to="/ngo/requests" style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: "var(--danger)", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
          Open Queue <ArrowRight size={12} />
        </Link>
      </div>

      <PageHeader
        title="NGO Operations Console"
        description={`Logged in as ${orgName}. Verify requests, dispatch volunteers, and track inventory.`}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              to="/inventory"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-h)",
                fontWeight: 600,
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              <Package size={14} /> Inventory
            </Link>
            <Link
              to="/assignments"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 16px",
                borderRadius: "10px",
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              <UserCheck size={14} /> Assign Volunteers
            </Link>
          </div>
        }
      />

      {/* KPI strip */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px",
        marginBottom: "24px",
      }}>
        {KPI.map((k) => (
          <div key={k.label} style={{
            backgroundColor: "var(--card-bg)",
            borderRadius: "12px",
            border: "1px solid var(--border)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: k.color.replace(")", ",0.1)").replace("var(--", "rgba(").replace("danger", "239,68,68").replace("warning", "245,158,11").replace("success", "5,150,105").replace("primary", "2,132,199"),
              color: k.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)", lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>

        {/* Verification queue */}
        <Card
          title="Pending Verification Queue"
          action={
            <Link to="/ngo/requests" style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 size={32} />}
                title="All caught up!"
                description="No requests pending verification right now."
              />
            ) : pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                }}
              >
                {/* Urgency dot */}
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: URGENCY_COLOR[req.urgency],
                  flexShrink: 0,
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)" }}>{req.id}</span>
                    <StatusBadge status="pending" label={req.urgency.toUpperCase()} />
                  </div>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--secondary)" }}>
                    {req.category} • {req.location} • {req.submittedAt}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    title="Verify"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "7px",
                      backgroundColor: "rgba(5,150,105,0.1)",
                      color: "var(--success)",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <CheckCircle2 size={13} /> Verify
                  </button>
                  <button
                    title="Reject"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      borderRadius: "7px",
                      backgroundColor: "rgba(239,68,68,0.1)",
                      color: "var(--danger)",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dispatch panel */}
        <Card title="Ready to Dispatch">
          <p style={{ fontSize: "13px", color: "var(--secondary)", marginBottom: "14px" }}>
            Verified requests waiting for a volunteer team to be assigned.
          </p>

          {[
            { reqId: "REQ-8492", task: "Food & Water Delivery", team: "Team Alpha", distance: "2.4 km" },
            { reqId: "REQ-8486", task: "Medicine & First Aid", team: "Team Bravo", distance: "4.1 km" },
          ].map((item) => (
            <div key={item.reqId} style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              marginBottom: "10px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)" }}>{item.reqId} — {item.task}</div>
                  <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "4px" }}>
                    {item.team} · {item.distance} away
                  </div>
                </div>
                <button style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  backgroundColor: "var(--primary)",
                  color: "#fff",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}>
                  Dispatch
                </button>
              </div>
            </div>
          ))}

          <Link
            to="/assignments"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px dashed var(--border)",
              color: "var(--secondary)",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 500,
              marginTop: "4px",
            }}
          >
            View All Assignments <ArrowRight size={14} />
          </Link>
        </Card>

      </div>
    </PageContainer>
  );
};

export default NgoDashboard;
