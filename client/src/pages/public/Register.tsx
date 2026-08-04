import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import PageContainer from "../../components/PageContainer.js";
import Card from "../../components/Card.js";
import type { UserRole } from "../../types/index.js";

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

export const Register: React.FC = () => {
  const { register, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "citizen" as UserRole,
    phone: "",
    organizationName: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.role === "ngo" && !form.organizationName) {
      setError("Organization name is required for NGO accounts.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
        organizationName: form.organizationName || undefined,
      });
      navigate(getDashboardPath(), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="480px">
      <div style={{ marginTop: "40px", marginBottom: "40px" }}>
        <Card title="Create an Account" subtitle="Join the disaster coordination platform">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "8px" }}>

            {/* Role Selector */}
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
                      border: `1px solid ${form.role === opt.value ? "var(--primary, #0284C7)" : "var(--border, #E2E8F0)"}`,
                      backgroundColor: form.role === opt.value ? "rgba(2, 132, 199, 0.05)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={form.role === opt.value}
                      onChange={() => update("role", opt.value)}
                      style={{ marginTop: "2px", accentColor: "var(--primary, #0284C7)" }}
                    />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h)" }}>{opt.label}</div>
                      <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>{opt.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "6px" }}>
                Administrator accounts are created by the system admin.
              </p>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                  Full Name <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="John Doe"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                  Email <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="user@example.com"
                  autoComplete="email"
                  style={inputStyle}
                />
              </div>

              {form.role === "ngo" && (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                    Organization Name <span style={{ color: "var(--danger)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.organizationName}
                    onChange={(e) => update("organizationName", e.target.value)}
                    placeholder="e.g. Kerala Relief Foundation"
                    style={inputStyle}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                  Phone Number <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                  Password <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                  Confirm Password <span style={{ color: "var(--danger)" }}>*</span>
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => update("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
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
                transition: "background-color 0.15s ease",
              }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#64748B" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary, #0284C7)", fontWeight: 600, textDecoration: "none" }}>
              Log In
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Register;
