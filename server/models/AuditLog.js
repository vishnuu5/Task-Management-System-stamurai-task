const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: [
      "create",
      "update",
      "delete",
      "assign",
      "status_change",
      "login",
      "logout",
      "register",
    ],
  },
  entityType: {
    type: String,
    required: true,
    enum: ["task", "user", "notification", "system"],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  details: {
    type: Object,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
