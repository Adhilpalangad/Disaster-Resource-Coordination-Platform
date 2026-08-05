import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Trash2, RefreshCw,
  CheckCircle2, AlertTriangle, Info, AlertCircle,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext.js";
import type { AppNotification } from "../../services/notificationsApi.js";
import PageContainer from "../../components/PageContainer.js";
import PageHeader    from "../../components/PageHeader.js";
import EmptyState    from "../../components/EmptyState.js";

const TYPE_CONFIG: Record<AppNotification["type"], { color: string; bg: string; Icon: React.ElementType }> = {
  success: { color: "var(--success)", bg: "rgba(5,150,105,0.1)",   Icon: CheckCircle2   },
  info:    { color: "var(--primary)", bg: "rgba(2,132,199,0.1)",   Icon: Info           },
  warning: { color: "var(--warning)", bg: "rgba(245,158,11,0.1)", Icon: AlertTriangle   },
  danger:  { color: "var(--danger)",  bg: "rgba(239,68,68,0.1)",   Icon: AlertCircle    },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications, unreadCount, loading,
    refresh, markRead, markAllRead, deleteOne, clearAll,
  } = useNotifications();

  const handleClick = async (n: AppNotification) => {
    if (!n.isRead) await markRead(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="All system alerts, request updates, and task dispatches."
        breadcrumbs={[{ label: "Overview", path: "/" }, { label: "Notifications" }]}
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={refresh} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
              <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--card-bg)", color: "var(--text-h)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                <CheckCheck size={14} /> Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--danger)", backgroundColor: "var(--card-bg)", color: "var(--danger)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        }
      />

      {/* Unread summary */}
      {unreadCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", backgroundColor: "rgba(2,132,199,0.06)", border: "1px solid rgba(2,132,199,0.2)", marginBottom: "16px" }}>
          <Bell size={15} style={{ color: "var(--primary)", flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-h)", fontWeight: 500 }}>
            You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? "s" : ""}.
          </p>
          <button onClick={markAllRead}
            style={{ marginLeft: "auto", fontSize: "12px", fontWeight: 600, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline", whiteSpace: "nowrap" }}>
            Mark all read
          </button>
        </div>
      )}

      {loading && notifications.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: "72px", backgroundColor: "var(--border)", borderRadius: "12px", opacity: 0.4 }} />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={36} />}
          title="No notifications yet"
          description="You'll receive updates here whenever your request changes status, a volunteer is assigned, or other important events occur."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info;
            const { Icon } = cfg;
            return (
              <div
                key={n._id}
                onClick={() => handleClick(n)}
                style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "13px 16px", borderRadius: "12px", border: `1px solid ${n.isRead ? "var(--border)" : "rgba(2,132,199,0.25)"}`, backgroundColor: n.isRead ? "var(--card-bg)" : "rgba(2,132,199,0.04)", cursor: n.link ? "pointer" : "default", transition: "background 0.15s" }}
                onMouseEnter={e => { if (n.link) (e.currentTarget as HTMLDivElement).style.backgroundColor = "var(--bg)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = n.isRead ? "var(--card-bg)" : "rgba(2,132,199,0.04)"; }}
              >
                {/* Icon */}
                <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", justifyContent: "space-between" }}>
                    <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: n.isRead ? 500 : 700, color: "var(--text-h)", lineHeight: 1.3 }}>
                      {!n.isRead && <span style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "var(--primary)", marginRight: "7px", verticalAlign: "middle", flexShrink: 0 }} />}
                      {n.title}
                    </p>
                    <span style={{ fontSize: "11px", color: "var(--secondary)", whiteSpace: "nowrap", flexShrink: 0, marginTop: "1px" }}>{timeAgo(n.createdAt)}</span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", color: "var(--secondary)", lineHeight: 1.55 }}>{n.message}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", padding: "1px 7px", borderRadius: "5px", backgroundColor: cfg.bg, color: cfg.color, fontWeight: 600, textTransform: "uppercase" }}>
                      {n.category}
                    </span>
                    {n.emailSent && (
                      <span style={{ fontSize: "11px", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "3px" }}>
                        ✉ emailed
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={e => { e.stopPropagation(); deleteOne(n._id); }}
                  title="Delete"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--secondary)", padding: "4px", borderRadius: "5px", display: "flex", flexShrink: 0, opacity: 0.5 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </PageContainer>
  );
};

export default Notifications;
