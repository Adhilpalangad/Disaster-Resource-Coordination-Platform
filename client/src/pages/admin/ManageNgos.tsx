import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, RefreshCw, Power, Edit2, AlertCircle,
  CheckCircle, XCircle, Building2, MapPin, Users, Clock,
} from "lucide-react";
import { ngoApi, type NGOProfileData, type CreateNGOPayload } from "../../services/ngoApi.js";
import { getDistricts } from "../../data/keralaLocations.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const DISTRICTS = getDistricts();

const DEMO_USERS = [
  { id: "demo-ngo-001",       label: "Arjun Nair (ngo@demo.com)" },
  { id: "demo-citizen-001",   label: "Riya Menon (citizen@demo.com)" },
  { id: "demo-volunteer-001", label: "Sneha Pillai (volunteer@demo.com)" },
];

// ── NGO Form Modal ────────────────────────────────────────────────────────────

interface FormState {
  userId:       string;
  orgName:      string;
  email:        string;
  phone:        string;
  districtIds:  string[];
  capacity:     number;
  timeout:      number;
}

const BLANK_FORM: FormState = {
  userId: "demo-ngo-001", orgName: "", email: "", phone: "",
  districtIds: [], capacity: 50, timeout: 30,
};

interface NgoFormModalProps {
  editing?:  NGOProfileData | null;
  onSave:    (data: CreateNGOPayload) => Promise<void>;
  onClose:   () => void;
}

const NgoFormModal: React.FC<NgoFormModalProps> = ({ editing, onSave, onClose }) => {
  const [form, setForm]     = useState<FormState>(() =>
    editing
      ? {
          userId:      editing.userId,
          orgName:     editing.orgName,
          email:       editing.email,
          phone:       editing.phone ?? "",
          districtIds: editing.serviceAreas.districtIds,
          capacity:    editing.resourceCapacity,
          timeout:     editing.acceptanceTimeoutMinutes,
        }
      : BLANK_FORM
  );
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const upd = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }));

  const toggleDistrict = (id: string) =>
    upd({ districtIds: form.districtIds.includes(id) ? form.districtIds.filter(d => d !== id) : [...form.districtIds, id] });

  const handleSave = async () => {
    if (!form.orgName.trim() || !form.email.trim()) {
      setError("Organisation name and email are required.");
      return;
    }
    if (!editing && !form.userId.trim()) {
      setError("User account ID is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave({
        userId:      form.userId,
        orgName:     form.orgName.trim(),
        email:       form.email.trim(),
        phone:       form.phone.trim() || undefined,
        serviceAreas: { districtIds: form.districtIds, talukIds: [], localBodyIds: [] },
        resourceCapacity:         form.capacity,
        acceptanceTimeoutMinutes: form.timeout,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  };

  const label: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 600, color: "var(--secondary)", marginBottom: "5px" };
  const input: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px", boxSizing: "border-box", backgroundColor: "var(--bg)", color: "var(--text-h)" };

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", width: "100%", maxWidth: "580px", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "22px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Building2 size={18} color="var(--primary)" />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>
            {editing ? "Edit NGO Profile" : "Register New NGO"}
          </h3>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Basic info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={label}>Organisation Name <span style={{ color: "var(--danger)" }}>*</span></label>
              <input style={input} value={form.orgName} onChange={e => upd({ orgName: e.target.value })} placeholder="e.g. Wayanad District Relief Foundation" />
            </div>
            <div>
              <label style={label}>Email <span style={{ color: "var(--danger)" }}>*</span></label>
              <input style={input} type="email" value={form.email} onChange={e => upd({ email: e.target.value })} placeholder="contact@ngo.org" />
            </div>
            <div>
              <label style={label}>Phone</label>
              <input style={input} type="tel" value={form.phone} onChange={e => upd({ phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>

          {/* User account link — only on create */}
          {!editing && (
            <div>
              <label style={label}>Linked User Account <span style={{ color: "var(--danger)" }}>*</span></label>
              <p style={{ margin: "0 0 8px", fontSize: "11px", color: "var(--secondary)" }}>
                The NGO staff member who will log in to manage requests.
              </p>
              <select style={input} value={form.userId} onChange={e => upd({ userId: e.target.value })}>
                {DEMO_USERS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
              </select>
              <p style={{ margin: "6px 0 0", fontSize: "11px", color: "var(--secondary)" }}>
                Or enter a custom ID:{" "}
                <input
                  style={{ ...input, display: "inline", width: "auto", padding: "4px 8px", fontSize: "12px" }}
                  placeholder="user-id"
                  value={DEMO_USERS.find(u => u.id === form.userId) ? "" : form.userId}
                  onChange={e => upd({ userId: e.target.value })}
                />
              </p>
            </div>
          )}

          {/* Service areas */}
          <div>
            <label style={label}>Service Districts <span style={{ color: "var(--secondary)" }}>(select all that apply)</span></label>
            <p style={{ margin: "0 0 10px", fontSize: "11px", color: "var(--secondary)" }}>
              The routing engine will assign requests from these districts to this NGO.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: "6px", maxHeight: "220px", overflow: "auto", padding: "2px" }}>
              {DISTRICTS.map(d => {
                const checked = form.districtIds.includes(d.id);
                return (
                  <label key={d.id}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "7px", border: `1px solid ${checked ? "var(--primary)" : "var(--border)"}`, backgroundColor: checked ? "rgba(2,132,199,0.06)" : "var(--bg)", cursor: "pointer", fontSize: "13px", color: "var(--text-h)", fontWeight: checked ? 600 : 400 }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleDistrict(d.id)}
                      style={{ accentColor: "var(--primary)", flexShrink: 0 }} />
                    {d.name}
                  </label>
                );
              })}
            </div>
            {form.districtIds.length > 0 && (
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
                {form.districtIds.length} district{form.districtIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Capacity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={label}>Max Concurrent Requests</label>
              <input style={input} type="number" min={1} max={500} value={form.capacity} onChange={e => upd({ capacity: parseInt(e.target.value) || 50 })} />
            </div>
            <div>
              <label style={label}>Acceptance Timeout (minutes)</label>
              <input style={input} type="number" min={5} max={240} value={form.timeout} onChange={e => upd({ timeout: parseInt(e.target.value) || 30 })} />
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: "13px" }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: saving ? "var(--secondary)" : "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "13px", cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Register NGO"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const ManageNgos: React.FC = () => {
  const [ngos,     setNgos]     = useState<NGOProfileData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<NGOProfileData | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await ngoApi.getAll();
      setNgos(data);
    } catch {
      setError("Could not load NGO profiles. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (payload: CreateNGOPayload) => {
    if (editing) {
      const { userId: _u, ...rest } = payload;
      void _u;
      const updated = await ngoApi.update(editing._id, rest);
      setNgos(prev => prev.map(n => n._id === editing._id ? updated : n));
    } else {
      const created = await ngoApi.create(payload);
      setNgos(prev => [created, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      const updated = await ngoApi.toggle(id);
      setNgos(prev => prev.map(n => n._id === id ? updated : n));
    } catch {
      alert("Failed to update NGO status.");
    } finally {
      setToggling(null);
    }
  };

  const activeCount   = ngos.filter(n => n.isActive).length;
  const inactiveCount = ngos.filter(n => !n.isActive).length;

  return (
    <PageContainer>
      <PageHeader
        title="NGO Management"
        description="Register organisations, assign service areas, and manage routing eligibility."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "NGOs" }]}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={fetch}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
              <Plus size={14} /> Register NGO
            </button>
          </div>
        }
      />

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total NGOs",   value: ngos.length, color: "var(--primary)" },
          { label: "Active",       value: activeCount,   color: "var(--success)" },
          { label: "Inactive",     value: inactiveCount, color: "var(--secondary)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "18px 20px" }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: "90px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.5 }} />)}
        </div>
      ) : error ? (
        <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : ngos.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border)" }}>
          <Building2 size={32} style={{ color: "var(--secondary)", marginBottom: "12px" }} />
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-h)" }}>No NGOs registered yet</p>
          <p style={{ margin: "6px 0 20px", fontSize: "13px", color: "var(--secondary)" }}>Register the first NGO to enable automatic request routing.</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px", borderRadius: "9px", border: "none", backgroundColor: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            <Plus size={14} /> Register NGO
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {ngos.map(ngo => {
            const workloadPct = Math.min(100, Math.round((ngo.currentWorkload / Math.max(ngo.resourceCapacity, 1)) * 100));
            const isTogg = toggling === ngo._id;

            return (
              <div key={ngo._id} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderLeft: `4px solid ${ngo.isActive ? "var(--success)" : "var(--border)"}`, borderRadius: "12px", padding: "18px 20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>

                {/* Icon */}
                <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: ngo.isActive ? "rgba(5,150,105,0.1)" : "rgba(100,116,139,0.1)", color: ngo.isActive ? "var(--success)" : "var(--secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 size={18} />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-h)" }}>{ngo.orgName}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px", backgroundColor: ngo.isActive ? "rgba(5,150,105,0.12)" : "rgba(100,116,139,0.12)", color: ngo.isActive ? "var(--success)" : "var(--secondary)", textTransform: "uppercase" }}>
                      {ngo.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap", marginBottom: "10px" }}>
                    <span>{ngo.email}</span>
                    {ngo.phone && <span>{ngo.phone}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={11} /> User: <code style={{ fontSize: "11px" }}>{ngo.userId}</code>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={11} /> Timeout: {ngo.acceptanceTimeoutMinutes} min
                    </span>
                  </div>

                  {/* Service areas */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                    {ngo.serviceAreas.districtIds.length === 0 ? (
                      <span style={{ fontSize: "12px", color: "var(--secondary)", fontStyle: "italic" }}>No service districts configured</span>
                    ) : (
                      <>
                        <MapPin size={12} style={{ color: "var(--secondary)", marginTop: "2px", flexShrink: 0 }} />
                        {ngo.serviceAreas.districtIds.map(id => {
                          const d = DISTRICTS.find(x => x.id === id);
                          return (
                            <span key={id} style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "99px", backgroundColor: "rgba(2,132,199,0.08)", color: "var(--primary)", fontWeight: 600 }}>
                              {d?.name ?? id}
                            </span>
                          );
                        })}
                      </>
                    )}
                  </div>

                  {/* Workload bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "11px", color: "var(--secondary)", whiteSpace: "nowrap" }}>
                      Workload: {ngo.currentWorkload}/{ngo.resourceCapacity}
                    </span>
                    <div style={{ flex: 1, height: "5px", borderRadius: "99px", backgroundColor: "var(--border)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${workloadPct}%`, borderRadius: "99px", backgroundColor: workloadPct > 80 ? "var(--danger)" : workloadPct > 50 ? "var(--warning)" : "var(--success)" }} />
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--secondary)", whiteSpace: "nowrap" }}>{workloadPct}%</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                  <button onClick={() => { setEditing(ngo); setShowForm(true); }}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "7px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => handleToggle(ngo._id)} disabled={isTogg}
                    style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "7px", border: `1px solid ${ngo.isActive ? "var(--danger)" : "var(--success)"}`, backgroundColor: "transparent", color: ngo.isActive ? "var(--danger)" : "var(--success)", fontWeight: 600, fontSize: "12px", cursor: isTogg ? "not-allowed" : "pointer", opacity: isTogg ? 0.5 : 1 }}>
                    {ngo.isActive
                      ? <><XCircle size={12} /> Deactivate</>
                      : <><CheckCircle size={12} /> Activate</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <NgoFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </PageContainer>
  );
};

export default ManageNgos;
