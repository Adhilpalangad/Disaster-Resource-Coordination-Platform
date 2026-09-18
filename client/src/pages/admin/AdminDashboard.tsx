import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  AlertTriangle,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Activity,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";
import { dashboardApi, type DashboardStatsData } from "../../services/dashboardApi.js";

const PENDING_NGOS = [
  { name: "Malabar Relief Trust", contact: "admin@malabarrelief.org", submittedAt: "Today, 09:12 AM" },
  { name: "Thrissur Volunteer Network", contact: "info@tvn.org.in", submittedAt: "Yesterday, 4:30 PM" },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const KPI = [
    {
      label: "Total Users",
      value: stats ? stats.users.total.toLocaleString() : "...",
      delta: stats ? `${stats.users.citizens} Citizens / ${stats.users.admins} Admins` : "Loading...",
      up: true,
      icon: <Users size={20} />,
      iconBg: "rgba(2,132,199,0.1)",
      iconColor: "var(--primary)",
    },
    {
      label: "Verified NGOs",
      value: stats ? stats.ngos.active.toLocaleString() : "...",
      delta: stats ? `${stats.ngos.total} Total Registered` : "Loading...",
      up: null,
      icon: <Building2 size={20} />,
      iconBg: "rgba(5,150,105,0.1)",
      iconColor: "var(--success)",
    },
    {
      label: "Active Disasters",
      value: stats ? stats.disasters.active.toLocaleString() : "...",
      delta: stats ? `${stats.disasters.critical} critical severity` : "Loading...",
      up: false,
      icon: <AlertTriangle size={20} />,
      iconBg: "rgba(239,68,68,0.1)",
      iconColor: "var(--danger)",
    },
    {
      label: "Active Volunteers",
      value: stats ? stats.users.volunteers.toLocaleString() : "...",
      delta: stats ? `${stats.requests.total} Relief Requests` : "Loading...",
      up: true,
      icon: <UserCheck size={20} />,
      iconBg: "rgba(245,158,11,0.1)",
      iconColor: "var(--warning)",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Admin Control Centre"
        description="Platform-wide oversight — users, NGOs, disasters, and system health."
        actions={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={loadStats}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-h)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <Link
              to="/admin/disasters"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 18px",
                borderRadius: "10px",
                backgroundColor: "var(--danger)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              <AlertTriangle size={14} /> Declare Disaster
            </Link>
          </div>
        }
      />

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: "14px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {KPI.map((k) => (
          <div
            key={k.label}
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              padding: "20px",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: k.iconBg,
                color: k.iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {k.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                {k.label}
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "var(--text-h)",
                  lineHeight: 1.2,
                  margin: "4px 0",
                }}
              >
                {k.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                {k.up !== null && <TrendingUp size={11} style={{ color: k.up ? "var(--success)" : "var(--danger)" }} />}
                <span style={{ color: k.up === true ? "var(--success)" : k.up === false ? "var(--danger)" : "var(--secondary)" }}>
                  {k.delta}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
        {/* Activity Log */}
        <Card
          title="Recent Platform Activity"
          action={
            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>
              <Activity size={13} /> Live
            </span>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {stats && stats.activity && stats.activity.length > 0 ? (
              stats.activity.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px 0",
                    borderBottom: i < stats.activity.length - 1 ? "1px solid var(--border)" : "none",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor:
                        item.status === "completed" || item.status === "verified" ? "var(--success)" :
                        item.status === "pending" ? "var(--warning)" : "var(--danger)",
                      marginTop: "5px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", fontWeight: 500 }}>{item.message}</p>
                    <span style={{ fontSize: "11px", color: "var(--secondary)" }}>{item.time}</span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--secondary)", fontSize: "13px" }}>
                {loading ? "Loading live activity..." : "No recent platform activity recorded yet."}
              </div>
            )}
          </div>
        </Card>

        {/* NGO Verification Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card
            title="Pending NGO Verifications"
            action={
              <Link to="/admin/ngos" style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                All NGOs <ArrowRight size={14} />
              </Link>
            }
          >
            {PENDING_NGOS.map((ngo) => (
              <div
                key={ngo.name}
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  marginBottom: "10px",
                  backgroundColor: "var(--bg)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-h)" }}>{ngo.name}</div>
                    <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>{ngo.contact}</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>Submitted: {ngo.submittedAt}</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button
                      style={{
                        padding: "6px 12px",
                        borderRadius: "7px",
                        backgroundColor: "rgba(5,150,105,0.1)",
                        color: "var(--success)",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ShieldCheck size={13} /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Card>

          {/* Quick Links */}
          <Card title="Admin Quick Links">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { to: "/admin/users", label: "Manage Users", icon: <Users size={14} /> },
                { to: "/admin/ngos", label: "Manage NGOs", icon: <Building2 size={14} /> },
                { to: "/admin/disasters", label: "Disasters", icon: <AlertTriangle size={14} /> },
                { to: "/admin/analytics", label: "Analytics", icon: <TrendingUp size={14} /> },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--bg)",
                    color: "var(--text-h)",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: 500,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)";
                  }}
                >
                  <span style={{ color: "var(--primary)" }}>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminDashboard;
