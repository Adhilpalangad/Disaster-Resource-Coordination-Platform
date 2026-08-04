import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
        backgroundColor: "var(--card-bg, #FFFFFF)",
        borderRadius: "16px",
        border: "1px dashed var(--border, #E2E8F0)",
      }}
    >
      {icon && <div style={{ marginBottom: "16px", color: "var(--secondary, #475569)" }}>{icon}</div>}
      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-h, #0F172A)" }}>
        {title}
      </h3>
      <p style={{ margin: "6px 0 20px", fontSize: "14px", color: "var(--secondary, #475569)", maxWidth: "400px" }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
