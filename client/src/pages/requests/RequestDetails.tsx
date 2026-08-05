import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin, Phone, Clock, CheckCircle, XCircle, Loader2, ArrowLeft,
  User, Truck, ShieldCheck, AlertCircle, Navigation, Users,
  Building2, Compass, CheckCircle2,
} from "lucide-react";
import { requestsApi }  from "../../services/requestsApi.js";
import type { ReliefRequest, RequestStatus } from "../../types/index.js";
import PageContainer  from "../../components/PageContainer.js";
import StatusBadge    from "../../components/StatusBadge.js";
import Card           from "../../components/Card.js";

const URGENCY_COLOR: Record<string, string> = {
  low: "var(--success)", medium: "var(--warning)",
  high: "var(--danger)", critical: "#7c3aed",
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

function fmt(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface TimelineStep {
  icon:  React.ReactNode;
  label: string;
  detail?: string;
  color: string;
  done:  boolean;
}

function buildTimeline(req: ReliefRequest): TimelineStep[] {
  const s = req.status as RequestStatus;

  const ORDERED: RequestStatus[] = [
    "pending", "location_routed", "ngo_assigned", "ngo_accepted",
    "verified", "resources_reserved", "volunteer_assigned",
    "in_transit", "delivered", "completed",
  ];
  const idx = ORDERED.indexOf(s);

  return [
    {
      icon: <Clock size={15} />,
      label: "Request Submitted",
      detail: fmt(req.createdAt),
      color: "var(--primary)",
      done: true,
    },
    {
      icon: <Compass size={15} />,
      label: "Location Validated & Routing",
      detail: req.location ? `${req.location.localBodyName}, ${req.location.talukName}, ${req.location.districtName}` : undefined,
      color: "var(--primary)",
      done: idx >= 1,
    },
    {
      icon: <Building2 size={15} />,
      label: req.assignedNGOName ? `Assigned to ${req.assignedNGOName}` : "NGO Assignment",
      detail: req.ngoAssignedAt ? fmt(req.ngoAssignedAt) : undefined,
      color: "var(--primary)",
      done: idx >= 2,
    },
    {
      icon: <ShieldCheck size={15} />,
      label: s === "rejected" ? "Rejected by NGO" : "Verified & Resources Reserved",
      detail: s === "rejected" ? req.verificationNote : req.verifiedAt ? fmt(req.verifiedAt) : undefined,
      color: s === "rejected" ? "var(--danger)" : "var(--success)",
      done: idx >= 4 || s === "rejected",
    },
    {
      icon: <User size={15} />,
      label: req.assignedVolunteerName ? `Volunteer: ${req.assignedVolunteerName}` : "Volunteer Assigned",
      detail: req.volunteerAssignedAt ? fmt(req.volunteerAssignedAt) : undefined,
      color: "#7c3aed",
      done: idx >= 6,
    },
    {
      icon: <Truck size={15} />,
      label: "En Route to Location",
      detail: req.estimatedArrival ? `ETA: ${fmt(req.estimatedArrival)}` : undefined,
      color: "var(--warning)",
      done: idx >= 7,
    },
    {
      icon: <CheckCircle size={15} />,
      label: s === "completed" ? "Completed & Confirmed" : "Delivered — Awaiting Confirmation",
      detail: req.completedAt ? fmt(req.completedAt) : req.deliveredAt ? fmt(req.deliveredAt) : undefined,
      color: "var(--success)",
      done: idx >= 8,
    },
  ];
}

export const RequestDetails: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request,  setRequest]  = useState<ReliefRequest | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!id) { navigate("/requests"); return; }
    requestsApi.getById(id)
      .then(setRequest)
      .catch(() => setError("Could not load request details."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleConfirmDelivery = async () => {
    if (!request) return;
    setConfirming(true);
    try {
      const updated = await requestsApi.confirmDelivery(request._id);
      setRequest(updated);
    } catch {
      alert("Confirmation failed. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "240px", gap: "12px", color: "var(--secondary)" }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
          Loading request details…
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
            Back to My Requests
          </Link>
        </div>
      </PageContainer>
    );
  }

  const urgColor = URGENCY_COLOR[request.urgency] ?? "var(--secondary)";
  const timeline = buildTimeline(request);

  return (
    <PageContainer>
      {/* Back + title */}
      <div style={{ marginBottom: "24px" }}>
        <button onClick={() => navigate("/requests")}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--secondary)", fontWeight: 600, fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "16px" }}>
          <ArrowLeft size={15} /> Back to My Requests
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>
              {request.category.replace("_", " ")} Request
            </h1>
            <p style={{ margin: 0, fontSize: "12px", color: "var(--secondary)" }}>
              ID: <code style={{ fontSize: "11px" }}>{request._id.slice(-8).toUpperCase()}</code> · Submitted {timeAgo(request.createdAt)}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Confirm delivery banner */}
      {request.status === "delivered" && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderRadius: "10px", backgroundColor: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.25)", marginBottom: "20px" }}>
          <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", flex: 1 }}>
            Relief has been marked as delivered. Please confirm receipt to close this request.
          </p>
          <button onClick={handleConfirmDelivery} disabled={confirming}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--success)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: confirming ? "not-allowed" : "pointer", flexShrink: 0 }}>
            {confirming ? "Confirming…" : "Confirm Receipt"}
          </button>
        </div>
      )}

      {/* Escalated banner */}
      {request.status === "escalated" && (
        <div style={{ padding: "13px 16px", borderRadius: "10px", backgroundColor: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.22)", display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "20px" }}>
          <AlertCircle size={15} style={{ color: "#EA580C", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", lineHeight: 1.5 }}>
            No NGO was available in your area. This request has been escalated to the system administrator for manual assignment. You will receive an update shortly.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>

        {/* Request details card */}
        <Card title="Request Details">
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Category</span>
                <p style={{ margin: "5px 0 0", fontSize: "14px", fontWeight: 600, color: "var(--text-h)", textTransform: "capitalize" }}>{request.category}</p>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Urgency</span>
                <div style={{ margin: "5px 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: urgColor }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: urgColor, textTransform: "capitalize" }}>{request.urgency}</span>
                </div>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Description</span>
              <p style={{ margin: "6px 0 0", fontSize: "14px", color: "var(--text-h)", lineHeight: 1.6 }}>{request.description}</p>
            </div>

            {request.disasterName && (
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Linked Disaster</span>
                <p style={{ margin: "5px 0 0", fontSize: "13px", color: "var(--text-h)" }}>{request.disasterName}</p>
              </div>
            )}

            <div style={{ paddingTop: "14px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                <User size={13} /> {request.fullName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                <Phone size={13} /> {request.mobileNumber}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                <Users size={13} /> {request.peopleAffected} {request.peopleAffected === 1 ? "person" : "people"} affected
              </div>
              {request.specialNeeds?.filter((s) => s !== "none").length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                  <AlertCircle size={13} /> {request.specialNeeds.filter((s) => s !== "none").join(", ")}
                </div>
              )}
            </div>

            {/* Rejection */}
            {request.status === "rejected" && request.verificationNote && (
              <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--danger)" }}>
                  <strong>Rejected:</strong> {request.verificationNote}
                </p>
              </div>
            )}

            {/* Image */}
            {request.imageUrl && (
              <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid var(--border)" }}>
                <img
                  src={`${import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5000"}${request.imageUrl}`}
                  alt="Attached evidence"
                  style={{ width: "100%", maxHeight: "220px", objectFit: "cover", display: "block" }}
                />
              </div>
            )}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Location card */}
          <Card title="Location">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { icon: <MapPin size={13} />,    label: request.location?.fullAddress ?? [request.location?.localBodyName, request.location?.talukName, request.location?.districtName, "Kerala"].filter(Boolean).join(", ") },
                request.location?.wardName ? { icon: <MapPin size={13} />, label: `Ward: ${request.location.wardName}` } : null,
                request.location?.landmark ? { icon: <Navigation size={13} />, label: `Near: ${request.location.landmark}` } : null,
                (request.location?.gpsLat && request.location?.gpsLng) ? { icon: <Compass size={13} />, label: `GPS: ${request.location.gpsLat.toFixed(5)}, ${request.location.gpsLng.toFixed(5)}` } : null,
              ].filter(Boolean).map((row, i) => row && (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                  <span style={{ flexShrink: 0, marginTop: "2px", color: "var(--primary)" }}>{row.icon}</span>
                  <span>{row.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Assignment info */}
          {(request.assignedNGOName || request.assignedVolunteerName) && (
            <Card title="Assignment">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {request.assignedNGOName && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.15)" }}>
                    <Building2 size={14} style={{ color: "var(--primary)", flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>NGO</p>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{request.assignedNGOName}</p>
                    </div>
                  </div>
                )}
                {request.assignedVolunteerName && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <User size={14} style={{ color: "#7c3aed", flexShrink: 0 }} />
                    <div>
                      <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>Volunteer</p>
                      <p style={{ margin: "2px 0 0", fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{request.assignedVolunteerName}</p>
                      {request.estimatedArrival && (
                        <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--secondary)" }}>ETA: {fmt(request.estimatedArrival)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card title="Progress Timeline">
            <div style={{ display: "flex", flexDirection: "column" }}>
              {timeline.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingBottom: i < timeline.length - 1 ? "20px" : "0", position: "relative" }}>
                  {i < timeline.length - 1 && (
                    <div style={{ position: "absolute", left: "18px", top: "36px", width: "2px", height: "calc(100% - 16px)", backgroundColor: step.done && timeline[i + 1]?.done ? step.color : "var(--border)", opacity: step.done ? 1 : 0.3 }} />
                  )}
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: step.done ? `${step.color}18` : "var(--bg)", border: `2px solid ${step.done ? step.color : "var(--border)"}`, color: step.done ? step.color : "var(--secondary)", position: "relative", zIndex: 1 }}>
                    {step.icon}
                  </div>
                  <div style={{ paddingTop: "8px" }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: step.done ? 600 : 400, color: step.done ? "var(--text-h)" : "var(--secondary)" }}>
                      {step.label}
                    </p>
                    {step.detail && (
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--secondary)" }}>{step.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default RequestDetails;
