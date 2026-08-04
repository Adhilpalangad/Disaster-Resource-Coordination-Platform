import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import PageContainer from "../../components/PageContainer.js";
import Card from "../../components/Card.js";

interface LocationState {
  from?: { pathname: string };
}

const DEMO_CREDENTIALS = [
  { label: "Citizen", email: "citizen@demo.com", color: "#0284C7" },
  { label: "NGO", email: "ngo@demo.com", color: "#7C3AED" },
  { label: "Volunteer", email: "volunteer@demo.com", color: "#059669" },
  { label: "Admin", email: "admin@demo.com", color: "#DC2626" },
];

export const Login: React.FC = () => {
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      navigate(from ?? getDashboardPath(), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError("");
  };

  return (
    <PageContainer maxWidth="460px">
      <div style={{ marginTop: "48px" }}>
        <Card title="Sign In" subtitle="Access your disaster coordination workspace">
          {/* Demo quick-login chips */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "12px", color: "var(--secondary)", marginBottom: "8px", fontWeight: 500 }}>
              Demo accounts — click to fill credentials:
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {DEMO_CREDENTIALS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => fillDemo(d.email)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "20px",
                    border: `1px solid ${d.color}`,
                    backgroundColor: email === d.email ? d.color : "transparent",
                    color: email === d.email ? "#fff" : d.color,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Email <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--border, #E2E8F0)",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "var(--text-h)",
                  backgroundColor: "var(--card-bg, #fff)",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--border, #E2E8F0)",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "var(--text-h)",
                  backgroundColor: "var(--card-bg, #fff)",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link to="/forgot-password" style={{ fontSize: "13px", color: "var(--primary, #0284C7)", textDecoration: "none" }}>
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "var(--danger, #EF4444)",
                fontSize: "13px",
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            <button
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.15s ease",
              }}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#64748B" }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" style={{ color: "var(--primary, #0284C7)", fontWeight: 600, textDecoration: "none" }}>
              Register Here
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Login;
