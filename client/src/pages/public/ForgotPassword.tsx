import React, { useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../../components/PageContainer.js";
import Card from "../../components/Card.js";
import { supabase } from "../../lib/supabase.js";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (sbError) throw new Error(sbError.message);
      setMessage("Password reset link sent! Please check your email inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="450px">
      <div style={{ marginTop: "48px" }}>
        <Card title="Forgot Password" subtitle="Enter your email to receive a password reset link">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "var(--text-h)" }}>
                Registered Email <span style={{ color: "var(--danger)" }}>*</span>
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
              {isLoading ? "Sending..." : message ? "Email Sent ✓" : "Send Reset Link"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#64748B" }}>
            <Link to="/login" style={{ color: "var(--primary, #0284C7)", textDecoration: "none", fontWeight: 500 }}>
              ← Return to Login
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ForgotPassword;
