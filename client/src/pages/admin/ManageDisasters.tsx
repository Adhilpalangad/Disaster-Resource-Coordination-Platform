import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, RefreshCw, Edit2, Trash2, AlertCircle,
  AlertTriangle, CheckCircle, Clock, MapPin, Database,
} from "lucide-react";
import {
  disastersApi,
  type CreateDisasterPayload,
  type UpdateDisasterPayload,
} from "../../services/disastersApi.js";
import { getDistricts } from "../../data/keralaLocations.js";
import type { Disaster } from "../../types/index.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader from "../../components/PageHeader.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const DISTRICTS = getDistricts();

const DISASTER_TYPES = ["flood", "earthquake", "cyclone", "landslide", "fire", "tsunami", "other"] as const;
const SEVERITY_LEVELS = ["low", "moderate", "high", "critical"] as const;
const STATUS_OPTIONS = ["active", "monitoring", "resolved"] as const;

const SEVERITY_COLOR: Record<string, string> = {
  low:      "var(--success)",
  moderate: "var(--warning)",
  high:     "orange",
  critical: "var(--danger)",
};

const STATUS_COLOR: Record<string, string> = {
  active:     "var(--success)",
  monitoring: "var(--warning)",
  resolved:   "var(--secondary)",
};

// ── Form Modal ────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  type: string;
  severity: string;
  status: string;
  affectedDistrictIds: string[];
  affectedDistrictNames: string[];
  startedAt: string;
  description: string;
}

const BLANK: FormState = {
  title: "", type: "flood", severity: "high", status: "active",
  affectedDistrictIds: [], affectedDistrictNames: [],
  startedAt: new Date().toISOString().slice(0, 10),
  description: "",
};

interface ModalProps {
  editing?: Disaster | null;
  onSave: (payload: CreateDisasterPayload) => Promise<void>;
  onClose: () => void;
}

const DisasterFormModal: React.FC<ModalProps> = ({ editing, onSave, onClose }) => {
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          title: editing.title,
          type: editing.type,
          severity: editing.severity,
          status: editing.status,
          affectedDistrictIds: editing.affectedDistrictIds,
          affectedDistrictNames: editing.affectedDistrictNames,
          startedAt: editing.startedAt.slice(0, 10),
          description: editing.description,
        }
      : BLANK
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const upd = (patch: Partial<FormState>) => setForm(f => ({ ...f, ...patch }));

  const toggleDistrict = (districtId: string, districtName: string) => {
    const isSelected = form.affectedDistrictIds.includes(districtId);
    if (isSelected) {
      upd({
        affectedDistrictIds: form.affectedDistrictIds.filter(d => d !== districtId),
        affectedDistrictNames: form.affectedDistrictNames.filter(n => n !== districtName),
      });
    } else {
      upd({
        affectedDistrictIds: [...form.affectedDistrictIds, districtId],
        affectedDistrictNames: [...form.affectedDistrictNames, districtName],
      });
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave({
        title: form.title.trim(),
        type: form.type,
        severity: form.severity,
        status: form.status,
        affectedDistrictIds: form.affectedDistrictIds,
        affectedDistrictNames: form.affectedDistrictNames,
        startedAt: form.startedAt || undefined,
        description: form.description.trim(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "12px", fontWeight: 600,
    color: "var(--secondary)", marginBottom: "5px",
  };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    border: "1px solid var(--border)", fontSize: "13px",
    boxSizing: "border-box", backgroundColor: "var(--bg)", color: "var(--text-h)",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: "var(--card-bg)", border: "1px solid var(--border)",
        borderRadius: "16px", width: "100%", maxWidth: "600px",
        maxHeight: "90vh", overflow: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <AlertTriangle size={18} color="var(--danger)" />
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>
            {editing ? "Edit Disaster" : "Create New Disaster"}
          </h3>
        </div>

        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              style={inputStyle} value={form.title}
              onChange={e => upd({ title: e.target.value })}
              placeholder="e.g. Wayanad Flood Relief Operation 2026"
            />
          </div>

          {/* Type / Severity / Status row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={form.type} onChange={e => upd({ type: e.target.value })}>
                {DISASTER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Severity</label>
              <select style={inputStyle} value={form.severity} onChange={e => upd({ severity: e.target.value })}>
                {SEVERITY_LEVELS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => upd({ status: e.target.value })}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label style={labelStyle}>Started Date</label>
            <input
              style={inputStyle} type="date" value={form.startedAt}
              onChange={e => upd({ startedAt: e.target.value })}
            />
          </div>

          {/* Affected Districts */}
          <div>
            <label style={labelStyle}>
              Affected Districts <span style={{ color: "var(--secondary)", fontWeight: 400 }}>(select all that apply)</span>
            </label>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))",
              gap: "6px", maxHeight: "210px", overflowY: "auto", padding: "2px",
            }}>
              {DISTRICTS.map(d => {
                const checked = form.affectedDistrictIds.includes(d.id);
                return (
                  <label key={d.id} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "7px 10px", borderRadius: "7px",
                    border: `1px solid ${checked ? "var(--danger)" : "var(--border)"}`,
                    backgroundColor: checked ? "rgba(239,68,68,0.06)" : "var(--bg)",
                    cursor: "pointer", fontSize: "13px", color: "var(--text-h)",
                    fontWeight: checked ? 600 : 400,
                  }}>
                    <input
                      type="checkbox" checked={checked}
                      onChange={() => toggleDistrict(d.id, d.name)}
                      style={{ accentColor: "var(--danger)", flexShrink: 0 }}
                    />
                    {d.name}
                  </label>
                );
              })}
            </div>
            {form.affectedDistrictIds.length > 0 && (
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--danger)", fontWeight: 600 }}>
                {form.affectedDistrictIds.length} district{form.affectedDistrictIds.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description <span style={{ color: "var(--danger)" }}>*</span></label>
            <textarea
              style={{ ...inputStyle, minHeight: "96px", resize: "vertical" }}
              value={form.description}
              onChange={e => upd({ description: e.target.value })}
              placeholder="Describe the disaster situation, affected areas, and immediate relief needs..."
            />
          </div>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 14px", borderRadius: "8px",
              backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              color: "var(--danger)", fontSize: "13px",
            }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "10px", borderRadius: "8px",
              border: "1px solid var(--border)", backgroundColor: "var(--bg)",
              color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer",
            }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 1, padding: "10px", borderRadius: "8px", border: "none",
              backgroundColor: saving ? "var(--secondary)" : "var(--danger)",
              color: "#fff", fontWeight: 700, fontSize: "13px",
              cursor: saving ? "not-allowed" : "pointer",
            }}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Disaster"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm ─────────────────────────────────────────────────────────────

interface DeleteConfirmProps {
  disaster: Disaster;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ disaster, onConfirm, onCancel }) => {
  const [busy, setBusy] = useState(false);
  return (
    <div
      style={{
        position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        backgroundColor: "var(--card-bg)", border: "1px solid var(--border)",
        borderRadius: "14px", padding: "28px 28px 24px",
        width: "100%", maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", gap: "14px", marginBottom: "16px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "10px",
            backgroundColor: "rgba(239,68,68,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Trash2 size={18} color="var(--danger)" />
          </div>
          <div>
            <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "15px", color: "var(--text-h)" }}>
              Delete Disaster?
            </p>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text-h)" }}>{disaster.title}</strong> will be permanently removed.
              This cannot be undone.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "9px", borderRadius: "8px",
            border: "1px solid var(--border)", backgroundColor: "var(--bg)",
            color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer",
          }}>
            Cancel
          </button>
          <button onClick={async () => { setBusy(true); await onConfirm(); }} disabled={busy} style={{
            flex: 1, padding: "9px", borderRadius: "8px", border: "none",
            backgroundColor: busy ? "var(--secondary)" : "var(--danger)",
            color: "#fff", fontWeight: 700, fontSize: "13px",
            cursor: busy ? "not-allowed" : "pointer",
          }}>
            {busy ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const ManageDisasters: React.FC = () => {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Disaster | null>(null);
  const [toDelete, setToDelete] = useState<Disaster | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await disastersApi.getAll();
      setDisasters(data);
    } catch {
      setError("Could not load disasters. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const handleSave = async (payload: CreateDisasterPayload) => {
    if (editing) {
      const updated = await disastersApi.update(editing._id, payload as UpdateDisasterPayload);
      setDisasters(prev => prev.map(d => d._id === editing._id ? updated : d));
    } else {
      const created = await disastersApi.create(payload);
      setDisasters(prev => [created, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await disastersApi.remove(toDelete._id);
    setDisasters(prev => prev.filter(d => d._id !== toDelete._id));
    setToDelete(null);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg("");
    try {
      const r = await disastersApi.seed();
      setSeedMsg(r.message);
      await fetchAll();
    } catch {
      setSeedMsg("Seed failed — check server logs.");
    } finally {
      setSeeding(false);
    }
  };

  // KPI counts
  const activeCount     = disasters.filter(d => d.status === "active").length;
  const monitoringCount = disasters.filter(d => d.status === "monitoring").length;
  const resolvedCount   = disasters.filter(d => d.status === "resolved").length;

  return (
    <PageContainer>
      <PageHeader
        title="Manage Disasters"
        description="Create new disaster relief campaigns, update severity ratings, and close completed initiatives."
        breadcrumbs={[{ label: "Admin Console", path: "/admin/dashboard" }, { label: "Disasters" }]}
        actions={
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={handleSeed} disabled={seeding}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                border: "1px solid var(--border)", backgroundColor: "var(--card-bg)",
                color: "var(--text-h)", fontWeight: 600, fontSize: "13px",
                cursor: seeding ? "not-allowed" : "pointer", opacity: seeding ? 0.6 : 1,
              }}
            >
              <Database size={14} /> {seeding ? "Seeding…" : "Seed Demo Data"}
            </button>
            <button
              onClick={fetchAll}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "8px",
                border: "1px solid var(--border)", backgroundColor: "var(--card-bg)",
                color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer",
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              onClick={() => { setEditing(null); setShowForm(true); }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "8px", border: "none",
                backgroundColor: "var(--danger)", color: "#fff",
                fontWeight: 600, fontSize: "13px", cursor: "pointer",
              }}
            >
              <Plus size={14} /> New Disaster
            </button>
          </div>
        }
      />

      {/* Seed message */}
      {seedMsg && (
        <div style={{
          marginBottom: "16px", padding: "10px 16px", borderRadius: "8px",
          backgroundColor: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.25)",
          color: "var(--success)", fontSize: "13px", fontWeight: 600,
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <CheckCircle size={14} /> {seedMsg}
        </div>
      )}

      {/* KPI Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total Disasters", value: disasters.length, color: "var(--primary)" },
          { label: "Active",          value: activeCount,       color: "var(--danger)" },
          { label: "Monitoring",      value: monitoringCount,   color: "var(--warning)" },
          { label: "Resolved",        value: resolvedCount,     color: "var(--success)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            backgroundColor: "var(--card-bg)", border: "1px solid var(--border)",
            borderRadius: "12px", padding: "18px 20px",
          }}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: "26px", fontWeight: 700, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: "120px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.4 }} />
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
      ) : disasters.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          backgroundColor: "var(--card-bg)", borderRadius: "16px", border: "1px solid var(--border)",
        }}>
          <AlertTriangle size={32} style={{ color: "var(--secondary)", marginBottom: "12px" }} />
          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-h)" }}>No disasters yet</p>
          <p style={{ margin: "6px 0 20px", fontSize: "13px", color: "var(--secondary)" }}>
            Create your first disaster record or seed demo data to get started.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={handleSeed} style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "9px",
              border: "1px solid var(--border)", backgroundColor: "var(--card-bg)",
              color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer",
            }}>
              <Database size={14} /> Seed Demo Data
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true); }} style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "9px", border: "none",
              backgroundColor: "var(--danger)", color: "#fff",
              fontWeight: 600, fontSize: "13px", cursor: "pointer",
            }}>
              <Plus size={14} /> Create Disaster
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {disasters.map(d => (
            <div key={d._id} style={{
              backgroundColor: "var(--card-bg)", border: "1px solid var(--border)",
              borderLeft: `4px solid ${STATUS_COLOR[d.status] ?? "var(--border)"}`,
              borderRadius: "12px", padding: "18px 20px",
              display: "flex", gap: "16px", alignItems: "flex-start",
            }}>
              {/* Icon */}
              <div style={{
                width: "42px", height: "42px", borderRadius: "10px", flexShrink: 0,
                backgroundColor: `${SEVERITY_COLOR[d.severity] ?? "var(--secondary)"}18`,
                color: SEVERITY_COLOR[d.severity] ?? "var(--secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <AlertTriangle size={18} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-h)" }}>{d.title}</span>

                  {/* Status pill */}
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                    backgroundColor: `${STATUS_COLOR[d.status] ?? "var(--secondary)"}18`,
                    color: STATUS_COLOR[d.status] ?? "var(--secondary)", textTransform: "uppercase",
                  }}>
                    {d.status}
                  </span>

                  {/* Severity pill */}
                  <span style={{
                    fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "99px",
                    backgroundColor: `${SEVERITY_COLOR[d.severity] ?? "var(--secondary)"}18`,
                    color: SEVERITY_COLOR[d.severity] ?? "var(--secondary)", textTransform: "uppercase",
                  }}>
                    {d.severity}
                  </span>

                  {/* Type pill */}
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "99px",
                    backgroundColor: "rgba(2,132,199,0.08)", color: "var(--primary)", textTransform: "capitalize",
                  }}>
                    {d.type}
                  </span>
                </div>

                {/* Meta row */}
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--secondary)", flexWrap: "wrap", marginBottom: "10px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={11} /> Started: {new Date(d.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {d.affectedDistrictNames.length > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={11} /> {d.affectedDistrictNames.join(", ")}
                    </span>
                  )}
                </div>

                {/* Description snippet */}
                <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)", lineHeight: 1.5,
                  overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {d.description}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={() => { setEditing(d); setShowForm(true); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "7px 12px", borderRadius: "7px",
                    border: "1px solid var(--border)", backgroundColor: "var(--bg)",
                    color: "var(--text-h)", fontWeight: 600, fontSize: "12px", cursor: "pointer",
                  }}
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  onClick={() => setToDelete(d)}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "7px 12px", borderRadius: "7px",
                    border: "1px solid var(--danger)", backgroundColor: "transparent",
                    color: "var(--danger)", fontWeight: 600, fontSize: "12px", cursor: "pointer",
                  }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <DisasterFormModal
          editing={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Delete Confirm */}
      {toDelete && (
        <DeleteConfirm
          disaster={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </PageContainer>
  );
};

export default ManageDisasters;
