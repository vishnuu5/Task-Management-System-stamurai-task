const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Notification = require("../models/Notification");

// Get all notifications for the current user
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Mark a notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: "Notification not found" });
    }

    // Check if the notification belongs to the user
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorized" });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Clear all notifications for the current user
router.delete("/clear", auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ msg: "All notifications cleared" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Create a new notification (for testing)
router.post("/test", auth, async (req, res) => {
  try {
    const { title, message } = req.body;

    const newNotification = new Notification({
      user: req.user.id,
      title: title || "Test Notification",
      message: message || "This is a test notification",
      read: false,
      timestamp: Date.now(),
    });

    const notification = await newNotification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
