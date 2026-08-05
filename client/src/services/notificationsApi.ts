import api from "./api.js";

export interface AppNotification {
  _id:        string;
  userId:     string;
  userEmail:  string;
  title:      string;
  message:    string;
  type:       "info" | "success" | "warning" | "danger";
  category:   "request" | "assignment" | "system";
  requestId?: string;
  link?:      string;
  isRead:     boolean;
  emailSent:  boolean;
  createdAt:  string;
  updatedAt:  string;
}

function extract<T>(res: { data: T }): T { return res.data; }

export const notificationsApi = {
  getAll: (userId: string, limit = 50) =>
    api.get<{ data: AppNotification[]; unreadCount: number }>(
      `/notifications?userId=${userId}&limit=${limit}`
    ).then(res => res.data),

  getUnreadCount: (userId: string) =>
    api.get<{ data: { count: number } }>(`/notifications/unread-count?userId=${userId}`)
      .then(res => res.data.data.count),

  markRead: (id: string) =>
    api.put(`/notifications/${id}/read`).then(extract),

  markAllRead: (userId: string) =>
    api.put(`/notifications/read-all?userId=${userId}`).then(extract),

  deleteOne: (id: string) =>
    api.delete(`/notifications/${id}`).then(extract),

  clearAll: (userId: string) =>
    api.delete(`/notifications/clear-all?userId=${userId}`).then(extract),
};
