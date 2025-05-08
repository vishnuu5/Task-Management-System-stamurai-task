const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "review", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for getting the assigned user's details
taskSchema.virtual("assignedUser", {
  ref: "User",
  localField: "assignedTo",
  foreignField: "_id",
  justOne: true,
});

// Virtual for getting the creator's details
taskSchema.virtual("creator", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
