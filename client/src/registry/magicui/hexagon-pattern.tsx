import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface HexagonPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  hexagons?: [number, number][];
  className?: string;
}

export const HexagonPattern: React.FC<HexagonPatternProps> = ({
  width = 40,
  height = 40,
  hexagons = [],
  className = "",
  ...props
}) => {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full stroke-neutral-500/20", className)}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20 0 L40 11.5 L40 34.5 L20 46 L0 34.5 L0 11.5 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {hexagons.length > 0 && (
        <svg x="0" y="0" className="overflow-visible">
          {hexagons.map(([x, y], i) => (
            <path
              key={`${x}-${y}-${i}`}
              d={`M${x * width + 20} ${y * height} L${x * width + 40} ${y * height + 11.5} L${x * width + 40} ${y * height + 34.5} L${x * width + 20} ${y * height + 46} L${x * width} ${y * height + 34.5} L${x * width} ${y * height + 11.5} Z`}
              className="fill-primary/10 stroke-primary/30"
            />
          ))}
        </svg>
      )}
    </svg>
  );
};

export default HexagonPattern;
