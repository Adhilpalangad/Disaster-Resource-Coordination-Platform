import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, CheckCircle2, Navigation, Clock,
  Package, Utensils, Droplets, HeartPulse, Home,
  AlertTriangle, Truck, ArrowRight, RefreshCw, UserCheck,
  Bell, CheckCheck, XCircle, Flame, Wind, Waves,
} from "lucide-react";
import { useAuth }       from "../../context/AuthContext.js";
import { requestsApi }   from "../../services/requestsApi.js";
import { disastersApi }  from "../../services/disastersApi.js";
import type {
  ReliefRequest, RequestCategory,
  Disaster, VolunteerDisasterResponse,
} from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import StatusBadge   from "../../components/StatusBadge.js";
import EmptyState    from "../../components/EmptyState.js";

const URGENCY_COLOR: Record<string, string> = {
  critical: "#7c3aed", high: "var(--danger)", medium: "var(--warning)", low: "var(--success)",
};
const CATEGORY_ICONS: Record<RequestCategory, React.ElementType> = {
  food: Utensils, water: Droplets, medicine: HeartPulse,
  shelter: Home, rescue: AlertTriangle, transportation: Truck, other: Package,
};
const DISASTER_ICON: Record<string, React.ElementType> = {
  flood: Droplets, earthquake: AlertTriangle, cyclone: Wind,
  landslide: MapPin, fire: Flame, tsunami: Waves, other: AlertTriangle,
};
const SEVERITY_COLOR: Record<string, string> = {
  critical: "#7c3aed", high: "var(--danger)", moderate: "var(--warning)", low: "var(--success)",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Disaster Alert Banner ─────────────────────────────────────────────────────

interface DisasterAlertProps {
  disaster: Disaster;
  myResponse: VolunteerDisasterResponse | undefined;
  onRespond: (disasterId: string, status: "available" | "unavailable") => void;
  responding: string | null; // disasterId currently being responded to
}

const DisasterAlertCard: React.FC<DisasterAlertProps> = ({
  disaster, myResponse, onRespond, responding,
}) => {
  const Icon        = DISASTER_ICON[disaster.type] ?? AlertTriangle;
  const sevColor    = SEVERITY_COLOR[disaster.severity] ?? "var(--warning)";
  const isResponding = responding === disaster._id;

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "14px",
      padding: "14px 16px",
      borderRadius: "12px",
      border: `1px solid ${sevColor}40`,
      backgroundColor: `${sevColor}08`,
      borderLeft: `4px solid ${sevColor}`,
    }}>
      <div style={{
        width: "36px", height: "36px", borderRadius: "8px",
        backgroundColor: `${sevColor}18`, color: sevColor,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-h)" }}>{disaster.title}</span>
          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px", backgroundColor: `${sevColor}18`, color: sevColor, textTransform: "uppercase" }}>
            {disaster.severity}
          </span>
        </div>
        <p style={{ margin: "0 0 6px", fontSize: "12px", color: "var(--secondary)", lineHeight: 1.5 }}>
          {disaster.affectedDistrictNames.join(", ")} · {disaster.type}
        </p>

        {myResponse ? (
          /* Already responded */
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
            backgroundColor: myResponse.status === "available" ? "rgba(5,150,105,0.12)" : "rgba(107,114,128,0.12)",
            color: myResponse.status === "available" ? "var(--success)" : "var(--secondary)",
            border: `1px solid ${myResponse.status === "available" ? "rgba(5,150,105,0.3)" : "var(--border)"}`,
          }}>
            {myResponse.status === "available"
              ? <><CheckCheck size={12} /> You responded: Available</>
              : <><XCircle size={12} /> You responded: Not available</>
            }
          </div>
        ) : (
          /* Not yet responded */
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => onRespond(disaster._id, "available")}
              disabled={isResponding}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "8px", border: "none", backgroundColor: isResponding ? "var(--secondary)" : "var(--success)", color: "#fff", fontWeight: 600, fontSize: "12px", cursor: isResponding ? "not-allowed" : "pointer" }}
            >
              <CheckCircle2 size={13} /> {isResponding ? "Saving…" : "I'm Available"}
            </button>
            <button
              onClick={() => onRespond(disaster._id, "unavailable")}
              disabled={isResponding}
              style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--secondary)", fontWeight: 600, fontSize: "12px", cursor: isResponding ? "not-allowed" : "pointer" }}
            >
              <XCircle size={13} /> Not Available
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks,   setTasks]   = useState<ReliefRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<string | null>(null);

  // Disaster alerts
  const [myDisasters,  setMyDisasters]  = useState<Disaster[]>([]);
  const [myResponses,  setMyResponses]  = useState<VolunteerDisasterResponse[]>([]);
  const [alertLoading, setAlertLoading] = useState(true);
  const [responding,   setResponding]   = useState<string | null>(null); // disasterId

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await requestsApi.getAll({ assignedVolunteer: user.id });
      setTasks(data);
    } catch {
      // fail gracefully — leave empty
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    setAlertLoading(true);
    try {
      const allActive = await disastersApi.getActive();
      // Filter to disasters affecting this volunteer's district
      const mine = user.district
        ? allActive.filter(d => d.affectedDistrictNames.includes(user.district!))
        : allActive;
      setMyDisasters(mine);

      // Fetch responses for all relevant disasters in parallel
      const allResponses = await Promise.all(
        mine.map(d => disastersApi.getVolunteerResponses(d._id).catch(() => [] as VolunteerDisasterResponse[]))
      );
      // Flatten and keep only the current user's responses
      const flat = allResponses.flat().filter(r => r.volunteerId === user.id);
      setMyResponses(flat);
    } catch {
      // fail gracefully
    } finally {
      setAlertLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTasks(); fetchAlerts(); }, [fetchTasks, fetchAlerts]);

  const handleRespond = async (disasterId: string, status: "available" | "unavailable") => {
    setResponding(disasterId);
    try {
      const saved = await disastersApi.respondToDisaster(disasterId, status);
      setMyResponses(prev => {
        const without = prev.filter(r => r.disasterId !== disasterId);
        return [...without, saved];
      });
    } catch {
      alert("Failed to save your response. Please try again.");
    } finally {
      setResponding(null);
    }
  };

  const handleInTransit = async (id: string) => {
    setActing(id);
    try {
      const updated = await requestsApi.markInTransit(id);
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    } catch { alert("Failed to update status."); }
    finally { setActing(null); }
  };

  const handleDelivered = async (id: string) => {
    setActing(id);
    try {
      const updated = await requestsApi.markDelivered(id);
      setTasks(prev => prev.map(t => t._id === id ? updated : t));
    } catch { alert("Failed to update status."); }
    finally { setActing(null); }
  };

  // KPIs
  const assigned        = tasks.filter(t => t.status === "volunteer_assigned").length;
  const inTransit       = tasks.filter(t => t.status === "in_transit").length;
  const todayMs         = 86400000;
  const deliveredToday  = tasks.filter(t => t.status === "delivered" && Date.now() - new Date(t.updatedAt).getTime() < todayMs).length;
  const completed       = tasks.filter(t => t.status === "completed").length;
  const activeTasks     = tasks.filter(t => ["volunteer_assigned", "in_transit"].includes(t.status));

  // How many disaster alerts still need a response?
  const pendingAlerts = myDisasters.filter(d =>
    !myResponses.some(r => r.disasterId === d._id)
  ).length;

  return (
    <PageContainer>
      <PageHeader
        title="Volunteer Workstation"
        description={`Welcome, ${user?.name?.split(" ")[0] ?? "there"}. Your assigned delivery tasks are shown below.`}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { fetchTasks(); fetchAlerts(); }} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
            <Link to="/volunteer/tasks"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
              All Tasks <ArrowRight size={14} />
            </Link>
          </div>
        }
      />

      {/* ── Disaster Alerts ── */}
      {!alertLoading && myDisasters.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Bell size={15} style={{ color: "var(--warning)" }} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)" }}>
              Disaster Alerts
            </span>
            {pendingAlerts > 0 && (
              <span style={{ padding: "1px 7px", borderRadius: "99px", backgroundColor: "rgba(245,158,11,0.15)", color: "var(--warning)", fontSize: "11px", fontWeight: 700 }}>
                {pendingAlerts} need{pendingAlerts === 1 ? "s" : ""} your response
              </span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myDisasters.map(d => (
              <DisasterAlertCard
                key={d._id}
                disaster={d}
                myResponse={myResponses.find(r => r.disasterId === d._id)}
                onRespond={handleRespond}
                responding={responding}
              />
            ))}
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Assigned",        value: loading ? "N/A" : String(assigned),       color: "#7c3aed",        bg: "rgba(124,58,237,0.1)" },
          { label: "In Transit",      value: loading ? "N/A" : String(inTransit),      color: "var(--warning)", bg: "rgba(245,158,11,0.1)"  },
          { label: "Delivered Today", value: loading ? "N/A" : String(deliveredToday), color: "var(--primary)", bg: "rgba(2,132,199,0.1)"   },
          { label: "Completed",       value: loading ? "N/A" : String(completed),      color: "var(--success)", bg: "rgba(5,150,105,0.1)"   },
        ].map(k => (
          <div key={k.label} style={{ backgroundColor: "var(--card-bg)", borderRadius: "12px", border: "1px solid var(--border)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Active tasks */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2].map(i => <div key={i} style={{ height: "100px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />)}
        </div>
      ) : activeTasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={36} />}
          title="No active tasks right now"
          description="Your NGO will assign tasks when a verified request needs a volunteer. Check back soon."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {activeTasks.map(req => {
            const urgColor = URGENCY_COLOR[req.urgency] ?? "var(--secondary)";
            const Icon     = CATEGORY_ICONS[req.category as RequestCategory] ?? Package;
            const isActing = acting === req._id;
            const locStr   = [req.location?.localBodyName, req.location?.districtName].filter(Boolean).join(", ");

            return (
              <div key={req._id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: `4px solid ${urgColor}`, borderRadius: "12px", padding: "16px 18px", display: "flex", gap: "14px", alignItems: "flex-start", boxShadow: "var(--shadow)" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: `${urgColor}18`, color: urgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>{req.category}</span>
                    <StatusBadge status={req.status} />
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px", backgroundColor: `${urgColor}18`, color: urgColor, textTransform: "uppercase" }}>{req.urgency}</span>
                  </div>
                  <p style={{ margin: "0 0 6px", fontSize: "13px", color: "var(--text-h)", lineHeight: 1.4 }}>{req.description}</p>
                  <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap" }}>
                    {locStr && <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><MapPin size={10} /> {locStr}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Clock size={10} /> Assigned {timeAgo(req.volunteerAssignedAt ?? req.updatedAt)}</span>
                    {req.assignedNGOName && <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><UserCheck size={10} /> {req.assignedNGOName}</span>}
                    {req.estimatedArrival && <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#7c3aed" }}><Navigation size={10} /> ETA {new Date(req.estimatedArrival).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                  {req.status === "volunteer_assigned" && (
                    <button onClick={() => handleInTransit(req._id)} disabled={isActing}
                      style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "8px", backgroundColor: isActing ? "var(--secondary)" : "var(--primary)", color: "#fff", border: "none", fontWeight: 600, fontSize: "12px", cursor: isActing ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                      <Navigation size={13} /> {isActing ? "…" : "Start Delivery"}
                    </button>
                  )}
                  {req.status === "in_transit" && (
                    <button onClick={() => handleDelivered(req._id)} disabled={isActing}
                      style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px", borderRadius: "8px", backgroundColor: isActing ? "var(--secondary)" : "var(--success)", color: "#fff", border: "none", fontWeight: 600, fontSize: "12px", cursor: isActing ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
                      <CheckCircle2 size={13} /> {isActing ? "…" : "Mark Delivered"}
                    </button>
                  )}
                  <Link to="/volunteer/tasks"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--secondary)", fontSize: "11px", fontWeight: 500, textDecoration: "none" }}>
                    Full Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default VolunteerDashboard;
