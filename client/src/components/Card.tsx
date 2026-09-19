import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = "",
  style = {},
  hoverEffect = true,
}) => {
  return (
    <div
      className={`lightswind-card ${hoverEffect ? "card-hover" : ""} ${className}`}
      style={{
        backgroundColor: "var(--card-bg)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        padding: "24px",
        boxShadow: "var(--shadow-sm)",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
            borderBottom: subtitle ? "none" : "1px solid var(--border-light)",
            paddingBottom: subtitle ? "0" : "14px",
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: "19px",
                  fontWeight: 800,
                  color: "var(--text-h)",
                  fontFamily: "var(--heading)",
                  letterSpacing: "-0.3px",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "14px",
                  color: "var(--secondary)",
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
