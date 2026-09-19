import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileText, AlertTriangle, CheckCircle, Scale, XCircle } from "lucide-react";

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

export const TermsOfService: React.FC = () => {
  const lastUpdated = "August 7, 2026";

  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <Helmet>
        <title>Terms of Service | Disaster Resource Coordination Platform</title>
        <meta name="description" content="Terms and conditions governing the use of the Disaster Resource Coordination Platform." />
      </Helmet>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a4f 100%)",
        padding: "64px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{
          width: "60px", height: "60px",
          borderRadius: "16px",
          backgroundColor: "rgba(255,255,255,0.15)",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          marginBottom: "20px",
        }}>
          <Scale size={30} color="#fff" />
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: "36px", fontWeight: 800, color: "#fff" }}>
          Terms of Service
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
          Please read these Terms of Service ("Terms") carefully before using the Disaster Resource
          Coordination Platform. By accessing or using the platform, you agree to be bound by these Terms.
          If you disagree with any part, please do not use the platform.
        </div>

        {/* 1 */}
        <div style={section}>
          <h2 style={h2Style}><FileText size={22} color="var(--primary)" /> 1. Platform Purpose</h2>
          <p style={pStyle}>
            This platform is a humanitarian coordination tool designed to connect citizens in need of
            disaster relief with NGOs and volunteers capable of providing assistance. The platform is
            provided on a good-faith basis and is not a substitute for official government emergency services.
          </p>
          <p style={pStyle}>
            <strong>In an emergency, always contact your local emergency services first (e.g., 112, 100, 108).</strong>
          </p>
        </div>

        {/* 2 */}
        <div style={section}>
          <h2 style={h2Style}><CheckCircle size={22} color="var(--primary)" /> 2. Eligibility & Account Registration</h2>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}>You must be at least 18 years old to create an account.</li>
            <li style={liStyle}>You agree to provide accurate, truthful, and complete registration information.</li>
            <li style={liStyle}>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li style={liStyle}>NGO accounts are subject to verification. Misrepresenting an organization is grounds for immediate termination.</li>
            <li style={liStyle}>You must notify us immediately of any unauthorized use of your account.</li>
          </ul>
        </div>

        {/* 3 */}
        <div style={section}>
          <h2 style={h2Style}><CheckCircle size={22} color="var(--primary)" /> 3. Acceptable Use</h2>
          <p style={pStyle}>You agree to use the platform only for lawful purposes. You must not:</p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}>Submit false, misleading, or fraudulent relief requests.</li>
            <li style={liStyle}>Impersonate any person, organization, or government entity.</li>
            <li style={liStyle}>Use the platform to collect or harvest other users' personal data.</li>
            <li style={liStyle}>Interfere with, disrupt, or circumvent the platform's security features.</li>
            <li style={liStyle}>Upload malicious code, viruses, or harmful files.</li>
            <li style={liStyle}>Use the platform for commercial solicitation, spam, or advertising.</li>
          </ul>
        </div>

        {/* 4 */}
        <div style={section}>
          <h2 style={h2Style}><AlertTriangle size={22} color="var(--primary)" /> 4. NGO & Volunteer Responsibilities</h2>
          <p style={pStyle}>
            NGOs and volunteers who commit to fulfilling a relief request take on a moral and reputational
            responsibility to follow through. The platform tracks response rates and completion rates.
            Consistently failing to fulfill accepted requests may result in account suspension.
          </p>
          <p style={pStyle}>
            NGOs and volunteers must operate within the bounds of local law and any applicable regulatory
            requirements for disaster relief activities.
          </p>
        </div>

        {/* 5 */}
        <div style={section}>
          <h2 style={h2Style}><XCircle size={22} color="var(--primary)" /> 5. Disclaimer of Warranties</h2>
          <p style={pStyle}>
            The platform is provided "as is" and "as available" without warranties of any kind, either
            express or implied. We do not warrant that:
          </p>
          <ul style={{ paddingLeft: "20px", margin: 0 }}>
            <li style={liStyle}>The platform will be uninterrupted or error-free at all times.</li>
            <li style={liStyle}>Information provided by users (relief requests, resource listings) is accurate or complete.</li>
            <li style={liStyle}>Any specific relief request will be fulfilled by an NGO or volunteer.</li>
          </ul>
        </div>

        {/* 6 */}
        <div style={section}>
          <h2 style={h2Style}><Scale size={22} color="var(--primary)" /> 6. Limitation of Liability</h2>
          <p style={pStyle}>
            To the fullest extent permitted by applicable law, we shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages arising from your use of, or inability
            to use, the platform or its services - including damages resulting from reliance on any
            information provided by other users of the platform.
          </p>
        </div>

        {/* 7 */}
        <div style={section}>
          <h2 style={h2Style}>7. Termination</h2>
          <p style={pStyle}>
            We reserve the right to suspend or terminate your account at our discretion, without notice,
            if you violate these Terms or engage in activity harmful to other users or the platform's
            integrity. You may also delete your account at any time via the Settings page.
          </p>
        </div>

        {/* 8 */}
        <div style={section}>
          <h2 style={h2Style}>8. Changes to Terms</h2>
          <p style={pStyle}>
            We may update these Terms from time to time. We will notify registered users of material changes
            via email. Continued use of the platform after updates constitutes acceptance of the new Terms.
          </p>
        </div>

        {/* 9 */}
        <div style={section}>
          <h2 style={h2Style}>9. Governing Law</h2>
          <p style={pStyle}>
            These Terms are governed by and construed in accordance with the laws of India. Any disputes
            arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Kerala, India.
          </p>
        </div>

        {/* CTA */}
        <div style={{
          padding: "24px",
          borderRadius: "12px",
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border)",
          textAlign: "center",
        }}>
          <p style={{ margin: "0 0 8px", fontWeight: 600, color: "var(--text-h)", fontSize: "16px" }}>
            Questions about these Terms?
          </p>
          <p style={{ margin: "0 0 16px", fontSize: "14px", color: "var(--secondary)" }}>
            Contact us at{" "}
            <a href="mailto:legal@disasterplatform.org" style={{ color: "var(--primary)", textDecoration: "none" }}>
              legal@disasterplatform.org
            </a>
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/privacy" style={{ fontSize: "14px", color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
              Privacy Policy →
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

export default TermsOfService;
