const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { auth, manager } = require("../middleware/auth");
const router = express.Router();

// Get all tasks
router.get("/", auth, async (req, res) => {
  try {
    const { status, priority, search, assignedTo, createdBy } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (createdBy) query.createdBy = createdBy;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get tasks
    const tasks = await Task.find(query)
      .populate("assignedUser", "name email avatar")
      .populate("creator", "name email avatar")
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get task by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedUser", "name email avatar")
      .populate("creator", "name email avatar");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// Create a new task
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      isRecurring,
      recurringPattern,
    } = req.body;

    // Create task
    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.userId,
      isRecurring,
      recurringPattern,
    });

    await task.save();

    // Create notification if task is assigned to someone
    if (assignedTo) {
      const notification = new Notification({
        user: assignedTo,
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${title}`,
        type: "task_assigned",
        relatedTask: task._id,
      });

      await notification.save();
    }

    // Populate user data
    await task.populate("assignedUser", "name email avatar");
    await task.populate("creator", "name email avatar");

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update task
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      isRecurring,
      recurringPattern,
    } = req.body;

    // Find task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is authorized to update task
    if (
      task.createdBy.toString() !== req.userId.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "manager"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Check if assignee has changed
    const assigneeChanged =
      assignedTo && task.assignedTo?.toString() !== assignedTo.toString();

    // Update task
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.assignedTo = assignedTo || task.assignedTo;
    task.isRecurring =
      isRecurring !== undefined ? isRecurring : task.isRecurring;
    task.recurringPattern = recurringPattern || task.recurringPattern;

    await task.save();

    // Create notification if assignee has changed
    if (assigneeChanged) {
      const notification = new Notification({
        user: assignedTo,
        title: "Task Assigned",
        message: `You have been assigned to the task: ${task.title}`,
        type: "task_assigned",
        relatedTask: task._id,
      });

      await notification.save();
    }

    // Create notification if status has changed to completed
    if (status === "completed" && task.status !== "completed") {
      // Notify task creator
      const notification = new Notification({
        user: task.createdBy,
        title: "Task Completed",
        message: `The task "${task.title}" has been marked as completed`,
        type: "task_completed",
        relatedTask: task._id,
      });

      await notification.save();
    }

    // Populate user data
    await task.populate("assignedUser", "name email avatar");
    await task.populate("creator", "name email avatar");

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// Update task status
router.patch("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    // Find task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update status
    task.status = status;
    await task.save();

    // Create notification if status has changed to completed
    if (status === "completed") {
      // Notify task creator
      const notification = new Notification({
        user: task.createdBy,
        title: "Task Completed",
        message: `The task "${task.title}" has been marked as completed`,
        type: "task_completed",
        relatedTask: task._id,
      });

      await notification.save();
    }

    // Populate user data
    await task.populate("assignedUser", "name email avatar");
    await task.populate("creator", "name email avatar");

    res.json(task);
  } catch (error) {
    console.error("Update task status error:", error);

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    // Find task
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is authorized to delete task
    if (
      task.createdBy.toString() !== req.userId.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "manager"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();

    // Delete related notifications
    await Notification.deleteMany({ relatedTask: req.params.id });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);

    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
