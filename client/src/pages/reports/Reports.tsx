import React, { useState, useEffect } from "react";
import { Download, CheckCircle2, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import { dashboardApi, type DashboardStatsData } from "../../services/dashboardApi.js";

export const Reports: React.FC = () => {
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
      setError(err instanceof Error ? err.message : "Failed to load operational report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleExportSummaryCSV = () => {
    if (!stats) return;
    const csvRows = [
      ["Metric Category", "Metric Name", "Value"],
      ["Users", "Total Users", stats.users.total],
      ["Users", "Citizens", stats.users.citizens],
      ["Users", "Volunteers", stats.users.volunteers],
      ["Users", "NGO Reps", stats.users.ngos],
      ["NGOs", "Total Registered NGOs", stats.ngos.total],
      ["NGOs", "Active NGOs", stats.ngos.active],
      ["Disasters", "Total Disasters", stats.disasters.total],
      ["Disasters", "Active Disasters", stats.disasters.active],
      ["Requests", "Total Relief Requests", stats.requests.total],
      ["Requests", "Pending Requests", stats.requests.pending],
      ["Requests", "Completed Requests", stats.requests.completed],
      ["Shelters", "Total Shelters", stats.shelters.total],
      ["Shelters", "Total Capacity", stats.shelters.capacity],
      ["Shelters", "Current Occupancy", stats.shelters.occupancy],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `operational_summary_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive summary metrics on relief delivery progress, resource distribution, and response times."
        breadcrumbs={[{ label: "Overview", path: "/dashboard" }, { label: "Reports" }]}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
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
            <button
              onClick={handleExportSummaryCSV}
              disabled={!stats}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "13px",
                border: "none",
                cursor: stats ? "pointer" : "not-allowed",
                opacity: stats ? 1 : 0.6,
              }}
            >
              <Download size={15} /> Export CSV Report
            </button>
          </div>
        }
      />

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.1)", color: "var(--danger)", fontSize: "14px", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <Card title="Operational Performance Summary">
        <div style={{ padding: "8px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "18px", backgroundColor: "var(--bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-h)" }}>Relief Fulfilment</h4>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-h)", marginBottom: "4px" }}>
                {stats ? `${stats.requests.completed}` : "..."}
              </div>
              <div style={{ fontSize: "13px", color: "var(--secondary)" }}>
                Completed requests out of {stats?.requests.total ?? 0} total requests
              </div>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "18px", backgroundColor: "var(--bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <Clock size={20} style={{ color: "var(--warning)" }} />
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-h)" }}>Pending Verification & Routing</h4>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-h)", marginBottom: "4px" }}>
                {stats ? `${stats.requests.pending}` : "..."}
              </div>
              <div style={{ fontSize: "13px", color: "var(--secondary)" }}>
                Requests currently awaiting NGO/Volunteer routing
              </div>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "18px", backgroundColor: "var(--bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-h)" }}>Disaster Incidents</h4>
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-h)", marginBottom: "4px" }}>
                {stats ? `${stats.disasters.active}` : "..."}
              </div>
              <div style={{ fontSize: "13px", color: "var(--secondary)" }}>
                Active disaster events currently being coordinated
              </div>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Reports;
