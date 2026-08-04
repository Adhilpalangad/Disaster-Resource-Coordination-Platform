import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        borderTop: "1px solid var(--border, #E2E8F0)",
        marginTop: "16px",
      }}
    >
      <span style={{ fontSize: "13px", color: "var(--secondary, #475569)" }}>
        Page {currentPage} of {totalPages}
      </span>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border, #E2E8F0)",
            backgroundColor: "#FFFFFF",
            color: currentPage <= 1 ? "#94A3B8" : "var(--text-h, #0F172A)",
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border, #E2E8F0)",
            backgroundColor: "#FFFFFF",
            color: currentPage >= totalPages ? "#94A3B8" : "var(--text-h, #0F172A)",
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
