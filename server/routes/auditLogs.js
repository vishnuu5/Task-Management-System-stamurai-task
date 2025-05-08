const express = require("express");
const AuditLog = require("../models/AuditLog");
const { auth, admin, manager } = require("../middleware/auth");
const router = express.Router();

// Get all audit logs (admin only)
router.get("/", auth, admin, async (req, res) => {
  try {
    const {
      user,
      action,
      entityType,
      startDate,
      endDate,
      limit = 50,
      page = 1,
    } = req.query;

    // Build query
    const query = {};

    if (user) query.user = user;
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    // Date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    // Get audit logs
    const auditLogs = await AuditLog.find(query)
      .populate("user", "name email")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit));

    // Get total count for pagination
    const total = await AuditLog.countDocuments(query);

    res.json({
      auditLogs,
      pagination: {
        total,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get audit log by ID (admin only)
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!auditLog) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(auditLog);
  } catch (error) {
    console.error("Get audit log error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get audit logs for a specific entity (admin and managers)
router.get("/entity/:type/:id", auth, async (req, res) => {
  try {
    // Check if user is admin or manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { type, id } = req.params;
    const { limit = 20 } = req.query;

    const auditLogs = await AuditLog.find({
      entityType: type,
      entityId: id,
    })
      .populate("user", "name email")
      .sort({ timestamp: -1 })
      .limit(Number.parseInt(limit));

    res.json(auditLogs);
  } catch (error) {
    console.error("Get entity audit logs error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
