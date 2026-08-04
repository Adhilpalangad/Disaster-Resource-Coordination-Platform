import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  Users,
  Shield,
  ArrowRight,
  CheckCircle2,
  Radio,
  Globe,
} from "lucide-react";

const ROLES = [
  {
    icon: <AlertTriangle size={22} />,
    color: "#0284C7",
    bg: "rgba(2,132,199,0.08)",
    title: "Citizen",
    subtitle: "Affected individuals",
    points: [
      "Submit relief requests with location & photos",
      "Track your request through every stage",
      "Find nearby shelters and resource centres",
      "Receive real-time status notifications",
    ],
  },
  {
    icon: <Building2 size={22} />,
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.08)",
    title: "NGO",
    subtitle: "Relief organisations",
    points: [
      "Verify and prioritise incoming citizen requests",
      "Assign volunteers to accepted requests",
      "Monitor inventory levels and resource allocation",
      "Coordinate multiple simultaneous disaster zones",
    ],
  },
  {
    icon: <Users size={22} />,
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    title: "Volunteer",
    subtitle: "Field responders",
    points: [
      "View tasks assigned by your NGO",
      "Accept and start delivery operations",
      "Update delivery status from the field",
      "Mark tasks complete once delivered",
    ],
  },
  {
    icon: <Shield size={22} />,
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    title: "Administrator",
    subtitle: "Platform operators",
    points: [
      "Create and manage active disaster campaigns",
      "Verify and onboard NGO organisations",
      "Monitor all platform activity and analytics",
      "Manage users and system configuration",
    ],
  },
];

const STATS = [
  { value: "4", label: "Coordinated Roles" },
  { value: "Real-time", label: "Request Tracking" },
  { value: "Centralised", label: "Operations Hub" },
  { value: "Open", label: "During Any Disaster" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Disaster Declared", desc: "An administrator creates a disaster campaign with location, severity, and details." },
  { step: "02", title: "Citizens Request Help", desc: "Affected individuals submit relief requests — food, water, medical, shelter — with photos and location." },
  { step: "03", title: "NGOs Verify & Act", desc: "NGO representatives review requests, verify authenticity, and dispatch volunteer teams." },
  { step: "04", title: "Volunteers Deliver", desc: "Volunteers accept tasks, head to the location, and mark deliveries complete in real time." },
];

export const Home: React.FC = () => {
  return (
    <div style={{ backgroundColor: "var(--bg, #F8FAFC)" }}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(160deg, #f0f9ff 0%, #f8fafc 60%)",
        borderBottom: "1px solid var(--border)",
        padding: "80px 24px 72px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "20px",
            border: "1px solid rgba(2,132,199,0.25)",
            backgroundColor: "rgba(2,132,199,0.06)",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--primary)",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <Radio size={12} />
            Live Platform — Hackathon 2025
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            color: "var(--text-h)",
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            margin: "0 0 20px",
          }}>
            Coordinating Disaster Relief,{" "}
            <span style={{ color: "var(--primary)" }}>Together.</span>
          </h1>

          <p style={{
            fontSize: "17px",
            color: "var(--secondary)",
            lineHeight: 1.65,
            margin: "0 auto 36px",
            maxWidth: "560px",
          }}>
            One platform that connects citizens, NGOs, volunteers, and administrators during floods, earthquakes, and other disasters — replacing scattered WhatsApp groups with real coordination.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "10px",
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              to="/about"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "10px",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-h)",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                border: "1px solid var(--border)",
              }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
        padding: "24px",
      }}>
        <div style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "0",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "16px",
              borderRight: i < STATS.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-h)" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "var(--secondary)", fontWeight: 500, marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Cards ────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h2 style={{
            fontSize: "30px",
            fontWeight: 800,
            color: "var(--text-h)",
            letterSpacing: "-0.5px",
            margin: "0 0 12px",
          }}>
            Built for every responder
          </h2>
          <p style={{ fontSize: "15px", color: "var(--secondary)", maxWidth: "480px", margin: "0 auto" }}>
            Each role gets their own focused workspace — no clutter, no confusion, just what they need during a crisis.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}>
          {ROLES.map((role) => (
            <div
              key={role.title}
              style={{
                backgroundColor: "var(--card-bg)",
                borderRadius: "16px",
                border: "1px solid var(--border)",
                padding: "24px",
                transition: "box-shadow 0.2s ease, transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: role.bg,
                color: role.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}>
                {role.icon}
              </div>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-h)", marginBottom: "2px" }}>
                {role.title}
              </div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: role.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
                {role.subtitle}
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {role.points.map((p) => (
                  <li key={p} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "var(--secondary)" }}>
                    <CheckCircle2 size={14} style={{ color: role.color, marginTop: "2px", flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: "var(--card-bg)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "72px 24px",
      }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-h)", letterSpacing: "-0.5px", margin: "0 0 10px" }}>
              How it works
            </h2>
            <p style={{ fontSize: "15px", color: "var(--secondary)" }}>
              From disaster declaration to resource delivery in four steps.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "32px",
          }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step}>
                <div style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "var(--primary)",
                  letterSpacing: "1px",
                  marginBottom: "10px",
                }}>
                  STEP {step.step}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-h)", marginBottom: "8px" }}>
                  {step.title}
                </div>
                <p style={{ fontSize: "13px", color: "var(--secondary)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <Globe size={32} style={{ color: "var(--primary)", marginBottom: "16px" }} />
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-h)", letterSpacing: "-0.5px", margin: "0 0 12px" }}>
            Ready to help coordinate relief?
          </h2>
          <p style={{ fontSize: "15px", color: "var(--secondary)", marginBottom: "28px" }}>
            Create your account as a citizen, NGO representative, or volunteer and start coordinating today.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/register"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 28px",
                borderRadius: "10px",
                backgroundColor: "var(--primary)",
                color: "#fff",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              Create Account <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 28px",
                borderRadius: "10px",
                backgroundColor: "transparent",
                color: "var(--primary)",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                border: "1px solid var(--border)",
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
