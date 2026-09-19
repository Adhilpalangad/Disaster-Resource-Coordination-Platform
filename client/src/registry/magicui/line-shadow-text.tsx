import React from "react";
import { cn } from "@/lib/utils";

interface LineShadowTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  shadowColor?: string;
  className?: string;
  as?: React.ElementType;
}

export const LineShadowText: React.FC<LineShadowTextProps> = ({
  children,
  shadowColor = "currentColor",
  className = "",
  as: Component = "span",
  ...props
}) => {
  return (
    <Component
      className={cn("relative inline-block text-shadow-line", className)}
      style={{
        textShadow: `0.04em 0.04em 0 ${shadowColor}, 0.08em 0.08em 0 rgba(0,0,0,0.15)`,
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

export default LineShadowText;
