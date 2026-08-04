import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Phone, Clock, CheckCircle, XCircle, Loader2, ArrowLeft, User, Truck, ShieldCheck } from "lucide-react";
import { requestsApi } from "../../services/requestsApi.js";
import type { ReliefRequest, RequestStatus } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import StatusBadge from "../../components/StatusBadge.js";
import Card from "../../components/Card.js";

const URGENCY_COLOR: Record<string, string> = {
  low: "var(--success)", medium: "var(--warning)",
  high: "var(--danger)", critical: "#7c3aed",
};

const CATEGORY_ICON: Record<string, string> = {
  food: "🍱", water: "💧", medical: "🏥", shelter: "🏠",
  clothing: "👕", rescue: "🚨", other: "📦",
};

interface TimelineStep {
  icon: React.ReactNode;
  title: string;
  time?: string;
  color: string;
  done: boolean;
}

function buildTimeline(req: ReliefRequest): TimelineStep[] {
  const statusOrder: RequestStatus[] = [
    "pending_verification", "verified", "assigned", "in_progress", "resolved",
  ];
  const currentIdx = statusOrder.indexOf(req.status as RequestStatus);

  const steps: TimelineStep[] = [
    {
      icon: <Clock size={16} />,
      title: "Request Submitted",
      time: new Date(req.createdAt).toLocaleString(),
      color: "var(--primary)",
      done: true,
    },
    {
      icon: <ShieldCheck size={16} />,
      title: req.status === "rejected" ? "Request Rejected" : "Verified by NGO",
      time: req.status === "rejected" ? req.verificationNote : undefined,
      color: req.status === "rejected" ? "var(--danger)" : "var(--success)",
      done: currentIdx >= 1 || req.status === "rejected",
    },
    {
      icon: <User size={16} />,
      title: req.assignedToName ? `Assigned to ${req.assignedToName}` : "Volunteer Assigned",
      color: "var(--primary)",
      done: currentIdx >= 2,
    },
    {
      icon: <Truck size={16} />,
      title: "Relief in Progress",
      color: "var(--warning)",
      done: currentIdx >= 3,
    },
    {
      icon: <CheckCircle size={16} />,
      title: "Resolved",
      color: "var(--success)",
      done: req.status === "resolved" || req.status === "closed",
    },
  ];

  return steps;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<ReliefRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { navigate("/requests"); return; }
    requestsApi.getById(id)
      .then(setRequest)
      .catch(() => setError("Could not load request details. Check the server is running."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "240px", gap: "12px", color: "var(--secondary)" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
          Loading request details…
        </div>
      </PageContainer>
    );
  }

  if (error || !request) {
    return (
      <PageContainer>
        <div style={{ padding: "24px", borderRadius: "12px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", color: "var(--danger)", textAlign: "center" }}>
          <XCircle size={32} style={{ marginBottom: "12px" }} />
          <p style={{ margin: 0 }}>{error || "Request not found."}</p>
          <Link to="/requests" style={{ display: "inline-block", marginTop: "16px", color: "var(--primary)", fontWeight: 600, fontSize: "14px" }}>
            ← Back to My Requests
          </Link>
        </div>
      </PageContainer>
    );
  }

  const urgencyColor = URGENCY_COLOR[request.urgency] ?? "var(--secondary)";
  const timeline = buildTimeline(request);

  return (
    <PageContainer>
      {/* Back + header */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={() => navigate("/requests")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "16px" }}
        >
          <ArrowLeft size={15} /> Back to My Requests
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span style={{ fontSize: "28px" }}>{CATEGORY_ICON[request.category] ?? "📦"}</span>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>
                {request.category.replace("_", " ")} Request
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)" }}>
              ID: <code style={{ fontSize: "12px" }}>{request._id}</code> · Submitted {timeAgo(request.createdAt)}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Request details */}
        <Card title="Request Details">
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Urgency</span>
              <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: urgencyColor, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, color: urgencyColor, textTransform: "capitalize", fontSize: "15px" }}>
                  {request.urgency}
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Description</span>
              <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--text-h)", lineHeight: 1.6 }}>{request.description}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                <MapPin size={14} />
                <span>{request.location}</span>
              </div>
              {request.contactNumber && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                  <Phone size={14} />
                  <span>{request.contactNumber}</span>
                </div>
              )}
              {request.createdByName && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                  <User size={14} />
                  <span>Submitted by {request.createdByName}</span>
                </div>
              )}
            </div>

            {request.status === "rejected" && request.verificationNote && (
              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--danger)" }}>
                  <strong>Rejected:</strong> {request.verificationNote}
                </p>
              </div>
            )}

            {request.imageUrl && (
              <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5000"}${request.imageUrl}`}
                  alt="Attached evidence"
                  style={{ width: "100%", maxHeight: "240px", objectFit: "cover", display: "block" }}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Timeline */}
        <Card title="Progress Timeline">
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {timeline.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingBottom: i < timeline.length - 1 ? "20px" : "0", position: "relative" }}>
                {i < timeline.length - 1 && (
                  <div style={{
                    position: "absolute", left: "19px", top: "36px", width: "2px",
                    height: "calc(100% - 16px)",
                    backgroundColor: step.done && timeline[i + 1].done ? step.color : "var(--border)",
                    opacity: step.done ? 1 : 0.3,
                  }} />
                )}
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: step.done ? `${step.color}18` : "var(--bg)",
                  border: `2px solid ${step.done ? step.color : "var(--border)"}`,
                  color: step.done ? step.color : "var(--secondary)",
                  position: "relative", zIndex: 1,
                }}>
                  {step.icon}
                </div>
                <div style={{ paddingTop: "8px" }}>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: step.done ? 600 : 400, color: step.done ? "var(--text-h)" : "var(--secondary)" }}>
                    {step.title}
                  </p>
                  {step.time && (
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--secondary)" }}>{step.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </PageContainer>
  );
};

export default RequestDetails;
