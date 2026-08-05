import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  clearAll,
} from "./notification.controller.js";

const router = Router();

router.get("/",                getNotifications);  // ?userId=xxx
router.get("/unread-count",    getUnreadCount);    // ?userId=xxx
router.put("/read-all",        markAllRead);       // ?userId=xxx
router.delete("/clear-all",    clearAll);          // ?userId=xxx
router.put("/:id/read",        markRead);
router.delete("/:id",         deleteNotification);

export default router;
