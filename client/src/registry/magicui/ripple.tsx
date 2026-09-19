import React from "react";
import { cn } from "@/lib/utils";

interface RippleProps {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
  className?: string;
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 8,
  className = "",
}: RippleProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 select-none [mask-image:linear-gradient(to_bottom,white,transparent)]",
        className
      )}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.15}s`;
        const borderStyle = i === 0 ? "solid" : "dashed";

        return (
          <div
            key={i}
            className="animate-ripple absolute rounded-full border bg-foreground/5 shadow-xl"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: Math.max(opacity, 0.03),
              animationDelay,
              borderStyle,
              borderWidth: "1px",
              borderColor: "var(--primary)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) scale(1)",
              borderRadius: "50%",
              position: "absolute",
            }}
          />
        );
      })}
    </div>
  );
});

export function RippleDemo() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "500px",
        width: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      <p
        style={{
          zIndex: 10,
          textAlign: "center",
          fontSize: "48px",
          fontWeight: 700,
          fontFamily: "var(--heading)",
          color: "var(--text-h)",
          letterSpacing: "-1px",
        }}
      >
        Ripple
      </p>
      <Ripple />
    </div>
  );
}

export default Ripple;
