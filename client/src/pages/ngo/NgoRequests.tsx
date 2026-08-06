import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, XCircle, RefreshCw, MapPin, Phone, Clock, User,
  AlertCircle, Package, Utensils, Droplets, HeartPulse, Home,
  AlertTriangle, Truck, Users, ChevronDown, UserCheck,
} from "lucide-react";
import { useAuth }      from "../../context/AuthContext.js";
import { requestsApi }  from "../../services/requestsApi.js";
import { ngoApi }       from "../../services/ngoApi.js";
import type { ReliefRequest, UrgencyLevel, RequestCategory } from "../../types/index.js";
import PageContainer  from "../../components/PageContainer.js";
import PageHeader     from "../../components/PageHeader.js";
import StatusBadge    from "../../components/StatusBadge.js";
import EmptyState     from "../../components/EmptyState.js";

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  low: "var(--success)", medium: "var(--warning)", high: "var(--danger)", critical: "#7c3aed",
};
const CATEGORY_ICONS: Record<RequestCategory, React.ElementType> = {
  food: Utensils, water: Droplets, medicine: HeartPulse,
  shelter: Home, rescue: AlertTriangle, transportation: Truck, other: Package,
};
const DEMO_VOLUNTEERS = [
  { id: "demo-volunteer-001", name: "Sneha Pillai",  phone: "+91 98765 22222" },
  { id: "vol-field-002",      name: "Arun Kumar",    phone: "+91 90001 10002" },
  { id: "vol-field-003",      name: "Priya Suresh",  phone: "+91 90001 10003" },
];

type TabId = "incoming" | "processing" | "dispatched" | "closed";
const TABS: { id: TabId; label: string; statuses: string[] }[] = [
  { id: "incoming",   label: "Incoming",   statuses: ["ngo_assigned"] },
  { id: "processing", label: "Processing", statuses: ["ngo_accepted", "verified", "resources_reserved"] },
  { id: "dispatched", label: "Dispatched", statuses: ["volunteer_assigned", "in_transit"] },
  { id: "closed",     label: "Closed",     statuses: ["delivered", "completed", "rejected", "escalated"] },
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

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal: React.FC<{
  requestId: string;
  onConfirm: (id: string, note: string) => Promise<void>;
  onClose: () => void;
}> = ({ requestId, onConfirm, onClose }) => {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <XCircle size={20} color="var(--danger)" />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>Reject Request</h3>
        </div>
        <p style={{ margin: "0 0 14px", fontSize: "13px", color: "var(--secondary)", lineHeight: 1.5 }}>
          Provide a reason so the citizen and routing engine can act on it.
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={4}
          placeholder="e.g. Location outside operational zone. / Duplicate submission."
          style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--border)", fontSize: "13px", fontFamily: "var(--sans)", boxSizing: "border-box", resize: "vertical", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={async () => { if (!note.trim()) return; setBusy(true); await onConfirm(requestId, note.trim()); setBusy(false); }}
            disabled={!note.trim() || busy}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: !note.trim() || busy ? "var(--secondary)" : "var(--danger)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: !note.trim() || busy ? "not-allowed" : "pointer" }}
          >
            {busy ? "Rejecting…" : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Assign Volunteer Modal ────────────────────────────────────────────────────
const AssignVolunteerModal: React.FC<{
  requestId: string;
  onConfirm: (id: string, vid: string, name: string, eta: string) => Promise<void>;
  onClose: () => void;
}> = ({ requestId, onConfirm, onClose }) => {
  const [selectedId, setSelectedId] = useState(DEMO_VOLUNTEERS[0].id);
  const [customName, setCustomName] = useState("");
  const [useCustom,  setUseCustom]  = useState(false);
  const [eta,        setEta]        = useState("");
  const [busy,       setBusy]       = useState(false);

  const finalName = useCustom ? customName.trim() : (DEMO_VOLUNTEERS.find(v => v.id === selectedId)?.name ?? "");
  const finalId   = useCustom ? ("vol-" + Date.now()) : selectedId;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
    >
      <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", maxWidth: "460px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <UserCheck size={20} color="#7c3aed" />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>Assign Volunteer</h3>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!useCustom ? (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "8px" }}>Select Volunteer</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {DEMO_VOLUNTEERS.map(v => (
                  <label
                    key={v.id}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "9px", border: `1px solid ${selectedId === v.id ? "#7c3aed" : "var(--border)"}`, backgroundColor: selectedId === v.id ? "rgba(124,58,237,0.06)" : "var(--bg)", cursor: "pointer" }}
                  >
                    <input type="radio" name="vol" checked={selectedId === v.id} onChange={() => setSelectedId(v.id)} style={{ accentColor: "#7c3aed", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{v.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--secondary)" }}>{v.phone}</p>
                    </div>
                    {v.id === "demo-volunteer-001" && (
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: "rgba(5,150,105,0.1)", color: "var(--success)" }}>LINKED</span>
                    )}
                  </label>
                ))}
              </div>
              <button
                onClick={() => setUseCustom(true)}
                style={{ marginTop: "8px", background: "none", border: "none", fontSize: "12px", color: "var(--secondary)", cursor: "pointer", padding: 0, textDecoration: "underline" }}
              >
                Enter custom name
              </button>
            </div>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "6px" }}>Custom Volunteer Name</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Full name"
                style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", boxSizing: "border-box", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
              />
              <button
                onClick={() => { setUseCustom(false); setCustomName(""); }}
                style={{ marginTop: "6px", background: "none", border: "none", fontSize: "12px", color: "var(--secondary)", cursor: "pointer", padding: 0, textDecoration: "underline" }}
              >
                Choose from list
              </button>
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "6px" }}>Estimated Arrival (optional)</label>
            <input
              type="datetime-local"
              value={eta}
              onChange={e => setEta(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", boxSizing: "border-box", backgroundColor: "var(--bg)", color: "var(--text-h)" }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            Cancel
          </button>
          <button
            onClick={async () => { if (!finalName) return; setBusy(true); await onConfirm(requestId, finalId, finalName, eta); setBusy(false); }}
            disabled={!finalName || busy}
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: !finalName || busy ? "var(--secondary)" : "#7c3aed", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: !finalName || busy ? "not-allowed" : "pointer" }}
          >
            {busy ? "Assigning…" : "Assign Volunteer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export const NgoRequests: React.FC = () => {
  const { user } = useAuth();

  const [allRequests,   setAllRequests]   = useState<ReliefRequest[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget,  setRejectTarget]  = useState<string | null>(null);
  const [assignTarget,  setAssignTarget]  = useState<string | null>(null);
  const [expandedId,    setExpandedId]    = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<TabId>("incoming");

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true); setError("");
    try {
      // Get this NGO's MongoDB profile _id, then filter requests to only ours
      let ngoProfileId: string | undefined;
      try {
        const profile = await ngoApi.getMyProfile(user.id);
        ngoProfileId = profile._id;
      } catch {
        // No profile yet — show empty state, not everyone else's requests
      }
      const requests = await requestsApi.getAll(
        ngoProfileId ? { assignedNGO: ngoProfileId } : { assignedNGO: "__none__" }
      );
      setAllRequests(requests);
    } catch {
      setError("Could not load requests. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const tabRequests = allRequests.filter(r =>
    TABS.find(t => t.id === activeTab)?.statuses.includes(r.status)
  );

  const act = async (id: string, fn: () => Promise<ReliefRequest>) => {
    setActionLoading(id);
    try {
      const updated = await fn();
      setAllRequests(prev => prev.map(r => r._id === id ? updated : r));
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept    = (id: string) => act(id, () => requestsApi.accept(id));
  const handleVerify    = (id: string) => act(id, () => requestsApi.verify(id));
  const handleReserve   = (id: string) => act(id, () => requestsApi.reserveResources(id));
  const handleInTransit = (id: string) => act(id, () => requestsApi.markInTransit(id));
  const handleDelivered = (id: string) => act(id, () => requestsApi.markDelivered(id));

  const handleReject = async (id: string, note: string) => {
    setActionLoading(id);
    try {
      const updated = await requestsApi.reject(id, note);
      setAllRequests(prev => prev.map(r => r._id === id ? updated : r));
    } catch {
      alert("Rejection failed.");
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
    }
  };

  const handleAssign = async (id: string, volunteerId: string, volunteerName: string, estimatedArrival: string) => {
    setActionLoading(id);
    try {
      const updated = await requestsApi.assignVolunteer(id, {
        volunteerId,
        volunteerName,
        ...(estimatedArrival && { estimatedArrival }),
      });
      setAllRequests(prev => prev.map(r => r._id === id ? updated : r));
    } catch {
      alert("Assignment failed.");
    } finally {
      setActionLoading(null);
      setAssignTarget(null);
    }
  };

  type Btn = { label: string; color: string; fn: () => void; outline?: boolean };
  const getActions = (req: ReliefRequest): Btn[] => {
    const id = req._id;
    const b = (label: string, color: string, fn: () => void, outline = false): Btn => ({ label, color, fn, outline });
    switch (req.status) {
      case "ngo_assigned":       return [b("Accept", "var(--success)", () => handleAccept(id)), b("Reject", "var(--danger)", () => setRejectTarget(id), true)];
      case "ngo_accepted":       return [b("Verify", "var(--success)", () => handleVerify(id)), b("Reject", "var(--danger)", () => setRejectTarget(id), true)];
      case "verified":           return [b("Reserve Resources", "var(--primary)", () => handleReserve(id))];
      case "resources_reserved": return [b("Assign Volunteer",  "#7c3aed",        () => setAssignTarget(id))];
      case "volunteer_assigned": return [b("Mark In Transit",   "var(--warning)", () => handleInTransit(id))];
      case "in_transit":         return [b("Mark Delivered",    "var(--success)", () => handleDelivered(id))];
      default:                   return [];
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Request Management"
        description="Accept, verify, resource-match, and dispatch volunteers for incoming relief requests."
        breadcrumbs={[{ label: "NGO Dashboard", path: "/ngo/dashboard" }, { label: "Requests" }]}
        actions={
          <button
            onClick={fetchRequests}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "4px" }}>
        {TABS.map(t => {
          const count  = allRequests.filter(r => t.statuses.includes(r.status)).length;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "8px 10px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "13px", backgroundColor: active ? "var(--primary)" : "transparent", color: active ? "#fff" : "var(--secondary)", transition: "all 0.15s" }}
            >
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

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: "120px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : tabRequests.length === 0 ? (
        <EmptyState
          icon={<CheckCircle size={32} />}
          title={`No ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()} requests`}
          description={
            activeTab === "incoming"
              ? "No requests are currently routed to your NGO. Make sure your service areas are set up in your profile."
              : "Nothing here right now."
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tabRequests.map(req => {
            const urgColor = URGENCY_COLOR[req.urgency as UrgencyLevel] ?? "var(--secondary)";
            const Icon     = CATEGORY_ICONS[req.category as RequestCategory] ?? Package;
            const isActing = actionLoading === req._id;
            const actions  = getActions(req);
            const expanded = expandedId === req._id;

            return (
              <div
                key={req._id}
                style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: `4px solid ${urgColor}`, borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}
              >
                {/* Card header row */}
                <div style={{ padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: `${urgColor}18`, color: urgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-h)", textTransform: "capitalize" }}>{req.category}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "99px", backgroundColor: `${urgColor}18`, color: urgColor, textTransform: "uppercase" }}>{req.urgency}</span>
                      <StatusBadge status={req.status} />
                    </div>
                    <p style={{ margin: "0 0 5px", fontSize: "13px", color: "var(--text-h)", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {req.description}
                    </p>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={10} />
                        {[req.location?.localBodyName, req.location?.districtName].filter(Boolean).join(", ") || "Unknown location"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <Users size={10} /> {req.peopleAffected} {req.peopleAffected === 1 ? "person" : "people"}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <Clock size={10} /> {timeAgo(req.createdAt)}
                      </span>
                      {req.fullName && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <User size={10} /> {req.fullName}
                        </span>
                      )}
                      {req.assignedVolunteerName && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#7c3aed", fontWeight: 600 }}>
                          <UserCheck size={10} /> {req.assignedVolunteerName}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", flexShrink: 0, alignItems: "stretch" }}>
                    {actions.map((a, i) => (
                      <button
                        key={i}
                        onClick={a.fn}
                        disabled={isActing}
                        style={{ padding: "6px 11px", borderRadius: "6px", border: `1px solid ${a.color}`, backgroundColor: a.outline ? "transparent" : (isActing ? "var(--secondary)" : a.color), color: a.outline ? a.color : "#fff", fontWeight: 600, fontSize: "12px", cursor: isActing ? "not-allowed" : "pointer", opacity: isActing ? 0.6 : 1, whiteSpace: "nowrap" }}
                      >
                        {a.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setExpandedId(expanded ? null : req._id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--secondary)", fontSize: "11px", cursor: "pointer", marginTop: actions.length ? "2px" : 0 }}
                    >
                      Details <ChevronDown size={11} style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div style={{ padding: "12px 18px 14px", borderTop: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Contact</p>
                      {req.mobileNumber && (
                        <p style={{ margin: "0 0 3px", fontSize: "13px", color: "var(--text-h)", display: "flex", alignItems: "center", gap: "5px" }}>
                          <Phone size={11} /> {req.mobileNumber}
                        </p>
                      )}
                      {(req.ageGroups?.length ?? 0) > 0 && (
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--secondary)" }}>Age groups: {req.ageGroups?.join(", ")}</p>
                      )}
                      {(req.specialNeeds?.filter(s => s !== "none").length ?? 0) > 0 && (
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--danger)" }}>Special needs: {req.specialNeeds?.filter(s => s !== "none").join(", ")}</p>
                      )}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 5px", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Full Location</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-h)", lineHeight: 1.6 }}>
                        {[req.location?.wardName, req.location?.localBodyName, req.location?.talukName, req.location?.districtName, "Kerala"].filter(Boolean).join(" › ")}
                      </p>
                      {req.location?.landmark && (
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--secondary)" }}>Near: {req.location.landmark}</p>
                      )}
                    </div>
                    {req.assignedVolunteerName && (
                      <div>
                        <p style={{ margin: "0 0 5px", fontSize: "11px", fontWeight: 700, color: "var(--secondary)", textTransform: "uppercase" }}>Volunteer Assigned</p>
                        <p style={{ margin: "0 0 3px", fontSize: "13px", color: "#7c3aed", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                          <UserCheck size={11} /> {req.assignedVolunteerName}
                        </p>
                        {req.estimatedArrival && (
                          <p style={{ margin: 0, fontSize: "12px", color: "var(--secondary)" }}>
                            ETA: {new Date(req.estimatedArrival).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    )}
                    {req.status === "rejected" && req.verificationNote && (
                      <div style={{ gridColumn: "1/-1", padding: "9px 12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "12px", color: "var(--danger)" }}>
                        <strong>Rejection note:</strong> {req.verificationNote}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rejectTarget && (
        <RejectModal requestId={rejectTarget} onConfirm={handleReject} onClose={() => setRejectTarget(null)} />
      )}
      {assignTarget && (
        <AssignVolunteerModal requestId={assignTarget} onConfirm={handleAssign} onClose={() => setAssignTarget(null)} />
      )}
    </PageContainer>
  );
};

export default NgoRequests;
