import React, { useState, useEffect, useCallback } from "react";
import {
  Building2, Mail, Phone, MapPin, Users, Clock,
  AlertCircle, CheckCircle, Edit2, Save, X, RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { ngoApi, type NGOProfileData } from "../../services/ngoApi.js";
import { getDistricts } from "../../data/keralaLocations.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import Card          from "../../components/Card.js";

const DISTRICTS = getDistricts();

// ── Stat card ─────────────────────────────────────────────────────────────────

const Stat: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div style={{ backgroundColor: "var(--bg)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px 18px" }}>
    <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>{label}</p>
    <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 700, color }}>{value}</p>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

export const NgoProfile: React.FC = () => {
  const { user } = useAuth();

  const [profile,   setProfile]   = useState<NGOProfileData | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [editing,   setEditing]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");

  // Edit state — only service areas & capacity can be self-edited
  const [editDistricts, setEditDistricts] = useState<string[]>([]);
  const [editCapacity,  setEditCapacity]  = useState(50);
  const [editTimeout,   setEditTimeout]   = useState(30);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const data = await ngoApi.getMyProfile(user.id);
      setProfile(data);
    } catch {
      setError("No NGO profile linked to your account. Contact the system administrator to have one created.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const startEdit = () => {
    if (!profile) return;
    setEditDistricts(profile.serviceAreas.districtIds);
    setEditCapacity(profile.resourceCapacity);
    setEditTimeout(profile.acceptanceTimeoutMinutes);
    setEditing(true);
    setSaveError("");
  };

  const cancelEdit = () => { setEditing(false); setSaveError(""); };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await ngoApi.update(profile._id, {
        serviceAreas: { districtIds: editDistricts, talukIds: [], localBodyIds: [] },
        resourceCapacity:         editCapacity,
        acceptanceTimeoutMinutes: editTimeout,
      });
      setProfile(updated);
      setEditing(false);
    } catch {
      setSaveError("Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggleDistrict = (id: string) =>
    setEditDistricts(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="NGO Profile" breadcrumbs={[{ label: "NGO Dashboard", path: "/ngo/dashboard" }, { label: "Profile" }]} />
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[1, 2].map(i => <div key={i} style={{ height: "120px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />)}
        </div>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <PageHeader title="NGO Profile" breadcrumbs={[{ label: "NGO Dashboard", path: "/ngo/dashboard" }, { label: "Profile" }]} />
        <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <AlertCircle size={18} color="var(--danger)" style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 600, color: "var(--danger)", fontSize: "14px" }}>Profile not found</p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", lineHeight: 1.5 }}>{error}</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const workloadPct = Math.min(100, Math.round((profile.currentWorkload / Math.max(profile.resourceCapacity, 1)) * 100));
  const coverageDistricts = DISTRICTS.filter(d => profile.serviceAreas.districtIds.includes(d.id));

  return (
    <PageContainer>
      <PageHeader
        title="NGO Profile"
        description="Your organisation details and service area configuration."
        breadcrumbs={[{ label: "NGO Dashboard", path: "/ngo/dashboard" }, { label: "Profile" }]}
        actions={
          <button onClick={fetchProfile}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Org info */}
      <Card>
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "12px", backgroundColor: profile.isActive ? "rgba(5,150,105,0.1)" : "rgba(100,116,139,0.1)", color: profile.isActive ? "var(--success)" : "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-h)" }}>{profile.orgName}</h2>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", backgroundColor: profile.isActive ? "rgba(5,150,105,0.12)" : "rgba(100,116,139,0.12)", color: profile.isActive ? "var(--success)" : "var(--secondary)", textTransform: "uppercase" }}>
                {profile.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "18px", flexWrap: "wrap", fontSize: "13px", color: "var(--secondary)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Mail size={13} /> {profile.email}</span>
              {profile.phone && <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Phone size={13} /> {profile.phone}</span>}
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Users size={13} /> Account: <code style={{ fontSize: "12px" }}>{profile.userId}</code></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginTop: "16px" }}>
        <Stat label="Active Requests"    value={profile.currentWorkload}          color="var(--primary)" />
        <Stat label="Max Capacity"       value={profile.resourceCapacity}         color="#7c3aed" />
        <Stat label="Acceptance Timeout" value={`${profile.acceptanceTimeoutMinutes} min`} color="var(--warning)" />
        <Stat label="Districts Covered"  value={profile.serviceAreas.districtIds.length} color="var(--success)" />
      </div>

      {/* Workload bar */}
      <Card title="Current Workload" style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: "10px", borderRadius: "99px", backgroundColor: "var(--border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${workloadPct}%`, borderRadius: "99px", backgroundColor: workloadPct > 80 ? "var(--danger)" : workloadPct > 50 ? "var(--warning)" : "var(--success)", transition: "width 0.4s" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", minWidth: "80px", textAlign: "right" }}>
            {profile.currentWorkload} / {profile.resourceCapacity}
          </span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--secondary)" }}>
          {workloadPct}% capacity used — {profile.resourceCapacity - profile.currentWorkload} slots available
        </p>
      </Card>

      {/* Service areas */}
      <Card
        title="Service Areas"
        style={{ marginTop: "16px" }}
        action={
          !editing
            ? <button onClick={startEdit} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "7px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                <Edit2 size={12} /> Edit
              </button>
            : <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={cancelEdit} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "7px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  <X size={12} /> Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "7px", border: "none", backgroundColor: saving ? "var(--secondary)" : "var(--success)", color: "#fff", fontWeight: 600, fontSize: "12px", cursor: saving ? "not-allowed" : "pointer" }}>
                  <Save size={12} /> {saving ? "Saving…" : "Save"}
                </button>
              </div>
        }
      >
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)" }}>
              Select the districts your organisation can service. Requests from these districts will be routed to you.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "6px" }}>
              {DISTRICTS.map(d => {
                const checked = editDistricts.includes(d.id);
                return (
                  <label key={d.id}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "7px", border: `1px solid ${checked ? "var(--primary)" : "var(--border)"}`, backgroundColor: checked ? "rgba(2,132,199,0.06)" : "var(--bg)", cursor: "pointer", fontSize: "13px", color: "var(--text-h)", fontWeight: checked ? 600 : 400 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleDistrict(d.id)}
                      style={{ accentColor: "var(--primary)", flexShrink: 0 }} />
                    {d.name}
                  </label>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "5px" }}>Max Concurrent Requests</label>
                <input type="number" min={1} value={editCapacity} onChange={e => setEditCapacity(parseInt(e.target.value) || 50)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "5px" }}>Acceptance Timeout (min)</label>
                <input type="number" min={5} value={editTimeout} onChange={e => setEditTimeout(parseInt(e.target.value) || 30)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", boxSizing: "border-box" }} />
              </div>
            </div>

            {saveError && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: "13px" }}>
                <AlertCircle size={14} /> {saveError}
              </div>
            )}
          </div>
        ) : (
          <div>
            {coverageDistricts.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <MapPin size={24} style={{ color: "var(--secondary)", marginBottom: "8px" }} />
                <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)" }}>No service districts configured. Click Edit to add coverage areas.</p>
              </div>
            ) : (
              <>
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "var(--secondary)" }}>
                  Requests from the following <strong>{coverageDistricts.length}</strong> district{coverageDistricts.length !== 1 ? "s" : ""} will be automatically routed to your organisation:
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {coverageDistricts.map(d => (
                    <span key={d.id} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "99px", backgroundColor: "rgba(2,132,199,0.08)", color: "var(--primary)", fontSize: "13px", fontWeight: 600 }}>
                      <MapPin size={11} /> {d.name}
                    </span>
                  ))}
                </div>
                {profile.serviceAreas.talukIds.length > 0 && (
                  <p style={{ margin: "12px 0 0", fontSize: "12px", color: "var(--secondary)" }}>
                    Also covers {profile.serviceAreas.talukIds.length} specific taluk{profile.serviceAreas.talukIds.length !== 1 ? "s" : ""} (admin-configured).
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </Card>

      {!profile.isActive && (
        <div style={{ marginTop: "16px", padding: "14px 18px", borderRadius: "12px", backgroundColor: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)", display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <AlertCircle size={16} color="#EA580C" style={{ flexShrink: 0, marginTop: "1px" }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", lineHeight: 1.5 }}>
            Your organisation is currently <strong>inactive</strong> and will not receive automatic request routing. Contact the system administrator to reactivate your account.
          </p>
        </div>
      )}

      {profile.isActive && coverageDistricts.length > 0 && (
        <div style={{ marginTop: "16px", padding: "14px 18px", borderRadius: "12px", backgroundColor: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)" }}>
            Your organisation is <strong>active</strong> and will receive requests from <strong>{coverageDistricts.map(d => d.name).join(", ")}</strong>.
          </p>
        </div>
      )}
    </PageContainer>
  );
};

export default NgoProfile;
