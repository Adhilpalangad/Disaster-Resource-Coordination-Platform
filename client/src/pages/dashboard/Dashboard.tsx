import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, FileText, Home, Users, ArrowRight, PlusCircle, Clock, TrendingUp } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import { useAuth } from "../../context/AuthContext.js";

const recentRequests = [
  { id: "REQ-8492", category: "Food & Water", location: "Sector 4 Community Hall", urgency: "high", status: "in_progress" },
  { id: "REQ-8510", category: "Medical Supplies", location: "Relief Camp 2, Calicut", urgency: "medium", status: "pending" },
  { id: "REQ-8410", category: "Emergency Shelter", location: "Town Center School", urgency: "high", status: "completed" },
];

const KPI_CARDS = [
  {
    label: "Active Disasters",
    value: "3",
    icon: <AlertTriangle size={20} />,
    iconBg: "rgba(239,68,68,0.1)",
    iconColor: "var(--danger)",
    trend: "1 new today",
    trendUp: false,
  },
  {
    label: "My Requests",
    value: "5",
    icon: <FileText size={20} />,
    iconBg: "rgba(245,158,11,0.1)",
    iconColor: "var(--warning)",
    trend: "2 pending",
    trendUp: null,
  },
  {
    label: "Nearest Shelter",
    value: "2.4 km",
    icon: <Home size={20} />,
    iconBg: "rgba(5,150,105,0.1)",
    iconColor: "var(--success)",
    trend: "78% occupied",
    trendUp: null,
  },
  {
    label: "Volunteers Deployed",
    value: "150",
    icon: <Users size={20} />,
    iconBg: "rgba(2,132,199,0.1)",
    iconColor: "var(--primary)",
    trend: "+12 this week",
    trendUp: true,
  },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <PageContainer>
      {/* Active Disaster Alert Banner */}
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
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", fontWeight: 500 }}>
          <strong>Active:</strong> Wayanad Flood Relief Operation 2025 — Relief operations ongoing in Mananthavady, Vythiri, and Kalpetta.
        </p>
        <Link to="/disasters" style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: "var(--danger)", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
          View <ArrowRight size={12} />
        </Link>
      </div>

      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Here's the latest summary of ongoing relief operations and your requests."
        actions={
          <Link
            to="/requests/create"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "10px",
              backgroundColor: "var(--primary)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "13px",
              textDecoration: "none",
            }}
          >
            <PlusCircle size={15} /> Submit Request
          </Link>
        }
      />

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        marginBottom: "28px",
      }}>
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              padding: "20px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: kpi.iconBg,
              color: kpi.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {kpi.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-h)", lineHeight: 1.2, margin: "4px 0" }}>
                {kpi.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--secondary)" }}>
                {kpi.trendUp !== null && (
                  <TrendingUp size={12} style={{ color: kpi.trendUp ? "var(--success)" : "var(--danger)" }} />
                )}
                {kpi.trendUp !== null ? (
                  <span style={{ color: kpi.trendUp ? "var(--success)" : "var(--danger)" }}>{kpi.trend}</span>
                ) : (
                  <span>{kpi.trend}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>

        {/* Requests Table */}
        <Card
          title="My Relief Requests"
          action={
            <Link to="/requests" style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "var(--secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>ID</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "var(--secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Category</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "var(--secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Location</th>
                  <th style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "var(--secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 10px" }}>
                      <Link to={`/requests/${req.id}`} style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none", fontSize: "13px" }}>
                        {req.id}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--text-h)", fontWeight: 500 }}>{req.category}</td>
                    <td style={{ padding: "12px 10px", color: "var(--secondary)", fontSize: "12px" }}>{req.location}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              {
                to: "/requests/create",
                icon: <PlusCircle size={18} />,
                title: "Submit a Relief Request",
                desc: "Report food, water, medical, or shelter needs",
                color: "var(--primary)",
                colorBg: "rgba(2,132,199,0.08)",
              },
              {
                to: "/disasters",
                icon: <AlertTriangle size={18} />,
                title: "View Active Disasters",
                desc: "See ongoing operations and affected areas",
                color: "var(--danger)",
                colorBg: "rgba(239,68,68,0.08)",
              },
              {
                to: "/shelters",
                icon: <Home size={18} />,
                title: "Find Nearest Shelter",
                desc: "Locate relief centres with available capacity",
                color: "var(--success)",
                colorBg: "rgba(5,150,105,0.08)",
              },
              {
                to: "/notifications",
                icon: <Clock size={18} />,
                title: "Check Notifications",
                desc: "Updates on your submitted requests",
                color: "var(--warning)",
                colorBg: "rgba(245,158,11,0.08)",
              },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  textDecoration: "none",
                  backgroundColor: "var(--bg)",
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = action.color;
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = action.colorBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--bg)";
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  backgroundColor: action.colorBg,
                  color: action.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {action.icon}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>{action.title}</div>
                  <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>{action.desc}</div>
                </div>
                <ArrowRight size={14} style={{ color: "var(--secondary)", marginLeft: "auto", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </Card>

      </div>
    </PageContainer>
  );
};

export default Dashboard;
