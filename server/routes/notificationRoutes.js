import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// Protect all notification routes
router.use(protect);

// Get all notifications
router.get("/", getNotifications);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

// Clear all notifications
// Keep this BEFORE /:id
router.delete("/clear", clearNotifications);

// Delete one notification
router.delete("/:id", deleteNotification);

export default router;
