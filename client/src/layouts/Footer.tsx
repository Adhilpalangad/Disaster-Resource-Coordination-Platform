import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "var(--card-bg, #FFFFFF)",
        borderTop: "1px solid var(--border, #E2E8F0)",
        padding: "24px",
        marginTop: "auto",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "13px",
          color: "var(--secondary, #475569)",
        }}
      >
        <div>
          © {new Date().getFullYear()} Disaster Resource Coordination Platform. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          <Link to="/about" style={{ color: "var(--secondary, #475569)", textDecoration: "none" }}>
            About
          </Link>
          <Link to="/contact" style={{ color: "var(--secondary, #475569)", textDecoration: "none" }}>
            Contact
          </Link>
          <Link to="/help" style={{ color: "var(--secondary, #475569)", textDecoration: "none" }}>
            Help Center
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
