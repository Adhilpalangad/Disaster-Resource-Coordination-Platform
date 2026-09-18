import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle, FileText, Home, Users,
  ArrowRight, PlusCircle, Clock, RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { requestsApi } from "../../services/requestsApi.js";
import type { ReliefRequest } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import Card from "../../components/Card.js";
import StatusBadge from "../../components/StatusBadge.js";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const [requests, setRequests]   = useState<ReliefRequest[]>([]);
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await requestsApi.getAll({ createdBy: user.id });
      setRequests(data);
      setLastRefresh(new Date());
    } catch {
      // silently fail — dashboard degrades gracefully
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const pending  = requests.filter(r => r.status === "pending" || r.status === "location_routed").length;
  const active   = requests.filter(r => ["ngo_assigned", "ngo_accepted", "verified", "resources_reserved", "volunteer_assigned", "in_transit"].includes(r.status)).length;
  const resolved = requests.filter(r => r.status === "completed" || r.status === "delivered").length;
  const recent   = requests.slice(0, 5);

  const kpis = [
    {
      label: "Total Requests",
      value: loading ? "—" : String(requests.length),
      icon: <FileText size={18} />,
      iconBg: "rgba(2,132,199,0.1)",
      iconColor: "var(--primary)",
      sub: loading ? "" : `${pending} pending review`,
    },
    {
      label: "Active",
      value: loading ? "—" : String(active),
      icon: <Clock size={18} />,
      iconBg: "rgba(124,58,237,0.1)",
      iconColor: "#7c3aed",
      sub: "verified / in progress",
    },
    {
      label: "Resolved",
      value: loading ? "—" : String(resolved),
      icon: <Home size={18} />,
      iconBg: "rgba(5,150,105,0.1)",
      iconColor: "var(--success)",
      sub: "completed successfully",
    },
    {
      label: "Volunteers Deployed",
      value: "—",
      icon: <Users size={18} />,
      iconBg: "rgba(245,158,11,0.1)",
      iconColor: "var(--warning)",
      sub: "module coming soon",
    },
  ];

  return (
    <PageContainer>
      {/* Active disaster banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 16px", borderRadius: "10px", marginBottom: "24px",
        backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
      }}>
        <AlertTriangle size={15} style={{ color: "var(--danger)", flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", fontWeight: 500 }}>
          <strong>Active:</strong> Wayanad Flood Relief Operation — Relief activities ongoing in Mananthavady, Vythiri, and Kalpetta.
        </p>
        <Link to="/disasters" style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: "var(--danger)", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
          View <ArrowRight size={12} />
        </Link>
      </div>

      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        description="Overview of your submitted relief requests and active operations."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={fetchRequests}
              disabled={loading}
              title="Refresh"
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "var(--secondary)", display: "flex", alignItems: "center" }}
            >
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            </button>
            <Link
              to="/requests/create"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "10px", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}
            >
              <PlusCircle size={15} /> Submit Request
            </Link>
          </div>
        }
      />

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", padding: "18px 20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: k.iconBg, color: k.iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {k.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "11px", color: "var(--secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>{k.label}</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-h)", lineHeight: 1.2, margin: "4px 0" }}>{k.value}</div>
              <div style={{ fontSize: "11px", color: "var(--secondary)" }}>{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>

        {/* Recent requests */}
        <Card
          title="Recent Requests"
          action={
            <Link to="/requests" style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ArrowRight size={13} />
            </Link>
          }
        >
          {loading ? (
            <div style={{ padding: "32px 0", textAlign: "center", fontSize: "13px", color: "var(--secondary)" }}>Loading requests…</div>
          ) : recent.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--secondary)" }}>No requests submitted yet.</p>
              <Link to="/requests/create" style={{ display: "inline-block", marginTop: "12px", fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}>
                Submit your first request
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Category", "Location", "Date", "Status"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "var(--secondary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((req) => (
                    <tr key={req._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 10px" }}>
                        <Link to={`/requests/${req._id}`} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none", textTransform: "capitalize" }}>
                          {req.category}
                        </Link>
                      </td>
                      <td style={{ padding: "12px 10px", color: "var(--secondary)", fontSize: "12px" }}>
                          {truncate(
                          [req.location?.localBodyName, req.location?.districtName]
                            .filter(Boolean)
                            .join(", "),
                          28,
                        )}
                      </td>
                      <td style={{ padding: "12px 10px", color: "var(--secondary)", fontSize: "12px", whiteSpace: "nowrap" }}>
                        {formatDate(req.createdAt)}
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ margin: "10px 0 0", fontSize: "11px", color: "var(--secondary)", textAlign: "right" }}>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          )}
        </Card>

        {/* Quick actions */}
        <Card title="Quick Actions">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { to: "/requests/create", icon: <PlusCircle size={17} />, title: "Submit a Relief Request", desc: "Report food, water, medical, or shelter needs", color: "var(--primary)", bg: "rgba(2,132,199,0.08)" },
              { to: "/requests",        icon: <FileText size={17} />,   title: "Track My Requests",        desc: "View status updates on all your submissions",  color: "#7c3aed",         bg: "rgba(124,58,237,0.08)" },
              { to: "/disasters",       icon: <AlertTriangle size={17} />, title: "Active Disasters",       desc: "Ongoing operations and affected zones",        color: "var(--danger)",   bg: "rgba(239,68,68,0.08)" },
              { to: "/shelters",        icon: <Home size={17} />,       title: "Locate Nearest Shelter",   desc: "Relief centres with available capacity",       color: "var(--success)",  bg: "rgba(5,150,105,0.08)" },
            ].map((a) => (
              <Link
                key={a.to}
                to={a.to}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 14px", borderRadius: "10px", border: "1px solid var(--border)", textDecoration: "none", backgroundColor: "var(--bg)", transition: "border-color 0.15s, background-color 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = a.color; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = a.bg; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--bg)"; }}
              >
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: a.bg, color: a.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{a.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--secondary)", marginTop: "2px" }}>{a.desc}</div>
                </div>
                <ArrowRight size={13} style={{ color: "var(--secondary)", flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </Card>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default Dashboard;
