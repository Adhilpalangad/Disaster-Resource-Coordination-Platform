import React, { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: any;
  numSquares?: number;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
  className?: string;
}

export const AnimatedGridPattern: React.FC<AnimatedGridPatternProps> = ({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 30,
  maxOpacity = 0.1,
  duration = 3,
  repeatDelay = 1,
  className = "",
  ...props
}) => {
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const { width: w, height: h } = containerRef.current.getBoundingClientRect();
    setDimensions({ width: w || 800, height: h || 600 });
  }, []);

  const cols = Math.floor(dimensions.width / width) || 10;
  const rows = Math.floor(dimensions.height / height) || 10;

  const squares = React.useMemo(() => {
    return Array.from({ length: numSquares }, (_, i) => ({
      id: i,
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    }));
  }, [numSquares, cols, rows]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-neutral-400/30 dark:stroke-neutral-600/30",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map((sq, i) => (
          <rect
            key={`${sq.x}-${sq.y}-${i}`}
            width={width - 1}
            height={height - 1}
            x={sq.x * width + 1}
            y={sq.y * height + 1}
            fill="currentColor"
            strokeWidth="0"
            className="fill-primary/20 text-primary transition-all ease-in-out"
            style={{
              opacity: maxOpacity,
              animationDuration: `${duration}s`,
              animationDelay: `${(i % 5) * repeatDelay}s`,
            }}
          />
        ))}
      </svg>
    </svg>
  );
};

export function AnimatedGridPatternDemo() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "500px",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        backgroundColor: "var(--card-bg)",
        padding: "80px",
      }}
    >
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
        )}
      />
    </div>
  );
}

export default AnimatedGridPattern;
