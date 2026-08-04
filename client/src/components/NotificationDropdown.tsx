import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

export const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--secondary, #475569)",
          padding: "8px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Notifications"
      >
        <Bell size={20} />
        <span
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--danger, #EF4444)",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "8px",
            width: "300px",
            backgroundColor: "#FFFFFF",
            borderRadius: "12px",
            border: "1px solid var(--border, #E2E8F0)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            zIndex: 100,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--border, #E2E8F0)",
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--text-h, #0F172A)",
            }}
          >
            Notifications
          </div>
          <div style={{ padding: "16px", textAlign: "center", fontSize: "13px", color: "#64748B" }}>
            {/* TODO: Connect notifications feed */}
            No new notifications
          </div>
          <div
            style={{
              padding: "8px 16px",
              borderTop: "1px solid var(--border, #E2E8F0)",
              textAlign: "center",
              backgroundColor: "var(--bg, #F8FAFC)",
            }}
          >
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary, #0284C7)", textDecoration: "none" }}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
