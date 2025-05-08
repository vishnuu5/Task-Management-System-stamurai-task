const mongoose = require("mongoose");

const userPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true,
      },
      taskAssigned: {
        type: Boolean,
        default: true,
      },
      taskUpdated: {
        type: Boolean,
        default: true,
      },
      taskCompleted: {
        type: Boolean,
        default: true,
      },
      taskOverdue: {
        type: Boolean,
        default: true,
      },
      dailyDigest: {
        type: Boolean,
        default: false,
      },
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true,
      },
      taskAssigned: {
        type: Boolean,
        default: true,
      },
      taskUpdated: {
        type: Boolean,
        default: true,
      },
      taskCompleted: {
        type: Boolean,
        default: true,
      },
      taskOverdue: {
        type: Boolean,
        default: true,
      },
    },
    realTime: {
      enabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  theme: {
    mode: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    color: {
      type: String,
      default: "blue",
    },
  },
  dashboard: {
    defaultView: {
      type: String,
      enum: ["all", "assigned", "created", "overdue"],
      default: "all",
    },
    showCompletedTasks: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
userPreferenceSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const UserPreference = mongoose.model("UserPreference", userPreferenceSchema);

module.exports = UserPreference;
