import React, { useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rippleColor?: string;
  duration?: string;
}

export const RippleButton = React.forwardRef<
  HTMLButtonElement,
  RippleButtonProps
>(
  (
    {
      className,
      children,
      rippleColor = "#ADD8E6",
      duration = "600ms",
      onClick,
      style,
      ...props
    },
    ref
  ) => {
    const [buttonRipples, setButtonRipples] = useState<
      Array<{ x: number; y: number; size: number; key: number }>
    >([]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const newRipple = { x, y, size, key: Date.now() };

      setButtonRipples((prevRipples) => [...prevRipples, newRipple]);

      if (onClick) {
        onClick(e);
      }
    };

    useLayoutEffect(() => {
      if (buttonRipples.length > 0) {
        const lastRipple = buttonRipples[buttonRipples.length - 1];
        const timeout = setTimeout(() => {
          setButtonRipples((prevRipples) =>
            prevRipples.filter((ripple) => ripple.key !== lastRipple.key)
          );
        }, parseInt(duration, 10) || 600);

        return () => clearTimeout(timeout);
      }
    }, [buttonRipples, duration]);

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-none text-center transition-all duration-200 active:scale-[0.98]",
          className
        )}
        onClick={handleClick}
        style={{ position: "relative", overflow: "hidden", ...style }}
        {...props}
      >
        <span className="relative z-10 flex items-center justify-center gap-2" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%" }}>
          {children}
        </span>
        <span className="pointer-events-none absolute inset-0 z-0">
          {buttonRipples.map((ripple) => (
            <span
              key={ripple.key}
              className="absolute rounded-full"
              style={{
                position: "absolute",
                borderRadius: "50%",
                width: `${ripple.size}px`,
                height: `${ripple.size}px`,
                top: `${ripple.y}px`,
                left: `${ripple.x}px`,
                backgroundColor: rippleColor,
                transform: "scale(0)",
                animation: `ripple-animation ${duration} ease-out forwards`,
                pointerEvents: "none",
              }}
            />
          ))}
        </span>
      </button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export function RippleButtonDemo() {
  return <RippleButton rippleColor="#ADD8E6">Click me</RippleButton>;
}

export default RippleButton;
