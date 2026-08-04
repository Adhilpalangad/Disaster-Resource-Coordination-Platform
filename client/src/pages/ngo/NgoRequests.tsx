import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, RefreshCw, MapPin, Phone, Clock, User, AlertCircle } from "lucide-react";
import { requestsApi } from "../../services/requestsApi.js";
import type { ReliefRequest, RequestStatus, UrgencyLevel, RequestCategory } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";
import EmptyState from "../../components/EmptyState.js";

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  low: "var(--success)", medium: "var(--warning)",
  high: "var(--danger)", critical: "#7c3aed",
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

const CATEGORY_ICON: Record<string, string> = {
  food: "🍱", water: "💧", medical: "🏥", shelter: "🏠",
  clothing: "👕", rescue: "🚨", other: "📦",
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

interface RejectModalProps {
  requestId: string;
  onConfirm: (id: string, note: string) => Promise<void>;
  onClose: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ requestId, onConfirm, onClose }) => {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!note.trim()) return;
    setSubmitting(true);
    await onConfirm(requestId, note.trim());
    setSubmitting(false);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <XCircle size={20} color="var(--danger)" />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>Reject Request</h3>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: "14px", color: "var(--secondary)", lineHeight: 1.5 }}>
          Provide a reason for rejection. This will be shown to the citizen so they can re-submit with corrections.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="e.g. Duplicate request already assigned. / Location is outside our operational zone."
          style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "13px", fontFamily: "var(--sans)", boxSizing: "border-box", resize: "vertical" }}
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!note.trim() || submitting}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: submitting || !note.trim() ? "var(--secondary)" : "var(--danger)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: !note.trim() || submitting ? "not-allowed" : "pointer" }}
          >
            {submitting ? "Rejecting…" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const NgoRequests: React.FC = () => {
  const [requests, setRequests] = useState<ReliefRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<RequestStatus | "">( "pending_verification");
  const [filterUrgency, setFilterUrgency] = useState<UrgencyLevel | "">("");
  const [filterCategory, setFilterCategory] = useState<RequestCategory | "">("");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await requestsApi.getAll({
        status: filterStatus || undefined,
        urgency: filterUrgency || undefined,
        category: filterCategory || undefined,
      });
      setRequests(data);
    } catch {
      setError("Could not load requests. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterUrgency, filterCategory]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleVerify = async (id: string) => {
    setActionLoading(id);
    try {
      const updated = await requestsApi.verify(id);
      setRequests((prev) => prev.map((r) => r._id === id ? updated : r));
    } catch {
      alert("Failed to verify. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string, note: string) => {
    setActionLoading(id);
    try {
      const updated = await requestsApi.reject(id, note);
      setRequests((prev) => prev.map((r) => r._id === id ? updated : r));
    } catch {
      alert("Failed to reject. Please try again.");
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === "pending_verification").length;
  const criticalCount = requests.filter((r) => r.urgency === "critical" || r.urgency === "high").length;
  const verifiedToday = requests.filter((r) => {
    const updated = new Date(r.updatedAt).getTime();
    return r.status === "verified" && Date.now() - updated < 86400000;
  }).length;

  return (
    <PageContainer>
      <PageHeader
        title="Verification Queue"
        description="Review and verify incoming relief requests from citizens in your zone."
        breadcrumbs={[
          { label: "NGO Dashboard", path: "/ngo/dashboard" },
          { label: "Relief Requests" },
        ]}
        actions={
          <button
            onClick={fetchRequests}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Awaiting Verification", value: pendingCount, color: "var(--warning)" },
          { label: "High / Critical Urgency", value: criticalCount, color: "var(--danger)" },
          { label: "Verified Today", value: verifiedToday, color: "var(--success)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "20px", boxShadow: "var(--shadow)" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "28px", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
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
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as RequestCategory | "")}
          style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", fontSize: "13px", color: "var(--text-h)" }}
        >
          <option value="">All Categories</option>
          <option value="food">Food</option>
          <option value="water">Water</option>
          <option value="medical">Medical</option>
          <option value="shelter">Shelter</option>
          <option value="clothing">Clothing</option>
          <option value="rescue">Rescue</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "120px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={32} />}
          title="All clear"
          description="No requests match the current filters. Change filters to see more."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {requests.map((req) => {
            const urgencyColor = URGENCY_COLOR[req.urgency];
            const isPending = req.status === "pending_verification";
            const isActing = actionLoading === req._id;

            return (
              <div
                key={req._id}
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${urgencyColor}`,
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "var(--shadow)",
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "20px" }}>{CATEGORY_ICON[req.category] ?? "📦"}</span>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>
                      {req.category.replace("_", " ")}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", backgroundColor: `${urgencyColor}18`, color: urgencyColor, textTransform: "uppercase" }}>
                      {req.urgency}
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                      backgroundColor: isPending ? "rgba(245,158,11,0.12)" : req.status === "verified" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                      color: isPending ? "var(--warning)" : req.status === "verified" ? "var(--success)" : "var(--danger)",
                    }}>
                      {STATUS_LABEL[req.status]}
                    </span>
                  </div>

                  {isPending && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleVerify(req._id)}
                        disabled={isActing}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "none", backgroundColor: "var(--success)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: isActing ? "not-allowed" : "pointer", opacity: isActing ? 0.6 : 1 }}
                      >
                        <CheckCircle size={14} /> {isActing ? "…" : "Verify"}
                      </button>
                      <button
                        onClick={() => setRejectTarget(req._id)}
                        disabled={isActing}
                        style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--danger)", backgroundColor: "transparent", color: "var(--danger)", fontWeight: 600, fontSize: "13px", cursor: isActing ? "not-allowed" : "pointer", opacity: isActing ? 0.6 : 1 }}
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p style={{ margin: "0 0 12px", fontSize: "14px", color: "var(--text-h)", lineHeight: 1.55, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                  {req.description}
                </p>

                {/* Meta */}
                <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={12} /> {req.location}
                  </span>
                  {req.contactNumber && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={12} /> {req.contactNumber}
                    </span>
                  )}
                  {req.createdByName && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <User size={12} /> {req.createdByName}
                    </span>
                  )}
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> {timeAgo(req.createdAt)}
                  </span>
                </div>

                {req.status === "rejected" && req.verificationNote && (
                  <div style={{ marginTop: "12px", padding: "8px 12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "var(--danger)" }}>
                    <strong>Rejection note:</strong> {req.verificationNote}
                  </div>
                )}

                {req.imageUrl && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5000"}${req.imageUrl}`}
                      alt="Attached evidence"
                      style={{ maxHeight: "160px", borderRadius: "8px", border: "1px solid var(--border)", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          requestId={rejectTarget}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </PageContainer>
  );
};

export default NgoRequests;
