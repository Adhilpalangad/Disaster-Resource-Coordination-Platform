import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext.js";
import { Helmet } from "react-helmet-async";

interface LocationState {
  from?: { pathname: string };
}

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

export const Login: React.FC = () => {
  const { login, getDashboardPath, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = (location.state as LocationState)?.from?.pathname;

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [busy,     setBusy]     = useState(false);
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

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", backgroundColor: "var(--bg)" }}>
      <Helmet>
        <title>Sign In | Disaster Resource Coordination Platform</title>
        <meta name="description" content="Sign in to your account to access disaster relief coordination tools and manage relief requests." />
      </Helmet>
      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", backgroundColor: "var(--primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
            <ShieldCheck size={26} color="#fff" />
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 800, color: "var(--text-h)" }}>Relief Platform</h1>
          <p style={{ margin: 0, fontSize: "14px", color: "var(--secondary)" }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "28px", boxShadow: "var(--shadow)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                style={inp}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: "12px", color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
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
              {busy ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--secondary)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
