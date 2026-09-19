import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: string;
  duration?: number;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}

export const TypingAnimation: React.FC<TypingAnimationProps> = ({
  children,
  duration = 100,
  delay = 0,
  className = "",
  as: Component = "h1",
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [i, setI] = useState<number>(0);

  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      const typingInterval = setInterval(() => {
        if (i < children.length) {
          setDisplayedText((prev) => prev + children.charAt(i));
          setI((prev) => prev + 1);
        } else {
          clearInterval(typingInterval);
        }
      }, duration);

      return () => clearInterval(typingInterval);
    }, delay);

    return () => clearTimeout(typingTimeout);
  }, [children, duration, i, delay]);

  return (
    <Component
      className={cn(
        "font-display tracking-[-0.02em] drop-shadow-sm",
        className
      )}
      {...props}
    >
      {displayedText}
    </Component>
  );
};

export default TypingAnimation;
