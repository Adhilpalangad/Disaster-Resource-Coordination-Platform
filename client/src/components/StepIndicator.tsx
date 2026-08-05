import React from "react";
import { Check } from "lucide-react";

interface Props {
  steps:   string[];
  current: number;   // 0-indexed
}

export const StepIndicator: React.FC<Props> = ({ steps, current }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
    {steps.map((label, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          {/* Step circle */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <div
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700,
                backgroundColor: done   ? "var(--primary)"  : active ? "rgba(2,132,199,0.12)" : "var(--bg)",
                color:           done   ? "#fff"             : active ? "var(--primary)"        : "var(--secondary)",
                border:          active ? "2px solid var(--primary)" : done ? "none" : "2px solid var(--border)",
                transition: "all 0.2s",
              }}
            >
              {done ? <Check size={15} /> : i + 1}
            </div>
            <span
              style={{
                fontSize: "11px", fontWeight: active || done ? 600 : 400,
                color:    active  ? "var(--primary)" : done ? "var(--text-h)" : "var(--secondary)",
                whiteSpace: "nowrap", textAlign: "center", maxWidth: "80px",
              }}
            >
              {label}
            </span>
          </div>

          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              style={{
                flex: 1, height: "2px", marginBottom: "22px",
                backgroundColor: i < current ? "var(--primary)" : "var(--border)",
                transition: "background-color 0.2s",
              }}
            />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

export default StepIndicator;
