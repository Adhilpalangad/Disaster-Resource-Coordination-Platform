import React from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Building2,
  Users,
  Shield,
  ArrowRight,
  Globe,
} from "lucide-react";
import { DotPattern } from "@/registry/magicui/dot-pattern";

const ROLES = [
  {
    icon: <AlertTriangle size={28} />,
    color: "var(--primary)",
    title: "CITIZEN",
    subtitle: "Affected individuals & families",
    points: [
      "Submit verified relief requests with GPS location & photos",
      "Track your request status in real time",
      "Locate open emergency shelters and supply centers",
      "Receive instant dispatch updates",
    ],
  },
  {
    icon: <Building2 size={28} />,
    color: "#8b5cf6",
    title: "NGO REPRESENTATIVE",
    subtitle: "Relief agencies & non-profits",
    points: [
      "Verify and prioritize incoming emergency requests",
      "Deploy field volunteers to active crisis zones",
      "Manage live resource inventories & allocations",
      "Coordinate multi-region disaster operations",
    ],
  },
  {
    icon: <Users size={28} />,
    color: "var(--success)",
    title: "FIELD VOLUNTEER",
    subtitle: "First responders & aid workers",
    points: [
      "Receive automated task dispatches from verified NGOs",
      "Navigate to priority aid locations",
      "Update field delivery status in real time",
      "Mark supplies delivered upon completion",
    ],
  },
  {
    icon: <Shield size={28} />,
    color: "var(--danger)",
    title: "ADMINISTRATOR",
    subtitle: "Operations & system control",
    points: [
      "Declare and manage active disaster emergency campaigns",
      "Vet and accredit registered NGO organizations",
      "Monitor global response analytics & bottleneck alerts",
      "Manage role permissions & security protocols",
    ],
  },
];

const STATS = [
  { value: "4", label: "Coordinated Response Roles" },
  { value: "< 2 min", label: "Average Dispatch Routing Time" },
  { value: "Real-Time", label: "Inventory & Shelter Tracking" },
  { value: "24 / 7", label: "Emergency Operations Active" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "EMERGENCY DECLARATION", desc: "System operators launch a localized disaster campaign specifying affected zones and critical supply needs." },
  { step: "02", title: "RELIEF REQUEST ROUTING", desc: "Citizens submit targeted relief requests for food, medical care, or shelter with geo-coordinates." },
  { step: "03", title: "NGO VERIFICATION & MATCHING", desc: "Accredited NGOs review requests, verify field priority, and assign available inventory and teams." },
  { step: "04", title: "VOLUNTEER FIELD DISPATCH", desc: "Deployed volunteers receive exact task details, deliver supplies, and confirm resolution instantly." },
];

export const Home: React.FC = () => {
  return (
    <div style={{ color: "var(--text)" }}>

      {/* ── Hero Section (Aceternity Spotlight + Lightswind + 21st.dev) ────── */}
      <section
        style={{
          position: "relative",
          borderBottom: "1px solid var(--border)",
          padding: "104px 24px 88px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <DotPattern style={{ opacity: 0.35 }} />
        <div style={{ maxWidth: "860px", margin: "0 auto", position: "relative", zIndex: 1 }} className="animate-fade-in">
          


          {/* LEMON MILK Display Headline */}
          <h1 style={{
            fontSize: "clamp(34px, 5.5vw, 62px)",
            fontWeight: 700,
            color: "var(--text-h)",
            fontFamily: "var(--heading)",
            letterSpacing: "-1px",
            lineHeight: 1.15,
            margin: "0 0 24px",
          }}>
            RAPID DISASTER RELIEF &{" "}
            <span style={{
              background: "linear-gradient(135deg, var(--primary) 0%, #2563eb 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              RESOURCE COORDINATION
            </span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: "18px",
            color: "var(--text)",
            lineHeight: 1.65,
            margin: "0 auto 44px",
            maxWidth: "660px",
            fontWeight: 400,
          }}>
            A unified emergency network connecting affected citizens, accredited NGOs, field volunteers, and administrators, streamlining request routing, shelter allocation, and supply dispatches during critical crises.
          </p>

          {/* 21st.dev Shimmer Action Buttons */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="btn-21st-primary btn-shimmer">
              GET STARTED <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn-21st-secondary">
              LEARN MORE
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────────────── */}
      <section style={{
        backgroundColor: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        padding: "36px 24px",
      }}>
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "24px",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "12px 16px",
              borderRight: i < STATS.length - 1 ? "1px solid var(--border-light)" : "none",
            }}>
              <div style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--text-h)",
                fontFamily: "var(--heading)",
                letterSpacing: "-0.5px",
              }}>{s.value}</div>
              <div style={{
                fontSize: "13px",
                color: "var(--secondary)",
                fontWeight: 500,
                marginTop: "4px",
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Role Workspaces ───────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", maxWidth: "1240px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--primary)",
            fontFamily: "var(--heading)",
            letterSpacing: "1px",
            marginBottom: "8px",
          }}>
            MULTI-STAKEHOLDER ARCHITECTURE
          </div>
          <h2 style={{
            fontSize: "34px",
            fontWeight: 700,
            color: "var(--text-h)",
            fontFamily: "var(--heading)",
            letterSpacing: "-0.5px",
            margin: "0 0 16px",
          }}>
            PURPOSE-BUILT WORKSPACES FOR EVERY RESPONDER
          </h2>
          <p style={{ fontSize: "16px", color: "var(--secondary)", maxWidth: "580px", margin: "0 auto" }}>
            Dedicated portals tailored for each operational role to ensure maximum clarity and speed during emergency operations.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "28px",
        }}>
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="card-21st"
              style={{
                padding: "30px 26px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{
                color: role.color,
                display: "flex",
                alignItems: "center",
                marginBottom: "18px",
              }}>
                {role.icon}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", marginBottom: "4px" }}>
                {role.title}
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: role.color,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "22px",
              }}>
                {role.subtitle}
              </div>
              <ul style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginTop: "auto",
              }}>
                {role.points.map((p) => (
                  <li key={p} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    fontSize: "13.5px",
                    color: "var(--secondary)",
                    lineHeight: 1.5,
                  }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: role.color,
                      marginTop: "7px",
                      flexShrink: 0,
                      display: "inline-block",
                    }} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Operational Workflow ──────────────────────────────────────────── */}
      <section style={{
        backgroundColor: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "96px 24px",
      }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", letterSpacing: "-0.5px", margin: "0 0 14px" }}>
              END-TO-END RESPONSE WORKFLOW
            </h2>
            <p style={{ fontSize: "16px", color: "var(--secondary)", maxWidth: "520px", margin: "0 auto" }}>
              How disaster alerts convert into direct field deliveries in four coordinated phases.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "28px",
          }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="card-21st" style={{ padding: "26px" }}>
                <div style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--primary)",
                  fontFamily: "var(--heading)",
                  letterSpacing: "1px",
                  marginBottom: "14px",
                  display: "inline-block",
                }}>
                  PHASE {step.step}
                </div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", marginBottom: "10px" }}>
                  {step.title}
                </div>
                <p style={{ fontSize: "13.5px", color: "var(--secondary)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action ──────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", textAlign: "center" }}>
        <div
          className="card-21st"
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            borderRadius: "28px",
            padding: "56px 36px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div style={{
            color: "var(--primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}>
            <Globe size={32} />
          </div>
          <h2 style={{ fontSize: "30px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", letterSpacing: "-0.5px", margin: "0 0 14px" }}>
            READY TO COORDINATE DISASTER RELIEF?
          </h2>
          <p style={{ fontSize: "15px", color: "var(--secondary)", marginBottom: "36px", lineHeight: 1.6 }}>
            Join our verified network today. Register as an affected citizen, accredited NGO representative, or field volunteer to begin.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" className="btn-21st-primary btn-shimmer">
              CREATE ACCOUNT <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-21st-secondary">
              SIGN IN
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
