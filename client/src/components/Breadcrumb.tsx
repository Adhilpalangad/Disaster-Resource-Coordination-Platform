import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: "16px" }}>
      <ol
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          listStyle: "none",
          margin: 0,
          padding: 0,
          fontSize: "13px",
          color: "var(--secondary, #475569)",
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {index > 0 && <ChevronRight size={14} style={{ color: "#94A3B8" }} />}
              {isLast || !item.path ? (
                <span
                  style={{
                    fontWeight: isLast ? 600 : 400,
                    color: isLast ? "var(--text-h, #0F172A)" : "var(--secondary, #475569)",
                  }}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  style={{
                    color: "var(--secondary, #475569)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
