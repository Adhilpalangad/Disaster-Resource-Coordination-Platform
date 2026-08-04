import React, { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

export const ProfileDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px 8px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "var(--primary, #0284C7)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "13px",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-h, #0F172A)" }}>
          {user?.name ?? "User"}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "8px",
            width: "220px",
            backgroundColor: "var(--card-bg, #FFFFFF)",
            borderRadius: "12px",
            border: "1px solid var(--border, #E2E8F0)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            zIndex: 100,
            padding: "6px",
          }}
        >
          {/* User info header */}
          <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-h)" }}>{user?.name}</div>
            <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "1px" }}>{user?.email}</div>
          </div>

          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              color: "var(--text-h, #0F172A)",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            <User size={15} /> Profile
          </Link>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              color: "var(--text-h, #0F172A)",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            <Settings size={15} /> Settings
          </Link>

          <div style={{ height: "1px", backgroundColor: "var(--border, #E2E8F0)", margin: "4px 0" }} />

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "8px 12px",
              fontSize: "13px",
              color: "var(--danger, #EF4444)",
              background: "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
