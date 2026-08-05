import type { Request, Response } from "express";
import { Notification } from "./notification.model.js";

/** GET /api/notifications?userId=xxx&limit=50 */
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.query["userId"] ?? "");
    if (!userId) { res.status(400).json({ success: false, message: "userId is required" }); return; }

    const limit = Math.min(Number(req.query["limit"] ?? 50), 100);

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications", error: String(error) });
  }
};

/** GET /api/notifications/unread-count?userId=xxx */
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.query["userId"] ?? "");
    if (!userId) { res.json({ success: true, data: { count: 0 } }); return; }
    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get count", error: String(error) });
  }
};

/** PUT /api/notifications/:id/read */
export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndUpdate(req.params["id"], { isRead: true });
    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark as read", error: String(error) });
  }
};

/** PUT /api/notifications/read-all?userId=xxx */
export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.query["userId"] ?? "");
    if (!userId) { res.status(400).json({ success: false, message: "userId is required" }); return; }
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark all read", error: String(error) });
  }
};

/** DELETE /api/notifications/:id */
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndDelete(req.params["id"]);
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed", error: String(error) });
  }
};

/** DELETE /api/notifications/clear-all?userId=xxx */
export const clearAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.query["userId"] ?? "");
    if (!userId) { res.status(400).json({ success: false, message: "userId is required" }); return; }
    await Notification.deleteMany({ userId });
    res.json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Clear failed", error: String(error) });
  }
};
