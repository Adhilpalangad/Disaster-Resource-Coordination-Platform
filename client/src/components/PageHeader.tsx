import React from "react";
import Breadcrumb, { type BreadcrumbItem } from "./Breadcrumb.js";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
}) => {
  return (
    <div style={{ marginBottom: "24px" }}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} />}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text-h, #0F172A)",
              letterSpacing: "-0.5px",
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "14px",
                color: "var(--secondary, #475569)",
              }}
            >
              {description}
            </p>
          )}
        </div>
        {actions && <div style={{ display: "flex", gap: "12px" }}>{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
