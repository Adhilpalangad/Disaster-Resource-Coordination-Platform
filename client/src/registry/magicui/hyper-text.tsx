import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

interface HyperTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  className?: string;
  animateOnHover?: boolean;
}

export const HyperText: React.FC<HyperTextProps> = ({
  children,
  duration = 800,
  delay = 0,
  as: Component = "div",
  className = "",
  animateOnHover = true,
  ...props
}) => {
  const [displayText, setDisplayText] = useState<string[]>(() => children.split(""));
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const iterations = useRef<number>(0);

  const triggerAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    iterations.current = 0;

    const totalSteps = children.length;
    const intervalTime = Math.max(20, duration / (totalSteps * 2));

    const interval = setInterval(() => {
      setDisplayText(
        children
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iterations.current) {
              return children[index];
            }
            return alphabets[Math.floor(Math.random() * alphabets.length)];
          })
      );

      if (iterations.current >= children.length) {
        clearInterval(interval);
        setIsAnimating(false);
        setDisplayText(children.split(""));
      }
      iterations.current += 0.5;
    }, intervalTime);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerAnimation();
    }, delay);
    return () => clearTimeout(timer);
  }, [children]);

  return (
    <Component
      className={cn("inline-block font-mono cursor-pointer select-none", className)}
      onMouseEnter={() => {
        if (animateOnHover) triggerAnimation();
      }}
      {...props}
    >
      {displayText.map((char, i) => (
        <span key={i} className="inline-block">
          {char}
        </span>
      ))}
    </Component>
  );
};

export function HyperTextDemo() {
  return <HyperText>Hover Me!</HyperText>;
}

export default HyperText;
