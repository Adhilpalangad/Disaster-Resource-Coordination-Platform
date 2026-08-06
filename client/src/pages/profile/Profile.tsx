import React, { useState } from "react";
import {
  User, Mail, Phone, Building2, MapPin, Briefcase,
  Edit2, Save, X, CheckCircle2, AlertCircle, Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import api from "../../services/api.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";

// ── Shared data (same as Register) ────────────────────────────────────────────

const DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
  "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
  "Thiruvananthapuram", "Thrissur", "Wayanad",
];

const PROFESSIONS = [
  "Doctor", "Nurse", "Engineer", "Electrician", "Plumber",
  "Driver", "Rescue Worker", "General Volunteer", "Other",
];

// ── Role metadata ──────────────────────────────────────────────────────────────

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  citizen:   { label: "Citizen",   color: "var(--primary)",  bg: "rgba(2,132,199,0.1)"   },
  ngo:       { label: "NGO",       color: "#7c3aed",         bg: "rgba(124,58,237,0.1)"  },
  volunteer: { label: "Volunteer", color: "var(--success)",  bg: "rgba(5,150,105,0.1)"   },
  admin:     { label: "Admin",     color: "var(--danger)",   bg: "rgba(239,68,68,0.1)"   },
};

const inp: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  borderRadius: "9px",
  border: "1px solid var(--border)",
  fontSize: "14px",
  backgroundColor: "var(--bg)",
  color: "var(--text-h)",
  boxSizing: "border-box",
  outline: "none",
};

// ── Field row (view mode) ──────────────────────────────────────────────────────
const Field: React.FC<{ icon: React.ReactNode; label: string; value?: string }> = ({ icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
    <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--secondary)" }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 600, color: "var(--secondary)", textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</p>
      <p style={{ margin: 0, fontSize: "14px", color: value ? "var(--text-h)" : "var(--secondary)", fontStyle: value ? "normal" : "italic" }}>
        {value || "Not set"}
      </p>
    </div>
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────────
export const Profile: React.FC = () => {
  const { user, token } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [flash,   setFlash]   = useState<{ msg: string; ok: boolean } | null>(null);

  // Determine if the stored profession is a known option or a custom "Other" value
  const initProfessionSelect = (prof?: string) => {
    if (!prof) return "";
    return PROFESSIONS.includes(prof) ? prof : "Other";
  };
  const initProfessionOther = (prof?: string) => {
    if (!prof || PROFESSIONS.includes(prof)) return "";
    return prof; // stored value is a custom string
  };

  const [form, setForm] = useState({
    name:             user?.name             ?? "",
    phone:            user?.phone            ?? "",
    organizationName: user?.organizationName ?? "",
    district:         user?.district         ?? "",
    professionSelect: initProfessionSelect(user?.profession),
    professionOther:  initProfessionOther(user?.profession),
  });

  // Keep form in sync if user changes (e.g. after page reload)
  React.useEffect(() => {
    if (user) {
      setForm({
        name:             user.name             ?? "",
        phone:            user.phone            ?? "",
        organizationName: user.organizationName ?? "",
        district:         user.district         ?? "",
        professionSelect: initProfessionSelect(user.profession),
        professionOther:  initProfessionOther(user.profession),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Resolve the final profession to save
  const resolvedProfession =
    form.professionSelect === "Other"
      ? form.professionOther.trim()
      : form.professionSelect;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setFlash({ msg: "Name is required.", ok: false }); return; }
    if (user?.role === "volunteer" && form.professionSelect === "Other" && !form.professionOther.trim()) {
      setFlash({ msg: "Please specify your profession.", ok: false }); return;
    }
    setSaving(true);
    try {
      await api.put("/auth/profile", {
        name:             form.name.trim(),
        phone:            form.phone.trim()            || undefined,
        organizationName: form.organizationName.trim() || undefined,
        district:         form.district               || undefined,
        profession:       resolvedProfession           || undefined,
      }, { headers: { Authorization: `Bearer ${token}` } });
      // Reload so AuthContext re-fetches the updated profile
      window.location.reload();
    } catch {
      setFlash({ msg: "Failed to save. Please try again.", ok: false });
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setFlash(null);
    if (user) {
      setForm({
        name:             user.name             ?? "",
        phone:            user.phone            ?? "",
        organizationName: user.organizationName ?? "",
        district:         user.district         ?? "",
        professionSelect: initProfessionSelect(user.profession),
        professionOther:  initProfessionOther(user.profession),
      });
    }
  };

  if (!user) return null;

  const role = ROLE_META[user.role] ?? ROLE_META.citizen;
  const dashboardPath =
    user.role === "ngo" ? "/ngo/dashboard" :
    user.role === "volunteer" ? "/volunteer/dashboard" :
    user.role === "admin" ? "/admin/dashboard" :
    "/dashboard";

  return (
    <PageContainer maxWidth="680px">
      <PageHeader
        title="My Profile"
        description="View and update your account information."
        breadcrumbs={[{ label: "Dashboard", path: dashboardPath }, { label: "Profile" }]}
        actions={
          !editing ? (
            <button onClick={() => setEditing(true)}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "9px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
              <Edit2 size={14} /> Edit Profile
            </button>
          ) : undefined
        }
      />

      {/* Flash */}
      {flash && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", backgroundColor: flash.ok ? "rgba(5,150,105,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${flash.ok ? "var(--success)" : "var(--danger)"}`, color: flash.ok ? "var(--success)" : "var(--danger)", fontSize: "13px", fontWeight: 500 }}>
          {flash.ok ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {flash.msg}
        </div>
      )}

      {/* Avatar + role banner */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "24px", backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", marginBottom: "20px", boxShadow: "var(--shadow)" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: role.bg, color: role.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 800, flexShrink: 0 }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "var(--text-h)" }}>{user.name}</h2>
          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "var(--secondary)" }}>{user.email}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", backgroundColor: role.bg, color: role.color, fontSize: "12px", fontWeight: 700 }}>
              <Shield size={11} /> {role.label}
            </span>
            {user.organizationName && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "99px", backgroundColor: "var(--bg)", border: "1px solid var(--border)", color: "var(--secondary)", fontSize: "12px", fontWeight: 600 }}>
                <Building2 size={11} /> {user.organizationName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* View mode */}
      {!editing && (
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "6px 24px 6px", boxShadow: "var(--shadow)" }}>
          <Field icon={<User size={15} />}      label="Full Name"    value={user.name} />
          <Field icon={<Mail size={15} />}      label="Email"        value={user.email} />
          <Field icon={<Phone size={15} />}     label="Phone"        value={user.phone} />
          {user.role === "ngo" && (
            <Field icon={<Building2 size={15} />} label="Organisation" value={user.organizationName} />
          )}
          {(user.role === "citizen" || user.role === "volunteer") && (
            <Field icon={<MapPin size={15} />}  label="District"     value={user.district} />
          )}
          {user.role === "volunteer" && (
            <Field icon={<Briefcase size={15} />} label="Profession"  value={user.profession} />
          )}
          {/* Last row — no border */}
          <div style={{ padding: "14px 0" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "var(--secondary)" }}>
              Role: <strong style={{ color: role.color }}>{role.label}</strong> · Email cannot be changed here.
            </p>
          </div>
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <form onSubmit={handleSave} style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Name */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                <User size={13} /> Full Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" style={inp} />
            </div>

            {/* Email — read-only */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--secondary)", marginBottom: "6px" }}>
                <Mail size={13} /> Email <span style={{ fontSize: "11px", fontWeight: 400 }}>(cannot change)</span>
              </label>
              <input value={user.email} disabled style={{ ...inp, opacity: 0.5, cursor: "not-allowed" }} />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                <Phone size={13} /> Phone <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--secondary)" }}>(optional)</span>
              </label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210" style={inp} />
            </div>

            {/* NGO: organisation name */}
            {user.role === "ngo" && (
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  <Building2 size={13} /> Organisation Name
                </label>
                <input value={form.organizationName} onChange={e => set("organizationName", e.target.value)} placeholder="e.g. Kerala Relief Foundation" style={inp} />
              </div>
            )}

            {/* Citizen / Volunteer / NGO: district dropdown */}
            {(user.role === "citizen" || user.role === "volunteer" || user.role === "ngo") && (
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                  <MapPin size={13} /> District
                </label>
                <select value={form.district} onChange={e => set("district", e.target.value)} style={inp}>
                  <option value="">Select District</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            {/* Volunteer: profession dropdown + "Other" text */}
            {user.role === "volunteer" && (
              <>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                    <Briefcase size={13} /> Profession / Skills
                  </label>
                  <select value={form.professionSelect} onChange={e => set("professionSelect", e.target.value)} style={inp}>
                    <option value="">Select Profession</option>
                    {PROFESSIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {form.professionSelect === "Other" && (
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, color: "var(--text-h)", marginBottom: "6px" }}>
                      <Briefcase size={13} /> Specify Profession <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      value={form.professionOther}
                      onChange={e => set("professionOther", e.target.value)}
                      placeholder="e.g. Carpenter"
                      style={inp}
                    />
                  </div>
                )}
              </>
            )}

          </div>

          {/* Flash inside form */}
          {flash && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "9px", marginTop: "16px", backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: "13px" }}>
              <AlertCircle size={14} /> {flash.msg}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={cancelEdit}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", borderRadius: "9px", border: "1px solid var(--border)", backgroundColor: "var(--bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
              <X size={14} /> Cancel
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "11px", borderRadius: "9px", border: "none", backgroundColor: saving ? "var(--secondary)" : "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "14px", cursor: saving ? "not-allowed" : "pointer" }}>
              <Save size={14} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </PageContainer>
  );
};

export default Profile;
