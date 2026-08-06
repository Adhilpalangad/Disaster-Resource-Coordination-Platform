import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import PageContainer from "../../components/PageContainer.js";
import Card from "../../components/Card.js";
import type { UserRole } from "../../types/index.js";
import { supabase } from "../../lib/supabase.js";
import api from "../../services/api.js";

interface LocationState {
  from?: { pathname: string };
}

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] = [
  { value: "citizen", label: "Citizen / Victim", description: "Submit relief requests and track assistance" },
  { value: "ngo", label: "NGO Representative", description: "Verify requests and coordinate relief operations" },
  { value: "volunteer", label: "Volunteer", description: "Accept tasks and deliver aid to those in need" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid var(--border, #E2E8F0)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  color: "var(--text-h)",
  backgroundColor: "var(--card-bg, #fff)",
};

export const Login: React.FC = () => {
  const { login, getDashboardPath, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname;

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from ?? getDashboardPath(), { replace: true });
    }
  }, [isAuthenticated, navigate, getDashboardPath, from]);

  // Step 1: credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: new user profile (shown only if login fails with "user not found")
  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [phone, setPhone] = useState("");
  const [organizationName, setOrganizationName] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ── Step 1: Try login → detect new user ────────────────────────────────────
  const handleLoginAttempt = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const dashPath = await login({ email, password });
      // Navigate immediately using the path returned from login
      navigate(from ?? dashPath, { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // Supabase returns "Invalid login credentials" for wrong password OR non-existent user.
      if (msg.toLowerCase().includes("invalid login credentials") || msg.toLowerCase().includes("invalid credentials")) {
        // Reveal the extra registration fields
        setIsNewUser(true);
        setError("Looks like you're new here! Please select your role and fill in your details to create your account.");
      } else {
        setError(msg || "Login failed.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Complete registration for new users ─────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name) {
      setError("Please enter your full name.");
      return;
    }
    if (role === "ngo" && !organizationName) {
      setError("Organization name is required for NGO accounts.");
      return;
    }
    setIsLoading(true);
    try {
      // Attempt Supabase sign-up
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role, phone, organizationName },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("rate limit")) {
          setError("Supabase email rate limit exceeded. Please see instructions to turn off email confirmation.");
        } else if (signUpError.message.toLowerCase().includes("already registered") || signUpError.message.toLowerCase().includes("already exists")) {
          setIsNewUser(false);
          setError("An account with this email already exists. Please check your password.");
        } else {
          setError(signUpError.message);
        }
        return;
      }

      if (data.session) {
        // Email confirmation is off — we get a session immediately
        try {
          await api.post(
            "/auth/sync",
            { name, email, role, phone: phone || undefined, organizationName: organizationName || undefined },
            { headers: { Authorization: `Bearer ${data.session.access_token}` } }
          );
        } catch (syncErr) {
          console.error("Sync error:", syncErr);
        }

        // Hard redirect to clear React state and ensure the app loads the new session
        const dashboardPaths: Record<UserRole, string> = {
          citizen: "/dashboard",
          ngo: "/ngo/dashboard",
          volunteer: "/volunteer/dashboard",
          admin: "/admin/dashboard",
        };
        window.location.href = dashboardPaths[role] || "/dashboard";
      } else {
        // IF THIS HAPPENS, IT MEANS EMAIL CONFIRMATION IS STILL TURNED ON IN SUPABASE!
        // So we will force login attempt anyway in case the user bypassed it, but normally it blocks.
        setError("Account created! But email confirmation is still turned on in your Supabase dashboard. Please turn it off.");
        setIsNewUser(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="480px">
      <div style={{ marginTop: "48px", marginBottom: "48px" }}>
        <Card
          title={isNewUser ? "Complete Your Profile" : "Welcome"}
          subtitle={isNewUser ? "Select your role and enter your name to finish" : "Sign in to your account or create a new one"}
        >
          <form
            onSubmit={isNewUser ? handleRegister : handleLoginAttempt}
            style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}
          >
            {/* ── Always visible: Email & Password ── */}
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Email <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setIsNewUser(false); }}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isNewUser}
                style={{ ...inputStyle, opacity: isNewUser ? 0.6 : 1 }}
              />
            </div>

            <div>
              <label htmlFor="login-password" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Min. 6 characters"
                autoComplete={isNewUser ? "new-password" : "current-password"}
                style={inputStyle}
              />
            </div>

            {!isNewUser && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link to="/forgot-password" style={{ fontSize: "13px", color: "var(--primary, #0284C7)", textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>
            )}

            {/* ── New user extra fields ── */}
            {isNewUser && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid var(--border, #E2E8F0)", paddingTop: "16px" }}>

                {/* Role selector */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px", color: "var(--text-h)" }}>
                    I am joining as <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {ROLE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          padding: "12px",
                          borderRadius: "10px",
                          border: `1px solid ${role === opt.value ? "var(--primary, #0284C7)" : "var(--border, #E2E8F0)"}`,
                          backgroundColor: role === opt.value ? "rgba(2, 132, 199, 0.05)" : "transparent",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={opt.value}
                          checked={role === opt.value}
                          onChange={() => setRole(opt.value)}
                          style={{ marginTop: "2px", accentColor: "var(--primary, #0284C7)" }}
                        />
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>{opt.label}</div>
                          <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>{opt.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Full name */}
                <div>
                  <label htmlFor="reg-name" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                    Full Name <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={inputStyle} />
                </div>

                {/* NGO only */}
                {role === "ngo" && (
                  <div>
                    <label htmlFor="reg-org" style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                      Organization Name <span style={{ color: "var(--danger)" }}>*</span>
                    </label>
                    <input id="reg-org" type="text" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="e.g. Kerala Relief Foundation" style={inputStyle} />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => { setIsNewUser(false); setError(""); }}
                  style={{ background: "none", border: "none", color: "var(--primary, #0284C7)", fontSize: "13px", cursor: "pointer", textAlign: "left", padding: 0 }}
                >
                  ← Back (try another password)
                </button>
              </div>
            )}

            {/* Error / info message */}
            {error && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: isNewUser ? "rgba(2, 132, 199, 0.08)" : "rgba(239, 68, 68, 0.08)",
                border: `1px solid ${isNewUser ? "rgba(2, 132, 199, 0.3)" : "rgba(239, 68, 68, 0.2)"}`,
                color: isNewUser ? "var(--primary, #0284C7)" : "var(--danger, #EF4444)",
                fontSize: "13px",
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? "#94A3B8" : "var(--primary, #0284C7)",
                color: "#FFFFFF",
                padding: "11px",
                borderRadius: "10px",
                fontWeight: 600,
                border: "none",
                fontSize: "14px",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              {isLoading ? (isNewUser ? "Creating Account..." : "Signing in...") : (isNewUser ? "Create Account & Sign In" : "Continue")}
            </button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Login;
