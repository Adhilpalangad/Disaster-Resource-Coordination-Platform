import React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className,
  size = 150,
  duration = 8,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#1c9cf0",
  colorTo = "#3b82f6",
  delay = 0,
}) => {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": delay,
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          overflow: "hidden",
        } as React.CSSProperties
      }
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
    >
      <div
        style={{
          position: "absolute",
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colorFrom} 0%, ${colorTo} 40%, transparent 70%)`,
          filter: "blur(6px)",
          animation: `border-beam-orbit ${duration}s linear infinite`,
          animationDelay: `-${delay}s`,
          opacity: 0.85,
        }}
      />
    </div>
  );
};

export default BorderBeam;
