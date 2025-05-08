const express = require("express");
const UserPreference = require("../models/UserPreference");
const { auth } = require("../middleware/auth");
const router = express.Router();

// Get user preferences
router.get("/", auth, async (req, res) => {
  try {
    let preferences = await UserPreference.findOne({ user: req.userId });

    // If preferences don't exist, create default preferences
    if (!preferences) {
      preferences = new UserPreference({ user: req.userId });
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user preferences
router.put("/", auth, async (req, res) => {
  try {
    const { notifications, theme, dashboard } = req.body;

    let preferences = await UserPreference.findOne({ user: req.userId });

    // If preferences don't exist, create them
    if (!preferences) {
      preferences = new UserPreference({ user: req.userId });
    }

    // Update preferences
    if (notifications) {
      if (notifications.email) {
        preferences.notifications.email = {
          ...preferences.notifications.email,
          ...notifications.email,
        };
      }
      if (notifications.inApp) {
        preferences.notifications.inApp = {
          ...preferences.notifications.inApp,
          ...notifications.inApp,
        };
      }
      if (notifications.realTime) {
        preferences.notifications.realTime = {
          ...preferences.notifications.realTime,
          ...notifications.realTime,
        };
      }
    }

    if (theme) {
      preferences.theme = { ...preferences.theme, ...theme };
    }

    if (dashboard) {
      preferences.dashboard = { ...preferences.dashboard, ...dashboard };
    }

    await preferences.save();

    res.json(preferences);
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset user preferences to default
router.post("/reset", auth, async (req, res) => {
  try {
    await UserPreference.findOneAndDelete({ user: req.userId });

    // Create new default preferences
    const preferences = new UserPreference({ user: req.userId });
    await preferences.save();

    res.json(preferences);
  } catch (error) {
    console.error("Reset preferences error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
