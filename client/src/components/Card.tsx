import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = "",
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: "var(--card-bg, #FFFFFF)",
        borderRadius: "16px",
        border: "1px solid var(--border, #E2E8F0)",
        padding: "24px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        ...style,
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "16px",
            borderBottom: subtitle ? "none" : "1px solid var(--border, #E2E8F0)",
            paddingBottom: subtitle ? "0" : "12px",
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-h, #0F172A)",
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "14px",
                  color: "var(--text, #475569)",
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
