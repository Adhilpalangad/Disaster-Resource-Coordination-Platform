import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin, Clock, Phone, Navigation, CheckCircle2, Package,
  Utensils, Droplets, HeartPulse, Home, AlertTriangle, Truck,
  RefreshCw, Users, User, UserCheck, ChevronDown, AlertCircle,
} from "lucide-react";
import { useAuth }     from "../../context/AuthContext.js";
import { requestsApi } from "../../services/requestsApi.js";
import type { ReliefRequest, RequestCategory, UrgencyLevel } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import StatusBadge   from "../../components/StatusBadge.js";
import EmptyState    from "../../components/EmptyState.js";

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  low: "var(--success)", medium: "var(--warning)", high: "var(--danger)", critical: "#7c3aed",
};
const CATEGORY_ICONS: Record<RequestCategory, React.ElementType> = {
  food: Utensils, water: Droplets, medicine: HeartPulse,
  shelter: Home, rescue: AlertTriangle, transportation: Truck, other: Package,
};

type FilterTab = "active" | "history";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const VolunteerTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks,      setTasks]      = useState<ReliefRequest[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [acting,     setActing]     = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab,        setTab]        = useState<FilterTab>("active");

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      const data = await requestsApi.getAll({ assignedVolunteer: user.id });
      setTasks(data);
    } catch {
      setError("Could not load tasks. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleInTransit = async (id: string) => {
    setActing(id);
    try {
      const updated = await requestsApi.markInTransit(id);
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    } catch { alert("Could not update status. Please try again."); }
    finally { setActing(null); }
  };

  const handleDelivered = async (id: string) => {
    setActing(id);
    try {
      const updated = await requestsApi.markDelivered(id);
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    } catch { alert("Could not update status. Please try again."); }
    finally { setActing(null); }
  };

  const activeTasks  = tasks.filter(t => ["volunteer_assigned", "in_transit"].includes(t.status));
  const historyTasks = tasks.filter(t => ["delivered", "completed"].includes(t.status));
  const displayTasks = tab === "active" ? activeTasks : historyTasks;

  return (
    <PageContainer>
      <PageHeader
        title="My Tasks"
        description="Relief delivery tasks assigned to you by partner NGOs."
        breadcrumbs={[{ label: "Dashboard", path: "/volunteer/dashboard" }, { label: "Tasks" }]}
        actions={
          <button onClick={fetchTasks} disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
          </button>
        }
      />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "4px" }}>
        {([
          { id: "active",  label: "Active Tasks",   count: activeTasks.length  },
          { id: "history", label: "Delivered / Done", count: historyTasks.length },
        ] as const).map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", backgroundColor: active ? "var(--primary)" : "transparent", color: active ? "#fff" : "var(--secondary)", transition: "all 0.15s" }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ minWidth: "18px", height: "18px", borderRadius: "99px", backgroundColor: active ? "rgba(255,255,255,0.25)" : "rgba(2,132,199,0.12)", color: active ? "#fff" : "var(--primary)", fontSize: "11px", fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error ? (
        <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: "110px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />)}
        </div>
      ) : displayTasks.length === 0 ? (
        <EmptyState
          icon={tab === "active" ? <Navigation size={36} /> : <CheckCircle2 size={36} />}
          title={tab === "active" ? "No active tasks" : "No completed deliveries yet"}
          description={tab === "active" ? "Tasks assigned to you by NGOs will appear here." : "Tasks you mark delivered will show here."}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayTasks.map(req => {
            const urgColor = URGENCY_COLOR[req.urgency as UrgencyLevel] ?? "var(--secondary)";
            const Icon     = CATEGORY_ICONS[req.category as RequestCategory] ?? Package;
            const isActing = acting === req._id;
            const expanded = expandedId === req._id;
            const locStr   = [req.location?.localBodyName, req.location?.districtName].filter(Boolean).join(", ");

            return (
              <div key={req._id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: `4px solid ${urgColor}`, borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
                {/* Main row */}
                <div style={{ padding: "14px 18px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: `${urgColor}18`, color: urgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>{req.category}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px", backgroundColor: `${urgColor}18`, color: urgColor, textTransform: "uppercase" }}>{req.urgency}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", color: "var(--text-h)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {req.description}
                    </p>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap" }}>
                      {locStr && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={10} /> {locStr}</span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Users size={10} /> {req.peopleAffected} people</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Clock size={10} /> {timeAgo(req.volunteerAssignedAt ?? req.updatedAt)}</span>
                      {req.assignedNGOName && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><UserCheck size={10} /> {req.assignedNGOName}</span>
                      )}
                    </div>
                    {req.estimatedArrival && (
                      <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "6px", backgroundColor: "rgba(124,58,237,0.08)", color: "#7c3aed", fontSize: "12px", fontWeight: 600 }}>
                        <Navigation size={10} />
                        ETA: {new Date(req.estimatedArrival).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                    {req.status === "volunteer_assigned" && (
                      <button onClick={() => handleInTransit(req._id)} disabled={isActing}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "8px", backgroundColor: isActing ? "var(--secondary)" : "var(--primary)", color: "#fff", border: "none", fontWeight: 600, fontSize: "12px", cursor: isActing ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                        <Navigation size={13} /> {isActing ? "Updating…" : "Start Delivery"}
                      </button>
                    )}
                    {req.status === "in_transit" && (
                      <button onClick={() => handleDelivered(req._id)} disabled={isActing}
                        style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "8px", backgroundColor: isActing ? "var(--secondary)" : "var(--success)", color: "#fff", border: "none", fontWeight: 600, fontSize: "12px", cursor: isActing ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                        <CheckCircle2 size={13} /> {isActing ? "Updating…" : "Mark Delivered"}
                      </button>
                    )}
                    {["delivered", "completed"].includes(req.status) && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "7px 12px", borderRadius: "8px", backgroundColor: "rgba(5,150,105,0.08)", color: "var(--success)", fontSize: "12px", fontWeight: 600 }}>
                        <CheckCircle2 size={12} /> Done
                      </span>
                    )}
                    <button onClick={() => setExpandedId(expanded ? null : req._id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--secondary)", fontSize: "11px", cursor: "pointer" }}>
                      Details <ChevronDown size={11} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {expanded && (
                  <div style={{ padding: "12px 18px 14px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "14px" }}>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Beneficiary</p>
                      {req.fullName && (
                        <p style={{ margin: "0 0 3px", fontSize: "13px", color: "var(--text-h)", display: "flex", alignItems: "center", gap: "5px" }}>
                          <User size={11} /> {req.fullName}
                        </p>
                      )}
                      {req.mobileNumber && (
                        <p style={{ margin: "0 0 3px", fontSize: "13px", color: "var(--text-h)", display: "flex", alignItems: "center", gap: "5px" }}>
                          <Phone size={11} /> {req.mobileNumber}
                        </p>
                      )}
                      {(req.specialNeeds?.filter(s => s !== "none").length ?? 0) > 0 && (
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--danger)" }}>
                          Special needs: {req.specialNeeds?.filter(s => s !== "none").join(", ")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Delivery Address</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-h)", lineHeight: 1.6 }}>
                        {[req.location?.wardName, req.location?.localBodyName, req.location?.talukName, req.location?.districtName, "Kerala"].filter(Boolean).join(" › ")}
                      </p>
                      {req.location?.landmark && (
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--secondary)" }}>Near: {req.location.landmark}</p>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Timeline</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "var(--secondary)" }}>
                        <span>Submitted: {new Date(req.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        {req.volunteerAssignedAt && <span>Assigned to you: {new Date(req.volunteerAssignedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                        {req.inTransitAt && <span>In transit: {new Date(req.inTransitAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                        {req.deliveredAt && <span style={{ color: "var(--success)", fontWeight: 600 }}>Delivered: {new Date(req.deliveredAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default VolunteerTasks;
