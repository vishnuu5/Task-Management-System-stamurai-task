const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "task_assigned",
      "task_updated",
      "task_completed",
      "task_overdue",
      "system",
    ],
    default: "system",
  },
  read: {
    type: Boolean,
    default: false,
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
