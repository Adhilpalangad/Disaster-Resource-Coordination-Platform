import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext.js";
import type { AppNotification } from "../services/notificationsApi.js";

const TYPE_COLOR: Record<AppNotification["type"], string> = {
  success: "var(--success)",
  info:    "var(--primary)",
  warning: "var(--warning)",
  danger:  "var(--danger)",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markRead, markAllRead, deleteOne } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const preview = notifications.slice(0, 6);

  const handleClick = async (n: AppNotification) => {
    if (!n.isRead) await markRead(n._id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: "var(--secondary)", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{ position: "absolute", top: "5px", right: "5px", minWidth: "16px", height: "16px", borderRadius: "99px", backgroundColor: "var(--danger)", color: "#fff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", lineHeight: 1 }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: "340px", backgroundColor: "var(--card-bg)", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "0 12px 40px rgba(0,0,0,0.14)", zIndex: 200, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-h)" }}>
              Notifications {unreadCount > 0 && <span style={{ marginLeft: "6px", padding: "1px 7px", borderRadius: "99px", backgroundColor: "var(--danger)", color: "#fff", fontSize: "11px", fontWeight: 700 }}>{unreadCount}</span>}
            </span>
            <div style={{ display: "flex", gap: "4px" }}>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead()} title="Mark all read"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: "4px", borderRadius: "5px", display: "flex" }}>
                  <CheckCheck size={15} />
                </button>
              )}
              <button onClick={() => setOpen(false)} title="Close"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: "4px", borderRadius: "5px", display: "flex" }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "var(--secondary)" }}>Loading…</div>
            ) : preview.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <Bell size={28} style={{ color: "var(--border)", marginBottom: "8px" }} />
                <p style={{ margin: 0, fontSize: "13px", color: "var(--secondary)" }}>No notifications yet</p>
              </div>
            ) : (
              preview.map(n => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  style={{ display: "flex", gap: "10px", padding: "11px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer", backgroundColor: n.isRead ? "transparent" : "rgba(2,132,199,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.isRead ? "transparent" : "rgba(2,132,199,0.04)")}
                >
                  {/* Color dot */}
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: TYPE_COLOR[n.type], flexShrink: 0, marginTop: "5px" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px", fontSize: "13px", fontWeight: n.isRead ? 500 : 700, color: "var(--text-h)", lineHeight: 1.3 }}>{n.title}</p>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--secondary)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{n.message}</p>
                    <span style={{ fontSize: "11px", color: "var(--secondary)", opacity: 0.7 }}>{timeAgo(n.createdAt)}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteOne(n._id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: "2px", borderRadius: "4px", opacity: 0.5, flexShrink: 0, display: "flex", alignSelf: "flex-start" }}
                    title="Delete"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)", textAlign: "center" }}>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}
            >
              View all notifications {notifications.length > 6 ? `(${notifications.length - 6} more)` : ""}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
