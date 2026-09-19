import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck, MapPin, Clock, RefreshCw, AlertCircle,
  Package, Utensils, Droplets, HeartPulse, Home, AlertTriangle, Truck,
  Navigation, CheckCircle2, Users, ChevronDown, X, UserX,
} from "lucide-react";
import { useAuth }      from "../../context/AuthContext.js";
import { requestsApi }  from "../../services/requestsApi.js";
import type { ReliefRequest, RequestCategory, UrgencyLevel } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import StatusBadge   from "../../components/StatusBadge.js";
import EmptyState    from "../../components/EmptyState.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  low: "var(--success)", medium: "var(--warning)", high: "var(--danger)", critical: "#7c3aed",
};
const CATEGORY_ICONS: Record<RequestCategory, React.ElementType> = {
  food: Utensils, water: Droplets, medicine: HeartPulse,
  shelter: Home, rescue: AlertTriangle, transportation: Truck, other: Package,
};

const VOLUNTEER_STATUSES = ["volunteer_assigned", "in_transit", "delivered", "completed"];

type TabId = "active" | "delivered" | "all";
const TABS: { id: TabId; label: string; statuses: string[] }[] = [
  { id: "active",    label: "Active",    statuses: ["volunteer_assigned", "in_transit"] },
  { id: "delivered", label: "Delivered", statuses: ["delivered", "completed"] },
  { id: "all",       label: "All",       statuses: VOLUNTEER_STATUSES },
];

const DEMO_VOLUNTEERS = [
  { id: "demo-volunteer-001", name: "Sneha Pillai",  phone: "+91 98765 22222" },
  { id: "vol-field-002",      name: "Arun Kumar",    phone: "+91 90001 10002" },
  { id: "vol-field-003",      name: "Priya Suresh",  phone: "+91 90001 10003" },
];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Reassign Volunteer Modal ───────────────────────────────────────────────────
const ReassignModal: React.FC<{
  requestId: string;
  currentVolunteer?: string;
  onConfirm: (id: string, vid: string, vname: string, eta: string) => Promise<void>;
  onClose: () => void;
}> = ({ requestId, currentVolunteer, onConfirm, onClose }) => {
  const [selectedId, setSelectedId] = useState(DEMO_VOLUNTEERS[0].id);
  const [eta,        setEta]        = useState("");
  const [busy,       setBusy]       = useState(false);

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", maxWidth: "420px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <UserCheck size={18} color="#7c3aed" />
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-h)" }}>Reassign Volunteer</h3>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", display: "flex" }}><X size={16} /></button>
        </div>
        {currentVolunteer && (
          <div style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: "14px", fontSize: "12px", color: "var(--warning)" }}>
            Currently assigned to: <strong>{currentVolunteer}</strong>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
          {DEMO_VOLUNTEERS.map(v => (
            <label key={v.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "9px", border: `1px solid ${selectedId === v.id ? "#7c3aed" : "var(--border)"}`, backgroundColor: selectedId === v.id ? "rgba(124,58,237,0.06)" : "var(--bg)", cursor: "pointer" }}>
              <input type="radio" name="vol" checked={selectedId === v.id} onChange={() => setSelectedId(v.id)} style={{ accentColor: "#7c3aed" }} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{v.name}</p>
                <p style={{ margin: "1px 0 0", fontSize: "11px", color: "var(--secondary)" }}>{v.phone}</p>
              </div>
              {v.id === "demo-volunteer-001" && <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 5px", borderRadius: "4px", backgroundColor: "rgba(5,150,105,0.1)", color: "var(--success)" }}>LINKED</span>}
            </label>
          ))}
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "5px" }}>New ETA (optional)</label>
          <input type="datetime-local" value={eta} onChange={e => setEta(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", boxSizing: "border-box", backgroundColor: "var(--bg)", color: "var(--text-h)" }} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          <button onClick={async () => {
            const vol = DEMO_VOLUNTEERS.find(v => v.id === selectedId);
            if (!vol) return;
            setBusy(true);
            await onConfirm(requestId, vol.id, vol.name, eta);
            setBusy(false);
          }} disabled={busy}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: busy ? "var(--secondary)" : "#7c3aed", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: busy ? "not-allowed" : "pointer" }}>
            {busy ? "Reassigning…" : "Confirm Reassign"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Assignment Card ───────────────────────────────────────────────────────────
const AssignmentCard: React.FC<{
  req: ReliefRequest;
  expanded: boolean;
  onToggle: () => void;
  onReassign: (id: string) => void;
  acting: boolean;
}> = ({ req, expanded, onToggle, onReassign, acting }) => {
  const urgColor = URGENCY_COLOR[req.urgency as UrgencyLevel] ?? "var(--secondary)";
  const Icon     = CATEGORY_ICONS[req.category as RequestCategory] ?? Package;
  const locStr   = [req.location?.localBodyName, req.location?.districtName].filter(Boolean).join(", ");

  const statusDot = (status: string) => {
    const colors: Record<string, string> = {
      volunteer_assigned: "#7c3aed",
      in_transit: "#9333ea",
      delivered: "var(--success)",
      completed: "var(--success)",
    };
    return colors[status] ?? "var(--secondary)";
  };

  return (
    <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: `4px solid ${urgColor}`, borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
      {/* Main row */}
      <div style={{ padding: "13px 16px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
        {/* Category icon */}
        <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: `${urgColor}18`, color: urgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap", marginBottom: "3px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>{req.category}</span>
            <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "99px", backgroundColor: `${urgColor}18`, color: urgColor, textTransform: "uppercase" }}>{req.urgency}</span>
            <StatusBadge status={req.status} />
          </div>
          <p style={{ margin: "0 0 5px", fontSize: "12px", color: "var(--text-h)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {req.description}
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "11px", color: "var(--secondary)" }}>
            {locStr && <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={10} /> {locStr}</span>}
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Users size={10} /> {req.peopleAffected} people</span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Clock size={10} /> {timeAgo(req.volunteerAssignedAt ?? req.updatedAt)}</span>
          </div>
        </div>

        {/* Volunteer pill + actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
          {/* Volunteer badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 9px", borderRadius: "99px", backgroundColor: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusDot(req.status) }} />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#7c3aed" }}>
              {req.assignedVolunteerName ?? "Unassigned"}
            </span>
          </div>

          {/* ETA */}
          {req.estimatedArrival && (
            <span style={{ fontSize: "11px", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "3px" }}>
              <Navigation size={9} />
              {new Date(req.estimatedArrival).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}

          <div style={{ display: "flex", gap: "4px" }}>
            {/* Re-assign — only while still en route */}
            {["volunteer_assigned", "in_transit"].includes(req.status) && (
              <button onClick={() => onReassign(req._id)} disabled={acting}
                style={{ padding: "5px 9px", borderRadius: "6px", border: "1px solid #7c3aed", backgroundColor: "transparent", color: "#7c3aed", fontSize: "11px", fontWeight: 600, cursor: acting ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                Reassign
              </button>
            )}
            <button onClick={onToggle}
              style={{ display: "flex", alignItems: "center", gap: "3px", padding: "5px 9px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--secondary)", fontSize: "11px", cursor: "pointer" }}>
              Details <ChevronDown size={10} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.18s" }} />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ padding: "11px 16px 13px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", backgroundColor: "var(--bg)" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Beneficiary</p>
            <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{req.fullName}</p>
            {req.mobileNumber && <p style={{ margin: 0, fontSize: "12px", color: "var(--secondary)" }}>📞 {req.mobileNumber}</p>}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Delivery Location</p>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-h)", lineHeight: 1.6 }}>
              {[req.location?.wardName, req.location?.localBodyName, req.location?.talukName, req.location?.districtName].filter(Boolean).join(" › ")}
            </p>
            {req.location?.landmark && <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--secondary)" }}>Near: {req.location.landmark}</p>}
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Timeline</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px", fontSize: "11px", color: "var(--secondary)" }}>
              {req.volunteerAssignedAt && <span>Assigned: {new Date(req.volunteerAssignedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
              {req.inTransitAt && <span style={{ color: "var(--warning)", fontWeight: 600 }}>In transit: {new Date(req.inTransitAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
              {req.deliveredAt && <span style={{ color: "var(--success)", fontWeight: 600 }}>✓ Delivered: {new Date(req.deliveredAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const Assignments: React.FC = () => {
  const { user } = useAuth();

  const [requests,     setRequests]     = useState<ReliefRequest[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [activeTab,    setActiveTab]    = useState<TabId>("active");
  const [expandedId,   setExpandedId]   = useState<string | null>(null);
  const [reassignId,   setReassignId]   = useState<string | null>(null);
  const [actingId,     setActingId]     = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      // user.id is stored directly as assignedNGO by the routing engine
      const all = await requestsApi.getAll({ assignedNGO: user.id });
      setRequests(all.filter(r => VOLUNTEER_STATUSES.includes(r.status)));
    } catch {
      setError("Could not load assignments. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const tabRequests = requests.filter(r =>
    TABS.find(t => t.id === activeTab)?.statuses.includes(r.status)
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────────
  const totalAssigned   = requests.length;
  const activeCount     = requests.filter(r => ["volunteer_assigned", "in_transit"].includes(r.status)).length;
  const inTransitCount  = requests.filter(r => r.status === "in_transit").length;
  const deliveredCount  = requests.filter(r => ["delivered", "completed"].includes(r.status)).length;

  // ── Reassign handler ──────────────────────────────────────────────────────────
  const handleReassign = async (reqId: string, volId: string, volName: string, eta: string) => {
    setActingId(reqId);
    try {
      const updated = await requestsApi.assignVolunteer(reqId, {
        volunteerId:    volId,
        volunteerName:  volName,
        ...(eta && { estimatedArrival: eta }),
      });
      setRequests(prev => prev.map(r => r._id === reqId ? updated : r));
      setReassignId(null);
    } catch {
      alert("Reassignment failed. Please try again.");
    } finally {
      setActingId(null);
    }
  };

  // ── Volunteer stats ───────────────────────────────────────────────────────────
  const volunteerStats = DEMO_VOLUNTEERS.map(v => ({
    ...v,
    active:    requests.filter(r => r.assignedVolunteer === v.id && ["volunteer_assigned", "in_transit"].includes(r.status)).length,
    completed: requests.filter(r => r.assignedVolunteer === v.id && ["delivered", "completed"].includes(r.status)).length,
  }));

  return (
    <PageContainer>
      <PageHeader
        title="Volunteer Assignments"
        description="Track all volunteer delivery tasks dispatched by your NGO: live status, reassignment, and delivery confirmation."
        breadcrumbs={[{ label: "NGO Dashboard", path: "/ngo/dashboard" }, { label: "Assignments" }]}
        actions={
          <button onClick={fetchAssignments} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
          </button>
        }
      />

      {/* Error banner */}
      {error && (
        <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total Assigned",  value: loading ? "-" : String(totalAssigned),  color: "var(--primary)", bg: "rgba(2,132,199,0.1)"   },
          { label: "Active",          value: loading ? "-" : String(activeCount),    color: "#7c3aed",        bg: "rgba(124,58,237,0.1)"  },
          { label: "In Transit",      value: loading ? "-" : String(inTransitCount), color: "var(--warning)", bg: "rgba(245,158,11,0.1)"  },
          { label: "Delivered",       value: loading ? "-" : String(deliveredCount), color: "var(--success)", bg: "rgba(5,150,105,0.1)"   },
        ].map(k => (
          <div key={k.label} style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", padding: "14px 16px" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase", marginTop: "3px", letterSpacing: "0.4px" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Volunteer summary row */}
      {!loading && requests.length > 0 && (
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {volunteerStats.map(v => (
            <div key={v.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "99px", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: v.active > 0 ? "#7c3aed" : "var(--border)" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{v.name}</span>
              {v.active > 0 && <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "99px", backgroundColor: "rgba(124,58,237,0.1)", color: "#7c3aed", fontWeight: 700 }}>{v.active} active</span>}
              {v.completed > 0 && <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "99px", backgroundColor: "rgba(5,150,105,0.1)", color: "var(--success)", fontWeight: 700 }}>{v.completed} done</span>}
              {v.active === 0 && v.completed === 0 && <span style={{ fontSize: "11px", color: "var(--secondary)" }}>idle</span>}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "4px" }}>
        {TABS.map(t => {
          const count  = requests.filter(r => t.statuses.includes(r.status)).length;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", backgroundColor: active ? "var(--primary)" : "transparent", color: active ? "#fff" : "var(--secondary)", transition: "all 0.15s" }}>
              {t.label}
              {count > 0 && (
                <span style={{ minWidth: "18px", height: "18px", borderRadius: "99px", backgroundColor: active ? "rgba(255,255,255,0.25)" : "rgba(2,132,199,0.12)", color: active ? "#fff" : "var(--primary)", fontSize: "11px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: "90px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />)}
        </div>
      ) : tabRequests.length === 0 ? (
        <EmptyState
          icon={activeTab === "active" ? <UserX size={32} /> : <CheckCircle2 size={32} />}
          title={activeTab === "active" ? "No active assignments" : activeTab === "delivered" ? "No deliveries yet" : "No volunteer assignments yet"}
          description={activeTab === "active" ? "Assign volunteers to verified requests from the Requests page." : "Completed deliveries will appear here."}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tabRequests.map(req => (
            <AssignmentCard
              key={req._id}
              req={req}
              expanded={expandedId === req._id}
              onToggle={() => setExpandedId(expandedId === req._id ? null : req._id)}
              onReassign={() => setReassignId(req._id)}
              acting={actingId === req._id}
            />
          ))}
        </div>
      )}

      {/* Reassign modal */}
      {reassignId && (
        <ReassignModal
          requestId={reassignId}
          currentVolunteer={requests.find(r => r._id === reassignId)?.assignedVolunteerName}
          onConfirm={handleReassign}
          onClose={() => setReassignId(null)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default Assignments;
