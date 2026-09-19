import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface NumberTickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
  className?: string;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className = "",
  ...props
}) => {
  const [currentValue, setCurrentValue] = useState<number>(
    direction === "down" ? value : 0
  );
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTimestamp: number | null = null;
      const duration = 2000;
      const startValue = direction === "down" ? value : 0;
      const endValue = direction === "down" ? 0 : value;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuad = (t: number) => t * (2 - t);
        const easedProgress = easeOutQuad(progress);

        const current = startValue + (endValue - startValue) * easedProgress;
        setCurrentValue(current);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, direction, delay]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-tighter text-black dark:text-white",
        className
      )}
      {...props}
    >
      {currentValue.toFixed(decimalPlaces)}
    </span>
  );
};

export function NumberTickerDemo() {
  return (
    <NumberTicker
      value={100}
      className="text-8xl font-medium tracking-tighter whitespace-pre-wrap text-black dark:text-white"
    />
  );
}

export default NumberTicker;
