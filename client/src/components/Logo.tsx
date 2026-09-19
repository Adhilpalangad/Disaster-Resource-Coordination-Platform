import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  height?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  to = "/home",
  height = 30,
  className = "",
  showText = true,
}) => {
  const logoContent = (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }} className={className}>
      {/* Light Mode Logo */}
      <img
        src="/logos/logo-light.png"
        alt="Disaster Platform Logo"
        className="logo-light-img"
        style={{
          height: `${height}px`,
          width: "auto",
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      {/* Dark Mode Logo */}
      <img
        src="/logos/logo-dark.png"
        alt="Disaster Platform Logo"
        className="logo-dark-img"
        style={{
          height: `${height}px`,
          width: "auto",
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      {showText && (
        <span
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "var(--text-h)",
            fontFamily: "var(--heading)",
            letterSpacing: "-0.5px",
          }}
        >
          Disaster Platform
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};

export default Logo;
