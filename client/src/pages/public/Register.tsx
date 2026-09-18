import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ShieldCheck, Home, Building2, HandHelping, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import type { UserRole } from "../../types/index.js";
import { Helmet } from "react-helmet-async";

// ── Role tiles ────────────────────────────────────────────────────────────────
const ROLES: { value: UserRole; label: string; Icon: React.ElementType; hint: string }[] = [
  { value: "citizen",   label: "Citizen",   Icon: Home,        hint: "Request relief" },
  { value: "ngo",       label: "NGO",       Icon: Building2,   hint: "Coordinate aid" },
  { value: "volunteer", label: "Volunteer", Icon: HandHelping,  hint: "Deliver aid" },
];

const inp: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  color: "var(--text-h)",
  backgroundColor: "var(--card-bg)",
};

const DISTRICTS = [
  "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", 
  "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", 
  "Thrissur", "Wayanad"
];

const PROFESSIONS = [
  "Doctor", "Nurse", "Engineer", "Electrician", "Plumber", 
  "Driver", "Rescue Worker", "General Volunteer", "Other"
];

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [role,    setRole]    = useState<UserRole>("citizen");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [orgName, setOrgName] = useState("");
  const [phone,   setPhone]   = useState("");
  const [pass,    setPass]    = useState("");
  const [district, setDistrict] = useState("");
  const [profession, setProfession] = useState("");
  const [otherProfession, setOtherProfession] = useState("");
  const [error,   setError]   = useState("");
  const [busy,    setBusy]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim())  { setError("Please enter your full name.");            return; }
    if (!email.trim()) { setError("Please enter your email.");                return; }
    if (!pass)         { setError("Please create a password.");               return; }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (role === "ngo" && !orgName.trim()) {
      setError("Organization name is required for NGO accounts.");
      return;
    }
    if ((role === "ngo" || role === "volunteer") && !district) {
      setError("Please select a district.");
      return;
    }
    if (role === "volunteer") {
      if (!profession) {
        setError("Please select your profession.");
        return;
      }
      if (profession === "Other" && !otherProfession.trim()) {
        setError("Please specify your profession.");
        return;
      }
    }

    setBusy(true);
    try {
      const dashPath = await register({
        name:    name.trim(),
        email:   email.trim(),
        password: pass,
        role,
        phone:             phone.trim()   || undefined,
        organizationName:  orgName.trim() || undefined,
        district:          district || undefined,
        profession:        role === "volunteer" ? (profession === "Other" ? otherProfession.trim() : profession) : undefined,
      });
      // register() signs the user in and returns the role-specific path
      navigate(dashPath, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("already registered") || msg.includes("409")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(msg || "Registration failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backgroundColor: "var(--bg)" }}>
      <Helmet>
        <title>Create Account | Disaster Resource Coordination Platform</title>
        <meta name="description" content="Join the disaster relief network as a citizen, NGO, or volunteer to coordinate and receive emergency assistance." />
      </Helmet>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
            <ShieldCheck size={26} color="#fff" />
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "var(--text-h)" }}>Create account</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--secondary)" }}>Join the disaster relief network</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* ── Role tiles ── */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "10px", color: "var(--text-h)" }}>
                I am joining as
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {ROLES.map(({ value, label, Icon, hint }) => {
                  const active = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setRole(value); setError(""); }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                        padding: "12px 8px",
                        borderRadius: "10px",
                        border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`,
                        backgroundColor: active ? "rgba(2,132,199,0.06)" : "var(--bg)",
                        cursor: "pointer",
                        transition: "all 0.14s",
                      }}
                    >
                      <Icon size={20} color={active ? "var(--primary)" : "var(--secondary)"} />
                      <span style={{ fontSize: "13px", fontWeight: 700, color: active ? "var(--primary)" : "var(--text-h)" }}>{label}</span>
                      <span style={{ fontSize: "10px", color: "var(--secondary)", lineHeight: 1.2 }}>{hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Fields ── */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Full Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                placeholder="Your full name"
                autoComplete="name"
                style={inp}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Email <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                style={inp}
              />
            </div>

            {/* NGO only: org name */}
            {role === "ngo" && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                  Organization Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => { setOrgName(e.target.value); setError(""); }}
                  placeholder="e.g. Kerala Relief Foundation"
                  style={inp}
                />
              </div>
            )}

            {/* NGO & Volunteer: District */}
            {(role === "ngo" || role === "volunteer") && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                  District <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <select
                  value={district}
                  onChange={e => { setDistrict(e.target.value); setError(""); }}
                  style={inp}
                >
                  <option value="" disabled>Select District</option>
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Volunteer only: Profession */}
            {role === "volunteer" && (
              <>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                    Profession / Skills <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <select
                    value={profession}
                    onChange={e => { setProfession(e.target.value); setError(""); }}
                    style={inp}
                  >
                    <option value="" disabled>Select Profession</option>
                    {PROFESSIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {profession === "Other" && (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                      Specify Profession <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={otherProfession}
                      onChange={e => { setOtherProfession(e.target.value); setError(""); }}
                      placeholder="e.g. Carpenter"
                      style={inp}
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Phone <span style={{ fontSize: "11px", color: "var(--secondary)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                style={inp}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(""); }}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  style={{ ...inp, paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: 0 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", borderRadius: "8px", backgroundColor: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: "13px" }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{ padding: "12px", borderRadius: "10px", border: "none", backgroundColor: busy ? "var(--secondary)" : "var(--primary)", color: "#fff", fontWeight: 700, fontSize: "15px", cursor: busy ? "not-allowed" : "pointer", transition: "background 0.15s" }}
            >
              {busy ? "Creating account…" : "Create Account"}
            </button>
          </form>
        </div>

        {/* Sign-in link */}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
            Sign in →
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "var(--secondary)", opacity: 0.7 }}>
          Administrator accounts are created by the system admin.
        </p>
        <p style={{ textAlign: "center", marginTop: "8px", fontSize: "11px", color: "var(--secondary)", opacity: 0.7 }}>
          By creating an account, you agree to our{" "}
          <Link to="/terms" style={{ color: "var(--primary)", textDecoration: "none" }}>Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" style={{ color: "var(--primary)", textDecoration: "none" }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default Register;
