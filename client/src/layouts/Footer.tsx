import React from "react";
import { Link } from "react-router-dom";
import { Globe, Share2, ExternalLink, MessageSquare } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "var(--card-bg)",
        borderTop: "1px solid var(--border)",
        padding: "64px 24px 32px",
        marginTop: "auto",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Top Section — Brand + 4 Directory Columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "40px",
            marginBottom: "56px",
          }}
        >
          {/* Brand Col */}
          <div style={{ gridColumn: "span 2", maxWidth: "340px" }}>
            <Link
              to="/home"
              style={{
                fontSize: "18px",
                fontWeight: 800,
                color: "var(--text-h)",
                fontFamily: "var(--heading)",
                letterSpacing: "-0.5px",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "14px",
              }}
            >
              Disaster Resource Coordination Platform
            </Link>
            <p style={{ fontSize: "14px", color: "var(--secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
              Building the future of emergency relief coordination. Connecting citizens, NGOs, and field volunteers with intelligent real-time dispatching.
            </p>

            {/* Social Icons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { icon: Share2, href: "#" },
                { icon: ExternalLink, href: "#" },
                { icon: MessageSquare, href: "#" },
                { icon: Globe, href: "https://kdrp.in" },
              ].map((s, i) => {
                const IconComp = s.icon;
                return (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      backgroundColor: "var(--bg)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--secondary)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <IconComp size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 1 — Product */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
              Product
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
              <Link to="/disasters" style={{ color: "var(--secondary)", textDecoration: "none" }}>Active Disasters</Link>
              <Link to="/requests" style={{ color: "var(--secondary)", textDecoration: "none" }}>Relief Routing</Link>
              <Link to="/shelters" style={{ color: "var(--secondary)", textDecoration: "none" }}>Shelter Map</Link>
              <Link to="/ngo/dashboard" style={{ color: "var(--secondary)", textDecoration: "none" }}>NGO Console</Link>
            </div>
          </div>

          {/* Col 2 — Resources */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
              Resources
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
              <Link to="/help" style={{ color: "var(--secondary)", textDecoration: "none" }}>Documentation</Link>
              <Link to="/help" style={{ color: "var(--secondary)", textDecoration: "none" }}>API Reference</Link>
              <Link to="/help" style={{ color: "var(--secondary)", textDecoration: "none" }}>Emergency Guides</Link>
              <Link to="/help" style={{ color: "var(--secondary)", textDecoration: "none" }}>Support Center</Link>
            </div>
          </div>

          {/* Col 3 — Company */}
          <div>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-h)", fontFamily: "var(--heading)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>
              Company
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
              <Link to="/about" style={{ color: "var(--secondary)", textDecoration: "none" }}>About Us</Link>
              <Link to="/contact" style={{ color: "var(--secondary)", textDecoration: "none" }}>Contact</Link>
              <Link to="/help" style={{ color: "var(--secondary)", textDecoration: "none" }}>Partners</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "13px",
            color: "var(--secondary)",
          }}
        >
          <span>© {new Date().getFullYear()} Disaster Platform Inc. All rights reserved.</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link to="/privacy" style={{ color: "var(--secondary)", textDecoration: "none" }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: "var(--secondary)", textDecoration: "none" }}>Terms of Service</Link>
            <Link to="/help" style={{ color: "var(--secondary)", textDecoration: "none" }}>Help</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
