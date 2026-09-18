import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageContainer from "../../components/PageContainer.js";
import Card from "../../components/Card.js";
import { supabase } from "../../lib/supabase.js";
import { Eye, EyeOff } from "lucide-react";

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isValidSession, setIsValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Supabase redirects back with tokens in the URL hash/query string.
    // onAuthStateChange fires with PASSWORD_RECOVERY event when the link is valid.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsValidSession(true);
      }
    });

    // Also check if there's already an active session (user landed on this page with a valid token)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsValidSession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const { error: sbError } = await supabase.auth.updateUser({ password });
      if (sbError) throw new Error(sbError.message);
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidSession) {
    return (
      <PageContainer maxWidth="450px">
        <div style={{ marginTop: "48px" }}>
          <Card title="Invalid Link" subtitle="This password reset link is invalid or has expired.">
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "20px" }}>
                Please request a new password reset link.
              </p>
              <Link
                to="/forgot-password"
                style={{
                  display: "inline-block",
                  backgroundColor: "var(--primary, #0284C7)",
                  color: "#fff",
                  padding: "10px 24px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Request New Link
              </Link>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="450px">
      <div style={{ marginTop: "48px" }}>
        <Card title="Set New Password" subtitle="Enter and confirm your new password">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                New Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    borderRadius: "10px",
                    border: "1px solid var(--border, #E2E8F0)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "var(--text-h)",
                    backgroundColor: "var(--card-bg, #fff)",
                  }}
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

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Confirm Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    borderRadius: "10px",
                    border: "1px solid var(--border, #E2E8F0)",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "var(--text-h)",
                    backgroundColor: "var(--card-bg, #fff)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: 0 }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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

            {message && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
                color: "#16A34A",
                fontSize: "13px",
                fontWeight: 500,
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !!message}
              style={{
                backgroundColor: isLoading || message ? "#94A3B8" : "var(--primary, #0284C7)",
                color: "#FFFFFF",
                padding: "11px",
                borderRadius: "10px",
                fontWeight: 600,
                border: "none",
                fontSize: "14px",
                cursor: isLoading || message ? "not-allowed" : "pointer",
                transition: "background-color 0.15s ease",
              }}
            >
              {isLoading ? "Updating..." : message ? "Done ✓" : "Update Password"}
            </button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ResetPassword;
