import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  style = {},
}) => {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "320px",
        ...style,
      }}
    >
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "12px",
          color: "#94A3B8",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px 10px 36px",
          fontSize: "14px",
          borderRadius: "10px",
          border: "1px solid var(--border, #E2E8F0)",
          backgroundColor: "#FFFFFF",
          color: "var(--text-h, #0F172A)",
          outline: "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      />
    </div>
  );
};

export default SearchBar;
