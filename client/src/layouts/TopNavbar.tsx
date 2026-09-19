import React from "react";
import { Menu, Activity } from "lucide-react";
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
        backgroundColor: "var(--card-bg)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxSizing: "border-box",
        transition: "background-color 0.25s ease, border-color 0.25s ease",
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
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              color: "var(--secondary)",
            }}
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>
        )}
        {title && (
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-h)" }}>
            {title}
          </span>
        )}

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "99px",
          backgroundColor: "var(--accent-bg)",
          border: "1px solid var(--accent-border)",
          fontSize: "12px",
          fontWeight: 600,
          color: "var(--primary)",
        }}>
          <Activity size={13} />
          <span>System Online</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <ThemeToggle />
        <NotificationDropdown />
        <div style={{ width: "1px", height: "24px", backgroundColor: "var(--border)" }} />
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default TopNavbar;
