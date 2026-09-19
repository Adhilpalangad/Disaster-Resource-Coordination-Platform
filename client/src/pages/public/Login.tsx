import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AlertCircle, Copy, Check, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import api from "../../services/api.js";
import { DotPattern } from "@/registry/magicui/dot-pattern";
import { RippleButton } from "@/registry/magicui/ripple-button";
import { BorderBeam } from "@/registry/magicui/border-beam";

interface LocationState {
  from?: { pathname: string };
}

const ADMIN_EMAIL    = "admin@kdrp.in";
const ADMIN_PASSWORD = "Admin@2024";

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

export const Login: React.FC = () => {
  const { login, getDashboardPath, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as LocationState)?.from?.pathname;

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);
  const [copied,   setCopied]   = useState<"email" | "pass" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) navigate(from ?? getDashboardPath(), { replace: true });
  }, [isAuthenticated, navigate, getDashboardPath, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Enter your email and password."); return; }
    setBusy(true);
    try {
      const dashPath = await login({ email, password });
      navigate(from ?? dashPath, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("invalid login credentials") || msg.toLowerCase().includes("invalid credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(msg || "Sign-in failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleAdminQuickLogin = async () => {
    setError("");
    setBusy(true);
    try {
      await api.post("/auth/seed-admin").catch(() => {});
      const dashPath = await login({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      navigate(from ?? dashPath, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(msg || "Admin login failed. Try running the server first.");
    } finally {
      setBusy(false);
    }
  };

  const copyToClipboard = async (text: string, field: "email" | "pass") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px", backgroundColor: "var(--bg)", overflow: "hidden" }}>
      <DotPattern style={{ opacity: 0.3 }} />
      <Helmet>
        <title>Sign In | Disaster Platform</title>
        <meta name="description" content="Sign in to access disaster relief coordination tools." />
      </Helmet>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "480px" }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
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
            Welcome back. Access your workspace.
          </p>
        </div>

        {/* ── Quick Access ── */}
        <div
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--accent-border)",
            borderRadius: "20px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", letterSpacing: "0.5px" }}>
              DEMO ADMIN ACCESS
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
            {[
              { label: "Email",    value: ADMIN_EMAIL,    field: "email" as const },
              { label: "Password", value: ADMIN_PASSWORD, field: "pass"  as const },
            ].map(row => (
              <div key={row.field} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "10px", backgroundColor: "var(--bg)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", minWidth: "60px", textTransform: "uppercase" }}>{row.label}</span>
                  <code style={{ fontSize: "13px", fontFamily: "var(--mono)", color: "var(--text-h)" }}>
                    {row.field === "pass" ? "••••••••" : row.value}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(row.value, row.field)}
                  title={`Copy ${row.label}`}
                  style={{ background: "none", border: "none", cursor: "pointer", color: copied === row.field ? "var(--success)" : "var(--secondary)", padding: "2px", display: "flex", alignItems: "center" }}
                >
                  {copied === row.field ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAdminQuickLogin}
            disabled={busy}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid var(--accent-border)",
              backgroundColor: "var(--accent-bg)",
              color: "var(--primary)",
              fontWeight: 700,
              fontFamily: "var(--heading)",
              fontSize: "13px",
              cursor: busy ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {busy ? "Authenticating…" : "Login as Admin"}
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary)", fontFamily: "var(--heading)", textTransform: "uppercase", letterSpacing: "0.5px" }}>or sign in manually</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border)" }} />
        </div>

        {/* Main Card */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px", color: "var(--text-h)", fontFamily: "var(--heading)" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                style={inpStyle}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)" }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: "12px", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <RippleButton
              type="submit"
              disabled={busy}
              rippleColor="rgba(255, 255, 255, 0.4)"
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
              }}
            >
              {busy ? "Signing in…" : "Sign In"} <ArrowRight size={16} />
            </RippleButton>
          </form>
          <BorderBeam duration={8} size={100} />
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
