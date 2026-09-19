import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Home, Building2, HandHelping, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import type { UserRole } from "../../types/index.js";
import { Helmet } from "react-helmet-async";
import { DotPattern } from "@/registry/magicui/dot-pattern";

const ROLES: { value: UserRole; label: string; Icon: React.ElementType; hint: string }[] = [
  { value: "citizen",   label: "Citizen",   Icon: Home,        hint: "Request relief" },
  { value: "ngo",       label: "NGO",       Icon: Building2,   hint: "Coordinate aid" },
  { value: "volunteer", label: "Volunteer", Icon: HandHelping,  hint: "Deliver aid" },
];

const inpStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px 18px",
  borderRadius: "14px",
  border: "1px solid var(--border)",
  fontSize: "14.5px",
  outline: "none",
  boxSizing: "border-box",
  color: "var(--text-h)",
  backgroundColor: "var(--input-bg)",
  transition: "all 0.2s ease",
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
  const { register, isAuthenticated, getDashboardPath } = useAuth();
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

  React.useEffect(() => {
    if (isAuthenticated) navigate(getDashboardPath(), { replace: true });
  }, [isAuthenticated, navigate, getDashboardPath]);

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
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", backgroundColor: "var(--bg)", overflow: "hidden" }}>
      <DotPattern style={{ opacity: 0.3 }} />
      <Helmet>
        <title>Create Account | Disaster Platform</title>
        <meta name="description" content="Join the disaster relief network as a citizen, NGO, or volunteer." />
      </Helmet>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "520px" }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link
            to="/home"
            style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--text-h)",
              fontFamily: "var(--heading)",
              letterSpacing: "-0.5px",
              textDecoration: "none",
              display: "inline-block",
              marginBottom: "8px",
            }}
          >
            Disaster Platform
          </Link>
          <p style={{ margin: 0, fontSize: "15px", color: "var(--secondary)" }}>
            Create your account to join the operations network
          </p>
        </div>

        {/* Main Card */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Role Tiles */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "12px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                I am joining as
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                {ROLES.map(({ value, label, Icon, hint }) => {
                  const active = role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setRole(value); setError(""); }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        padding: "14px 10px",
                        borderRadius: "14px",
                        border: `2px solid ${active ? "var(--primary)" : "var(--border)"}`,
                        backgroundColor: active ? "var(--accent-bg)" : "var(--bg)",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      <Icon size={20} color={active ? "var(--primary)" : "var(--secondary)"} />
                      <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "var(--heading)", color: active ? "var(--primary)" : "var(--text-h)" }}>{label}</span>
                      <span style={{ fontSize: "10px", color: "var(--secondary)", lineHeight: 1.2 }}>{hint}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                Full Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setError(""); }}
                placeholder="Your full name"
                autoComplete="name"
                style={inpStyle}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                Email Address <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                style={inpStyle}
              />
            </div>

            {/* NGO Org Name */}
            {role === "ngo" && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                  Organization Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => { setOrgName(e.target.value); setError(""); }}
                  placeholder="e.g. Relief Foundation"
                  style={inpStyle}
                />
              </div>
            )}

            {/* District */}
            {(role === "ngo" || role === "volunteer") && (
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                  District <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <select
                  value={district}
                  onChange={e => { setDistrict(e.target.value); setError(""); }}
                  style={inpStyle}
                >
                  <option value="" disabled>Select District</option>
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Volunteer Profession */}
            {role === "volunteer" && (
              <>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                    Profession / Skills <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <select
                    value={profession}
                    onChange={e => { setProfession(e.target.value); setError(""); }}
                    style={inpStyle}
                  >
                    <option value="" disabled>Select Profession</option>
                    {PROFESSIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {profession === "Other" && (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                      Specify Profession <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={otherProfession}
                      onChange={e => { setOtherProfession(e.target.value); setError(""); }}
                      placeholder="e.g. Electrician"
                      style={inpStyle}
                    />
                  </div>
                )}
              </>
            )}

            {/* Phone */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                Phone <span style={{ fontSize: "11px", color: "var(--secondary)", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                style={inpStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={pass}
                  onChange={e => { setPass(e.target.value); setError(""); }}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  style={{ ...inpStyle, paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: 0 }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "12px 14px", borderRadius: "10px", backgroundColor: "var(--danger-bg)", border: "1px solid var(--danger-border)", color: "var(--danger)", fontSize: "13px" }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                backgroundColor: busy ? "var(--secondary)" : "var(--primary)",
                color: "#ffffff",
                fontWeight: 700,
                fontFamily: "var(--heading)",
                fontSize: "14px",
                cursor: busy ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: "var(--shadow-sm)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {busy ? "Creating account…" : "Create Account"} <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Sign-in link */}
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
