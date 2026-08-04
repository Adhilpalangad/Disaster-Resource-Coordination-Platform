import React from "react";
import { Menu } from "lucide-react";
import NotificationDropdown from "../components/NotificationDropdown.js";
import ProfileDropdown from "../components/ProfileDropdown.js";
import ThemeToggle from "../components/ThemeToggle.js";

interface TopNavbarProps {
  onToggleMobileMenu?: () => void;
  title?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleMobileMenu,
  title,
}) => {
  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "var(--card-bg, #FFFFFF)",
        borderBottom: "1px solid var(--border, #E2E8F0)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              color: "var(--secondary, #475569)",
            }}
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>
        )}
        {title && (
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-h, #0F172A)" }}>
            {title}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <ThemeToggle />
        <NotificationDropdown />
        <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border, #E2E8F0)" }} />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default TopNavbar;
