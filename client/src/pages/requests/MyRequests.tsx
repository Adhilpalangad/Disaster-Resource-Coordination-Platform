import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, RefreshCw, MapPin, Clock, Trash2, Eye, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { requestsApi } from "../../services/requestsApi.js";
import type { ReliefRequest, RequestStatus, UrgencyLevel } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import EmptyState from "../../components/EmptyState.js";

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  low: "var(--success)",
  medium: "var(--warning)",
  high: "var(--danger)",
  critical: "#7c3aed",
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  pending_verification: "Pending Review",
  verified: "Verified",
  rejected: "Rejected",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  pending_verification: "var(--warning)",
  verified: "var(--info)",
  rejected: "var(--danger)",
  assigned: "var(--primary)",
  in_progress: "var(--primary)",
  resolved: "var(--success)",
  closed: "var(--secondary)",
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

const CATEGORY_ICON: Record<string, string> = {
  food: "🍱", water: "💧", medical: "🏥", shelter: "🏠",
  clothing: "👕", rescue: "🚨", other: "📦",
};

export const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<ReliefRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "">("");
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | "">("");

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
    if (status !== "pending_verification") {
      alert("Only requests still pending review can be deleted.");
      return;
    }
    if (!confirm("Delete this request? This cannot be undone.")) return;
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

  const filtered = requests.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterUrgency && r.urgency !== filterUrgency) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "pending_verification").length;
  const activeCount = requests.filter((r) => ["verified", "assigned", "in_progress"].includes(r.status)).length;
  const resolvedCount = requests.filter((r) => r.status === "resolved").length;

  return (
    <PageContainer>
      <PageHeader
        title="My Relief Requests"
        description="Track the status of all relief needs you have submitted."
        breadcrumbs={[{ label: "Dashboard", path: "/dashboard" }, { label: "My Requests" }]}
        actions={
          <button
            onClick={() => navigate("/requests/create")}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              backgroundColor: "var(--primary)", color: "#fff",
              border: "none", padding: "9px 18px", borderRadius: "9px",
              fontWeight: 600, fontSize: "14px", cursor: "pointer",
            }}
          >
            <Plus size={16} /> Submit Request
          </button>
        }
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Pending Review", value: pendingCount, color: "var(--warning)" },
          { label: "Active / Assigned", value: activeCount, color: "var(--primary)" },
          { label: "Resolved", value: resolvedCount, color: "var(--success)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            backgroundColor: "var(--card-bg)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow)",
          }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + refresh */}
      <div style={{
        display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px",
        flexWrap: "wrap",
      }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as RequestStatus | "")}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", fontSize: "13px", color: "var(--text-h)" }}
        >
          <option value="">All Statuses</option>
          {(Object.keys(STATUS_LABEL) as RequestStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>

        <select
          value={filterUrgency}
          onChange={(e) => setFilterUrgency(e.target.value as UrgencyLevel | "")}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", fontSize: "13px", color: "var(--text-h)" }}
        >
          <option value="">All Urgency</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <button
          onClick={fetchRequests}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "100px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5, animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : error ? (
        <div style={{
          padding: "16px", borderRadius: "10px",
          backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)",
          color: "var(--danger)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px",
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Plus size={32} />}
          title={requests.length === 0 ? "No requests yet" : "No requests match the filters"}
          description={requests.length === 0 ? "Submit your first relief request to get started." : "Try clearing the filters above."}
          action={requests.length === 0 ? (
            <Link
              to="/requests/create"
              style={{ display: "inline-block", padding: "10px 20px", backgroundColor: "var(--primary)", color: "#fff", borderRadius: "9px", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}
            >
              Submit a Request
            </Link>
          ) : undefined}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((req) => {
            const urgencyColor = URGENCY_COLOR[req.urgency];
            const statusColor = STATUS_COLOR[req.status];
            const canDelete = req.status === "pending_verification";

            return (
              <div
                key={req._id}
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${urgencyColor}`,
                  borderRadius: "12px",
                  padding: "18px 20px",
                  boxShadow: "var(--shadow)",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                {/* Category icon */}
                <div style={{ fontSize: "24px", flexShrink: 0, marginTop: "2px" }}>
                  {CATEGORY_ICON[req.category] ?? "📦"}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>
                      {req.category.replace("_", " ")}
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                      backgroundColor: `${urgencyColor}18`, color: urgencyColor, textTransform: "uppercase",
                    }}>
                      {req.urgency}
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                      backgroundColor: `${statusColor}18`, color: statusColor,
                    }}>
                      {STATUS_LABEL[req.status]}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 8px", fontSize: "14px", color: "var(--text-h)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {req.description}
                  </p>

                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} /> {req.location}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} /> {timeAgo(req.createdAt)}
                    </span>
                  </div>

                  {req.verificationNote && req.status === "rejected" && (
                    <div style={{ marginTop: "10px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "var(--danger)" }}>
                      <strong>Rejected:</strong> {req.verificationNote}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <Link
                    to={`/requests/${req._id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "5px",
                      padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--border)",
                      color: "var(--text-h)", fontWeight: 600, fontSize: "12px", textDecoration: "none",
                    }}
                  >
                    <Eye size={13} /> View
                  </Link>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(req._id, req.status)}
                      disabled={deleting === req._id}
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        padding: "7px 12px", borderRadius: "8px",
                        border: "1px solid var(--danger)", color: "var(--danger)",
                        backgroundColor: "transparent", fontWeight: 600, fontSize: "12px", cursor: "pointer",
                        opacity: deleting === req._id ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={13} /> {deleting === req._id ? "..." : "Delete"}
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
