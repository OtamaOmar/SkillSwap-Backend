import express from "express";
import { authenticateToken } from "../middleware.js";
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
} from "../controllers/notificationsController.js";

const router = express.Router();

router.get("/", authenticateToken, getMyNotifications);
router.get("/unread-count", authenticateToken, getUnreadCount);
router.patch("/read-all", authenticateToken, markAllRead);
router.patch("/:id/read", authenticateToken, markNotificationRead);

export default router;
