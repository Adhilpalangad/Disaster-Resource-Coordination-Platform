import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const InteractiveHoverButton: React.FC<InteractiveHoverButtonProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <button
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-full border border-neutral-700 bg-black px-6 py-3 text-center text-sm font-semibold text-white transition-all duration-300 hover:border-primary hover:shadow-lg",
        className
      )}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: "var(--card-bg)",
        border: "1px solid var(--border)",
        color: "var(--text-h)",
        borderRadius: "99px",
        padding: "12px 24px",
        fontFamily: "var(--heading)",
        fontSize: "14px",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    >
      <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
        {children}
      </span>
      <ArrowRight
        size={16}
        className="inline-block opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
      />
    </button>
  );
};

export default InteractiveHoverButton;
