import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FileText, UserCheck, Package, AlertTriangle,
  ArrowRight, CheckCircle2, Clock, RefreshCw,
  MapPin, User, Building2,
} from "lucide-react";
import { useAuth }      from "../../context/AuthContext.js";
import { requestsApi }  from "../../services/requestsApi.js";
import { ngoApi, type NGOProfileData } from "../../services/ngoApi.js";
import type { ReliefRequest } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import Card          from "../../components/Card.js";
import StatusBadge   from "../../components/StatusBadge.js";

const URGENCY_COLOR: Record<string, string> = {
  critical: "#7c3aed", high: "var(--danger)",
  medium:   "var(--warning)", low: "var(--success)",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const NgoDashboard: React.FC = () => {
  const { user } = useAuth();

  const [assignedRequests, setAssignedRequests] = useState<ReliefRequest[]>([]);
  const [allRequests,      setAllRequests]      = useState<ReliefRequest[]>([]);
  const [ngoProfile,       setNgoProfile]       = useState<NGOProfileData | null>(null);
  const [loading,          setLoading]          = useState(true);
  const [accepting,        setAccepting]        = useState<string | null>(null);
  const [noProfile,        setNoProfile]        = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setNoProfile(false);
    try {
      // Step 1: resolve this NGO's MongoDB profile _id (used as assignedNGO on requests)
      let profile: NGOProfileData | null = null;
      try {
        profile = await ngoApi.getMyProfile(user.id);
        setNgoProfile(profile);
      } catch {
        // No profile yet — prompt user to complete setup
        setNoProfile(true);
        setAssignedRequests([]);
        setAllRequests([]);
        return;
      }

      // Step 2: fetch only THIS NGO's requests using profile._id
      const [assigned, all] = await Promise.all([
        requestsApi.getAll({ assignedNGO: profile._id, status: "ngo_assigned" }),
        requestsApi.getAll({ assignedNGO: profile._id }),
      ]);
      setAssignedRequests(assigned);
      setAllRequests(all);
    } catch {
      // fail gracefully
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAccept = async (id: string) => {
    setAccepting(id);
    try {
      const updated = await requestsApi.accept(id);
      setAssignedRequests(prev => prev.filter(r => r._id !== id));
      setAllRequests(prev => prev.map(r => r._id === id ? updated : r));
    } finally {
      setAccepting(null);
    }
  };

  // ── KPI counts with new lifecycle statuses ────────────────────────────────
  const awaitingCount  = assignedRequests.length;
  const activeCount    = allRequests.filter(r =>
    ["ngo_accepted", "verified", "resources_reserved", "volunteer_assigned", "in_transit"].includes(r.status)
  ).length;
  const deliveredToday = allRequests.filter(r =>
    r.status === "delivered" && Date.now() - new Date(r.updatedAt).getTime() < 86400000
  ).length;
  const completedCount = allRequests.filter(r => r.status === "completed").length;

  const previewQueue = assignedRequests.slice(0, 4);

  return (
    <PageContainer>
      {/* No profile yet — prompt to complete setup */}
      {!loading && noProfile && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderRadius: "12px", backgroundColor: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.3)", marginBottom: "20px" }}>
          <AlertTriangle size={16} style={{ color: "var(--warning)", flexShrink: 0 }} />
          <div>
            <p style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: "var(--text-h)" }}>Complete your NGO profile</p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)" }}>Your profile isn't set up yet. The routing system needs your service areas before requests can be assigned to you.</p>
          </div>
          <Link to="/ngo/profile" style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: "8px", backgroundColor: "var(--warning)", color: "#fff", fontWeight: 700, fontSize: "13px", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
            Set Up Profile
          </Link>
        </div>
      )}

      {/* Awaiting acceptance banner */}
      {!loading && awaitingCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: "24px" }}>
          <AlertTriangle size={15} style={{ color: "var(--danger)", flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "var(--text-h)" }}>
            <strong>{awaitingCount} request{awaitingCount !== 1 ? "s" : ""}</strong> assigned to your organisation — awaiting acceptance.
          </p>
          <Link to="/ngo/requests" style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: "var(--danger)", textDecoration: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
            Open Queue <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <PageHeader
        title={ngoProfile ? ngoProfile.orgName : (user?.organizationName ?? "NGO Dashboard")}
        description="Your assigned requests and deliveries — only your organisation's data."
        actions={
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={fetchData} disabled={loading} title="Refresh"
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: "8px", padding: "8px", cursor: "pointer", color: "var(--secondary)", display: "flex" }}>
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            </button>
            <Link to="/ngo/profile" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
              <Building2 size={14} /> Profile
            </Link>
            <Link to="/ngo/requests" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 16px", borderRadius: "10px", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
              <UserCheck size={14} /> All Requests
            </Link>
          </div>
        }
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Awaiting Acceptance", value: loading ? "—" : String(awaitingCount),  color: "var(--danger)",  bg: "rgba(239,68,68,0.1)",    icon: <Clock size={18} /> },
          { label: "Active Cases",        value: loading ? "—" : String(activeCount),    color: "#7c3aed",        bg: "rgba(124,58,237,0.1)",   icon: <FileText size={18} /> },
          { label: "Delivered Today",     value: loading ? "—" : String(deliveredToday), color: "var(--warning)", bg: "rgba(245,158,11,0.1)",   icon: <Package size={18} /> },
          { label: "Completed",           value: loading ? "—" : String(completedCount), color: "var(--success)", bg: "rgba(5,150,105,0.1)",    icon: <CheckCircle2 size={18} /> },
        ].map(k => (
          <div key={k.label} style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "9px", backgroundColor: k.bg, color: k.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)", lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>

        {/* Incoming request queue */}
        <Card
          title="Awaiting Acceptance"
          action={
            <Link to="/ngo/requests?status=ngo_assigned" style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
              View All <ArrowRight size={13} />
            </Link>
          }
        >
          {loading ? (
            <div style={{ padding: "24px 0", textAlign: "center", fontSize: "13px", color: "var(--secondary)" }}>Loading queue…</div>
          ) : previewQueue.length === 0 ? (
            <div style={{ padding: "28px 0", textAlign: "center" }}>
              <CheckCircle2 size={28} style={{ color: "var(--success)", marginBottom: "10px" }} />
              <p style={{ margin: 0, fontSize: "14px", color: "var(--secondary)" }}>No requests awaiting acceptance.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {previewQueue.map(req => {
                const urgColor  = URGENCY_COLOR[req.urgency] ?? "var(--secondary)";
                const acting    = accepting === req._id;
                const locDisplay = [req.location?.localBodyName, req.location?.districtName].filter(Boolean).join(", ");
                return (
                  <div key={req._id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border)", borderLeft: `3px solid ${urgColor}`, backgroundColor: "var(--bg)" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>{req.category}</span>
                        <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "99px", backgroundColor: `${urgColor}18`, color: urgColor, textTransform: "uppercase" }}>{req.urgency}</span>
                        <StatusBadge status={req.status} style={{ fontSize: "10px" }} />
                      </div>
                      <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--secondary)", flexWrap: "wrap" }}>
                        {locDisplay && <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={10} /> {locDisplay}</span>}
                        {req.fullName && <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><User size={10} /> {req.fullName}</span>}
                        <span>{timeAgo(req.createdAt)}</span>
                      </div>
                    </div>
                    <button onClick={() => handleAccept(req._id)} disabled={acting}
                      style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 11px", borderRadius: "6px", backgroundColor: "rgba(5,150,105,0.1)", color: "var(--success)", border: "none", fontSize: "12px", fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", opacity: acting ? 0.6 : 1, flexShrink: 0 }}>
                      <CheckCircle2 size={12} /> {acting ? "…" : "Accept"}
                    </button>
                  </div>
                );
              })}
              {assignedRequests.length > 4 && (
                <Link to="/ngo/requests" style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: "8px", border: "1px dashed var(--border)", color: "var(--secondary)", textDecoration: "none", fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>
                  +{assignedRequests.length - 4} more in queue
                </Link>
              )}
            </div>
          )}
        </Card>

        {/* Profile & operations */}
        <Card title="My Organisation Summary">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "Total Assigned to Us", value: loading ? "—" : String(allRequests.length),    color: "var(--primary)" },
              { label: "Awaiting Acceptance",      value: loading ? "—" : String(awaitingCount),         color: "var(--danger)"  },
              { label: "Active Cases",             value: loading ? "—" : String(activeCount),           color: "#7c3aed"        },
              { label: "Completed",                value: loading ? "—" : String(completedCount),        color: "var(--success)" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: "8px", backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "13px", color: "var(--text-h)", fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: "18px", fontWeight: 800, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>

          {ngoProfile && (
            <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "8px", backgroundColor: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15)" }}>
              <p style={{ margin: "0 0 4px", fontSize: "12px", fontWeight: 600, color: "var(--success)" }}>Routing Active</p>
              <p style={{ margin: 0, fontSize: "12px", color: "var(--secondary)", lineHeight: 1.5 }}>
                Covering <strong>{ngoProfile.serviceAreas.districtIds.length}</strong> district{ngoProfile.serviceAreas.districtIds.length !== 1 ? "s" : ""}. Capacity: {ngoProfile.currentWorkload}/{ngoProfile.resourceCapacity} requests.
              </p>
            </div>
          )}

          <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { to: "/ngo/requests", label: "Manage All Requests",  icon: <FileText size={14} />   },
              { to: "/ngo/profile",  label: "Service Areas & Profile", icon: <Building2 size={14} />  },
              { to: "/inventory",    label: "Inventory Management",  icon: <Package size={14} />    },
            ].map(link => (
              <Link key={link.to} to={link.to}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border)", color: "var(--text-h)", textDecoration: "none", fontSize: "13px", fontWeight: 500 }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--primary)" }}>{link.icon} {link.label}</span>
                <ArrowRight size={13} style={{ color: "var(--secondary)" }} />
              </Link>
            ))}
          </div>
        </Card>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default NgoDashboard;
