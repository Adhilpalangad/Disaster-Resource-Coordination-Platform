import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, RefreshCw, MapPin, Clock, Trash2, Eye, AlertCircle,
  Utensils, Droplets, HeartPulse, Home, AlertTriangle, Truck, Package,
  CheckCircle2, Users,
} from "lucide-react";
import { useAuth }      from "../../context/AuthContext.js";
import { requestsApi }  from "../../services/requestsApi.js";
import type { ReliefRequest, RequestStatus, UrgencyLevel, RequestCategory } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import StatusBadge   from "../../components/StatusBadge.js";
import EmptyState    from "../../components/EmptyState.js";

// ── Helpers ────────────────────────────────────────────────────────────────────

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  low: "var(--success)", medium: "var(--warning)", high: "var(--danger)", critical: "#7c3aed",
};

const CATEGORY_ICONS: Record<RequestCategory, React.ElementType> = {
  food: Utensils, water: Droplets, medicine: HeartPulse,
  shelter: Home, rescue: AlertTriangle, transportation: Truck, other: Package,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const DELETEABLE_STATUSES: RequestStatus[] = ["pending", "pending_verification"];

const STATUS_GROUPS = {
  pending:  ["pending", "location_routed", "ngo_assigned", "pending_verification"] as RequestStatus[],
  active:   ["ngo_accepted", "verified", "resources_reserved", "volunteer_assigned", "in_transit", "delivered", "assigned", "in_progress"] as RequestStatus[],
  completed:["completed", "resolved"] as RequestStatus[],
};

// ── Component ─────────────────────────────────────────────────────────────────

export const MyRequests: React.FC = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [requests,     setRequests]     = useState<ReliefRequest[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [deleting,     setDeleting]     = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterUrgency,setFilterUrgency]= useState<string>("");

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const data = await requestsApi.getAll({ createdBy: user.id });
      setRequests(data);
    } catch {
      setError("Could not load your requests. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleDelete = async (id: string, status: RequestStatus) => {
    if (!DELETEABLE_STATUSES.includes(status)) {
      alert("Only requests still pending (not yet routed) can be withdrawn.");
      return;
    }
    if (!confirm("Withdraw this request? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await requestsApi.remove(id);
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  // Confirm delivery from tracking view
  const handleConfirm = async (id: string) => {
    if (!confirm("Confirm that your relief was delivered successfully?")) return;
    try {
      const updated = await requestsApi.confirmDelivery(id);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
    } catch {
      alert("Confirmation failed. Please try again.");
    }
  };

  const filtered = requests.filter((r) => {
    if (filterStatus  && r.status  !== filterStatus)  return false;
    if (filterUrgency && r.urgency !== filterUrgency) return false;
    return true;
  });

  const pendingCount    = requests.filter((r) => STATUS_GROUPS.pending.includes(r.status as RequestStatus)).length;
  const activeCount     = requests.filter((r) => STATUS_GROUPS.active.includes(r.status as RequestStatus)).length;
  const completedCount  = requests.filter((r) => STATUS_GROUPS.completed.includes(r.status as RequestStatus)).length;

  return (
    <PageContainer>
      <PageHeader
        title="My Relief Requests"
        description="Track the status of all needs you have submitted."
        breadcrumbs={[{ label: "Dashboard", path: "/dashboard" }, { label: "My Requests" }]}
        actions={
          <button onClick={() => navigate("/requests/create")}
            style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "var(--primary)", color: "#fff", border: "none", padding: "9px 18px", borderRadius: "9px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
            <Plus size={16} /> Submit Request
          </button>
        }
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Pending / Routing",  value: pendingCount,   color: "var(--warning)" },
          { label: "Active / Assigned",  value: activeCount,    color: "#7c3aed" },
          { label: "Completed",          value: completedCount, color: "var(--success)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px 20px", boxShadow: "var(--shadow)" }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "18px", flexWrap: "wrap" }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", fontSize: "13px", color: "var(--text-h)" }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="location_routed">Routing</option>
          <option value="ngo_assigned">NGO Assigned</option>
          <option value="ngo_accepted">NGO Accepted</option>
          <option value="verified">Verified</option>
          <option value="resources_reserved">Resources Reserved</option>
          <option value="volunteer_assigned">Volunteer Assigned</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="escalated">Escalated</option>
        </select>

        <select value={filterUrgency} onChange={(e) => setFilterUrgency(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", fontSize: "13px", color: "var(--text-h)" }}>
          <option value="">All Urgency</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <button onClick={fetchRequests}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "110px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Plus size={32} />}
          title={requests.length === 0 ? "No requests yet" : "No requests match the current filters"}
          description={requests.length === 0 ? "Submit your first relief request to get started." : "Try clearing the filters above."}
          action={requests.length === 0 ? (
            <Link to="/requests/create" style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "var(--primary)", color: "#fff", borderRadius: "9px", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>
              Submit a Request
            </Link>
          ) : undefined}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((req) => {
            const urgColor  = URGENCY_COLOR[req.urgency] ?? "var(--secondary)";
            const Icon      = CATEGORY_ICONS[req.category as RequestCategory] ?? Package;
            const canDelete = DELETEABLE_STATUSES.includes(req.status as RequestStatus);
            const canConfirm= req.status === "delivered";

            return (
              <div key={req._id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: `4px solid ${urgColor}`, borderRadius: "12px", padding: "18px 20px", boxShadow: "var(--shadow)", display: "flex", gap: "16px", alignItems: "flex-start" }}>

                {/* Icon */}
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: `${urgColor}18`, color: urgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} />
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>
                      {req.category.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", backgroundColor: `${urgColor}18`, color: urgColor, textTransform: "uppercase" }}>
                      {req.urgency}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--text-h)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {req.description}
                  </p>

                  <div style={{ display: "flex", gap: "14px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} /> {req.location?.localBodyName ?? "—"}, {req.location?.districtName ?? ""}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={12} /> {req.peopleAffected} {req.peopleAffected === 1 ? "person" : "people"}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {timeAgo(req.createdAt)}
                    </span>
                    {req.assignedNGOName && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--primary)", fontWeight: 600 }}>
                        NGO: {req.assignedNGOName}
                      </span>
                    )}
                    {req.assignedVolunteerName && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#7c3aed", fontWeight: 600 }}>
                        Volunteer: {req.assignedVolunteerName}
                      </span>
                    )}
                  </div>

                  {req.status === "rejected" && req.verificationNote && (
                    <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "var(--danger)" }}>
                      <strong>Reason:</strong> {req.verificationNote}
                    </div>
                  )}
                  {req.status === "escalated" && (
                    <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)", fontSize: "12px", color: "#EA580C" }}>
                      No eligible NGO found in your area. Escalated to admin for manual assignment.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                  <Link to={`/requests/${req._id}`}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)", color: "var(--text-h)", fontWeight: 600, fontSize: "12px", textDecoration: "none" }}>
                    <Eye size={13} /> Details
                  </Link>
                  {canConfirm && (
                    <button onClick={() => handleConfirm(req._id)}
                      style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "none", backgroundColor: "var(--success)", color: "#fff", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                      <CheckCircle2 size={13} /> Confirm
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(req._id, req.status)}
                      disabled={deleting === req._id}
                      style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--danger)", color: "var(--danger)", backgroundColor: "transparent", fontWeight: 600, fontSize: "12px", cursor: "pointer", opacity: deleting === req._id ? 0.5 : 1 }}>
                      <Trash2 size={13} /> {deleting === req._id ? "..." : "Withdraw"}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};

export default MyRequests;
