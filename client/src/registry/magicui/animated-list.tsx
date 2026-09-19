import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedListProps {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedList = React.memo(
  ({ className, children, delay = 1000 }: AnimatedListProps) => {
    const [index, setIndex] = useState(0);
    const childrenArray = React.Children.toArray(children);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
      }, delay);

      return () => clearInterval(interval);
    }, [childrenArray.length, delay]);

    const itemsToShow = useMemo(
      () => childrenArray.slice(0, index + 1).reverse(),
      [index, childrenArray]
    );

    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        {itemsToShow.map((item) => (
          <div
            key={(item as React.ReactElement).key || Math.random()}
            className="w-full transition-all duration-300 ease-in-out animate-fade-in"
          >
            {item}
          </div>
        ))}
      </div>
    );
  }
);

AnimatedList.displayName = "AnimatedList";

export default AnimatedList;
