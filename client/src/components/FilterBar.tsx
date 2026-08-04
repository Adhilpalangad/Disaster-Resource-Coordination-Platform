import React from "react";
import { Filter } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  label?: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  label = "Filter:",
  options,
  selected,
  onChange,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--secondary, #475569)", display: "flex", alignItems: "center", gap: "4px" }}>
        <Filter size={14} /> {label}
      </span>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "8px 12px",
          fontSize: "13px",
          borderRadius: "8px",
          border: "1px solid var(--border, #E2E8F0)",
          backgroundColor: "#FFFFFF",
          color: "var(--text-h, #0F172A)",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterBar;
