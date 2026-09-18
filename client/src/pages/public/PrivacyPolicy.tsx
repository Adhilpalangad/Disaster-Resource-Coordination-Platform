import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Shield, Lock, Database, Mail, Globe, AlertTriangle } from "lucide-react";

const section: React.CSSProperties = {
  marginBottom: "40px",
};

const h2Style: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "var(--text-h)",
  marginBottom: "12px",
  marginTop: 0,
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const pStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.8,
  color: "var(--secondary)",
  margin: "0 0 12px 0",
};

const liStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.8,
  color: "var(--secondary)",
  marginBottom: "6px",
};

export const PrivacyPolicy: React.FC = () => {
  const lastUpdated = "August 7, 2026";

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <Helmet>
        <title>Privacy Policy | Disaster Resource Coordination Platform</title>
        <meta name="description" content="How the Disaster Resource Coordination Platform collects, uses, and protects your personal information." />
      </Helmet>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, var(--primary) 0%, #0369a1 100%)",
        padding: "64px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{
          width: "60px", height: "60px",
          borderRadius: "16px",
          backgroundColor: "rgba(255,255,255,0.2)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginBottom: "20px",
        }}>
          <Lock size={30} color="#fff" />
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: "36px", fontWeight: 800, color: "#fff" }}>
          Privacy Policy
        </h1>
        <p style={{ margin: 0, fontSize: "16px", color: "rgba(255,255,255,0.8)" }}>
          Last updated: {lastUpdated}
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "56px 24px" }}>

        {/* Intro */}
        <div style={{
          padding: "20px 24px",
          borderRadius: "12px",
          backgroundColor: "rgba(2,132,199,0.07)",
          border: "1px solid rgba(2,132,199,0.2)",
          marginBottom: "40px",
          fontSize: "15px",
          lineHeight: 1.8,
          color: "var(--secondary)",
        }}>
          The Disaster Resource Coordination Platform ("we," "our," or "us") is committed to protecting
          your privacy. This Privacy Policy explains how we collect, use, share, and safeguard your
          personal information when you use our platform. By registering or using our services, you agree
          to the practices described below.
        </div>

        {/* 1 */}
        <div style={section}>
          <h2 style={h2Style}><Database size={22} color="var(--primary)" /> 1. Information We Collect</h2>
          <p style={pStyle}>We collect the following categories of information:</p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}><strong>Account Information:</strong> Name, email address, phone number, and password hash.</li>
            <li style={liStyle}><strong>Role-Specific Data:</strong> For NGOs — organization name, district. For Volunteers — profession and district.</li>
            <li style={liStyle}><strong>Relief Requests:</strong> Type of assistance requested, location, description, and any uploaded images.</li>
            <li style={liStyle}><strong>Usage Data:</strong> IP address, browser type, pages visited, and session timestamps for security and analytics purposes.</li>
            <li style={liStyle}><strong>Communications:</strong> Messages you submit through contact forms or support.</li>
          </ul>
        </div>

        {/* 2 */}
        <div style={section}>
          <h2 style={h2Style}><Globe size={22} color="var(--primary)" /> 2. How We Use Your Information</h2>
          <p style={pStyle}>Your information is used exclusively to:</p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}>Create and manage your account and verify your identity.</li>
            <li style={liStyle}>Match relief requests with NGOs and volunteers.</li>
            <li style={liStyle}>Send notifications about disaster events and request status updates.</li>
            <li style={liStyle}>Improve platform reliability, performance, and security.</li>
            <li style={liStyle}>Comply with legal obligations and prevent fraudulent or harmful activity.</li>
          </ul>
        </div>

        {/* 3 */}
        <div style={section}>
          <h2 style={h2Style}><Shield size={22} color="var(--primary)" /> 3. Data Security</h2>
          <p style={pStyle}>
            We take security seriously. We implement industry-standard measures including:
          </p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}>All passwords are hashed using bcrypt — we never store plain-text passwords.</li>
            <li style={liStyle}>Data is transmitted over TLS/HTTPS encryption.</li>
            <li style={liStyle}>We use row-level security and access controls in our database.</li>
            <li style={liStyle}>Rate limiting and brute-force protection on all authentication endpoints.</li>
            <li style={liStyle}>Strict CORS policies limit API access to known origins.</li>
          </ul>
        </div>

        {/* 4 */}
        <div style={section}>
          <h2 style={h2Style}><AlertTriangle size={22} color="var(--primary)" /> 4. Data Sharing</h2>
          <p style={pStyle}>
            We do <strong>not</strong> sell, rent, or trade your personal information. We may share data only in these limited circumstances:
          </p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}><strong>With NGOs and Volunteers:</strong> Your relief request details (excluding password) are shared with verified NGOs and volunteers to fulfill your request.</li>
            <li style={liStyle}><strong>Service Providers:</strong> We use Supabase (database), which processes data on our behalf under strict data processing agreements.</li>
            <li style={liStyle}><strong>Legal Requirements:</strong> If required by law, court order, or governmental authority.</li>
          </ul>
        </div>

        {/* 5 */}
        <div style={section}>
          <h2 style={h2Style}><Mail size={22} color="var(--primary)" /> 5. Your Rights</h2>
          <p style={pStyle}>You have the right to:</p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li style={liStyle}><strong>Rectification:</strong> Correct any inaccurate information in your profile.</li>
            <li style={liStyle}><strong>Deletion:</strong> Request deletion of your account and associated data.</li>
            <li style={liStyle}><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
          </ul>
          <p style={{ ...pStyle, marginTop: "12px" }}>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:privacy@disasterplatform.org" style={{ color: "var(--primary)", textDecoration: "none" }}>
              privacy@disasterplatform.org
            </a>.
          </p>
        </div>

        {/* 6 */}
        <div style={section}>
          <h2 style={h2Style}>6. Cookies & Tracking</h2>
          <p style={pStyle}>
            We use session-based authentication tokens stored in memory. We do not use third-party
            advertising cookies or tracking pixels. Basic analytics may use first-party session data only.
          </p>
        </div>

        {/* 7 */}
        <div style={section}>
          <h2 style={h2Style}>7. Changes to This Policy</h2>
          <p style={pStyle}>
            We may update this policy periodically. Significant changes will be communicated via email
            or an in-app notification. Continued use of the platform after changes constitutes your
            acceptance of the updated policy.
          </p>
        </div>

        {/* Contact */}
        <div style={{
          padding: "24px",
          borderRadius: "12px",
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border)",
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 8px", fontWeight: 600, color: "var(--text-h)", fontSize: "16px" }}>
            Questions about this policy?
          </p>
          <p style={{ margin: "0 0 16px", fontSize: "14px", color: "var(--secondary)" }}>
            Contact our privacy team at{" "}
            <a href="mailto:privacy@disasterplatform.org" style={{ color: "var(--primary)", textDecoration: "none" }}>
              privacy@disasterplatform.org
            </a>
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/terms" style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
              Terms of Service →
            </Link>
            <Link to="/contact" style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
              Contact Us →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
