// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middlewares/authMiddleware"); // protect routes

// Get all notifications for logged-in user
router.get("/", authMiddleware, notificationController.getUserNotifications);

// Mark a single notification as read
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

// Mark all notifications as read
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);

module.exports = router;
