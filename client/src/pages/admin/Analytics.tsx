import React, { useState, useEffect } from "react";
import { BarChart2, Users, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import { dashboardApi, type DashboardStatsData } from "../../services/dashboardApi.js";

export const Analytics: React.FC = () => {
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
      setError(err instanceof Error ? err.message : "Failed to load analytics metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="System Analytics"
        description="Platform usage metrics, response time benchmarking, and regional disaster heatmaps."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Analytics" }]}
        actions={
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
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Analytics
          </button>
        }
      />

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: "14px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Analytics Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(2,132,199,0.1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600 }}>Total Registered Users</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)" }}>
                {stats ? stats.users.total : "..."}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600 }}>Active Disasters</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)" }}>
                {stats ? stats.disasters.active : "..."}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(5,150,105,0.1)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600 }}>Fulfilled / Active Requests</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)" }}>
                {stats ? `${stats.requests.completed} / ${stats.requests.total}` : "..."}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(245,158,11,0.1)", color: "var(--warning)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 600 }}>Emergency Shelters</div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)" }}>
                {stats ? `${stats.shelters.total} (${stats.shelters.occupancy}/${stats.shelters.capacity})` : "..."}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="System Metrics & Benchmarking">
        <div style={{ padding: "12px 0", fontSize: "14px", color: "var(--text-h)" }}>
          <p style={{ margin: "0 0 16px 0", color: "var(--secondary)" }}>
            Platform metrics compiled from live database collections (Citizens, Volunteers, NGOs, Disasters, Relief Requests, and Shelters).
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", backgroundColor: "var(--bg)" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700, color: "var(--text-h)" }}>User Demographic Distribution</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", lineHeight: "1.8" }}>
                <li>👥 Citizens: <strong>{stats?.users.citizens ?? 0}</strong></li>
                <li>🤝 Volunteers: <strong>{stats?.users.volunteers ?? 0}</strong></li>
                <li>🏢 NGO Representatives: <strong>{stats?.users.ngos ?? 0}</strong></li>
                <li>🛡️ Administrators: <strong>{stats?.users.admins ?? 0}</strong></li>
              </ul>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", backgroundColor: "var(--bg)" }}>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700, color: "var(--text-h)" }}>Resource & Shelter Occupancy</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "13px", lineHeight: "1.8" }}>
                <li>🏠 Total Shelters Registered: <strong>{stats?.shelters.total ?? 0}</strong></li>
                <li>🛏️ Total Shelter Capacity: <strong>{stats?.shelters.capacity ?? 0}</strong></li>
                <li>👥 Current Shelter Occupancy: <strong>{stats?.shelters.occupancy ?? 0}</strong></li>
                <li>📦 Total Inventory Items Audited: <strong>{stats?.inventory.totalItems ?? 0}</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Analytics;
