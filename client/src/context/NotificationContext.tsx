import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext.js";
import { notificationsApi, type AppNotification } from "../services/notificationsApi.js";

interface NotificationContextValue {
  notifications:  AppNotification[];
  unreadCount:    number;
  loading:        boolean;
  refresh:        () => Promise<void>;
  markRead:       (id: string) => Promise<void>;
  markAllRead:    () => Promise<void>;
  deleteOne:      (id: string) => Promise<void>;
  clearAll:       () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const POLL_INTERVAL_MS = 30_000; // poll every 30 s

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!user || !isAuthenticated) return;
    setLoading(true);
    try {
      const { data, unreadCount: count } = await notificationsApi.getAll(user.id, 50);
      setNotifications(data);
      setUnreadCount(count);
    } catch {
      // fail silently — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Initial fetch + polling
  useEffect(() => {
    if (!isAuthenticated) { setNotifications([]); setUnreadCount(0); return; }
    refresh();
    timerRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAuthenticated, refresh]);

  const markRead = useCallback(async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    await notificationsApi.markAllRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, [user]);

  const deleteOne = useCallback(async (id: string) => {
    const wasUnread = notifications.find(n => n._id === id)?.isRead === false;
    await notificationsApi.deleteOne(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    if (!user) return;
    await notificationsApi.clearAll(user.id);
    setNotifications([]);
    setUnreadCount(0);
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead, deleteOne, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
};
