import React from "react";
import PageContainer from "../../components/PageContainer.js";
import Card from "../../components/Card.js";
import { Link } from "react-router-dom";

export const ForgotPassword: React.FC = () => {
  return (
    <PageContainer maxWidth="450px">
      <div style={{ marginTop: "40px" }}>
        <Card title="Reset Password" subtitle="Enter your email to receive password reset instructions">
          {/* TODO: Developers will implement password reset workflow */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>Registered Email</label>
              <input type="email" placeholder="user@example.com" disabled style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #E2E8F0" }} />
            </div>
            <button
              disabled
              style={{
                backgroundColor: "var(--primary, #0284C7)",
                color: "#FFFFFF",
                padding: "10px",
                borderRadius: "10px",
                fontWeight: 600,
                border: "none",
                fontSize: "14px",
                opacity: 0.7,
              }}
            >
              Send Reset Link (Placeholder)
            </button>
          </div>
          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "13px" }}>
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
