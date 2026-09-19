import React, { useState, useEffect, useRef } from "react";
import { Sun, Moon } from "lucide-react";

interface AnimatedThemeTogglerProps {
  className?: string;
}

export const AnimatedThemeToggler: React.FC<AnimatedThemeTogglerProps> = ({ className = "" }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return (
      localStorage.getItem("theme") === "dark" ||
      document.documentElement.classList.contains("dark") ||
      !localStorage.getItem("theme")
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextDark = !isDark;

    // Use Web Animations / View Transitions API if supported for the MagicUI circular ripple transition
    const isSupported =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isSupported) {
      setIsDark(nextDark);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();
    const x = e.clientX || (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = e.clientY || (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setIsDark(nextDark);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: nextDark ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: nextDark
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        }
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={`animated-theme-toggler ${className}`}
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        padding: 0,
        margin: 0,
        borderRadius: "99px",
        border: "none",
        backgroundColor: "var(--bg)",
        color: "var(--text-h)",
        cursor: "pointer",
        outline: "none",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "none",
        overflow: "hidden",
        flexShrink: 0,
        alignSelf: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.9)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {isDark ? (
          <Sun size={19} style={{ color: "#F59E0B" }} />
        ) : (
          <Moon size={19} style={{ color: "#1c9cf0" }} />
        )}
      </div>
    </button>
  );
};

export function AnimatedThemeTogglerDemo() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
      <AnimatedThemeToggler />
    </div>
  );
}

export default AnimatedThemeToggler;
