const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const { auth, manager } = require("../middleware/auth");
const router = express.Router();

// Get task completion metrics
router.get("/task-completion", auth, async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    // Build date range
    const dateRange = {};
    if (startDate) dateRange.$gte = new Date(startDate);
    if (endDate) dateRange.$lte = new Date(endDate);

    // Build match stage
    const matchStage = {};
    if (Object.keys(dateRange).length > 0) {
      matchStage.createdAt = dateRange;
    }

    // If userId is provided and user is admin/manager or the user themselves
    if (
      userId &&
      (req.user.role === "admin" ||
        req.user.role === "manager" ||
        req.userId.toString() === userId)
    ) {
      matchStage.createdBy = mongoose.Types.ObjectId(userId);
    } else if (req.user.role !== "admin" && req.user.role !== "manager") {
      // Regular users can only see their own metrics
      matchStage.createdBy = req.userId;
    }

    // Get task completion metrics
    const taskCompletionMetrics = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the results
    const formattedMetrics = {
      total: 0,
      completed: 0,
      inProgress: 0,
      todo: 0,
      review: 0,
      completionRate: 0,
    };

    taskCompletionMetrics.forEach((metric) => {
      if (metric._id === "completed") {
        formattedMetrics.completed = metric.count;
      } else if (metric._id === "in-progress") {
        formattedMetrics.inProgress = metric.count;
      } else if (metric._id === "todo") {
        formattedMetrics.todo = metric.count;
      } else if (metric._id === "review") {
        formattedMetrics.review = metric.count;
      }
      formattedMetrics.total += metric.count;
    });

    // Calculate completion rate
    if (formattedMetrics.total > 0) {
      formattedMetrics.completionRate =
        (formattedMetrics.completed / formattedMetrics.total) * 100;
    }

    res.json(formattedMetrics);
  } catch (error) {
    console.error("Get task completion metrics error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get task completion by user
router.get("/task-completion-by-user", auth, manager, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date range
    const dateRange = {};
    if (startDate) dateRange.$gte = new Date(startDate);
    if (endDate) dateRange.$lte = new Date(endDate);

    // Build match stage
    const matchStage = {};
    if (Object.keys(dateRange).length > 0) {
      matchStage.createdAt = dateRange;
    }

    // Get task completion by user
    const taskCompletionByUser = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$createdBy",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
            },
          },
          todo: {
            $sum: {
              $cond: [{ $eq: ["$status", "todo"] }, 1, 0],
            },
          },
          review: {
            $sum: {
              $cond: [{ $eq: ["$status", "review"] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          total: 1,
          completed: 1,
          inProgress: 1,
          todo: 1,
          review: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$completed", "$total"] }, 100] },
            ],
          },
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
          },
        },
      },
      {
        $sort: { completionRate: -1 },
      },
    ]);

    res.json(taskCompletionByUser);
  } catch (error) {
    console.error("Get task completion by user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get overdue tasks trend
router.get("/overdue-trend", auth, async (req, res) => {
  try {
    const { days = 30, userId } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number.parseInt(days));

    // Build match stage
    const matchStage = {
      dueDate: { $gte: startDate, $lte: endDate },
      status: { $ne: "completed" },
    };

    // If userId is provided and user is admin/manager or the user themselves
    if (
      userId &&
      (req.user.role === "admin" ||
        req.user.role === "manager" ||
        req.userId.toString() === userId)
    ) {
      matchStage.createdBy = mongoose.Types.ObjectId(userId);
    } else if (req.user.role !== "admin" && req.user.role !== "manager") {
      // Regular users can only see their own metrics
      matchStage.createdBy = req.userId;
    }

    // Get overdue tasks trend
    const overdueTrend = await Task.aggregate([
      { $match: matchStage },
      {
        $project: {
          dueDate: 1,
          isOverdue: {
            $cond: [{ $lt: ["$dueDate", new Date()] }, 1, 0],
          },
          dayOfYear: { $dayOfYear: "$dueDate" },
          year: { $year: "$dueDate" },
        },
      },
      {
        $group: {
          _id: { dayOfYear: "$dayOfYear", year: "$year" },
          date: { $first: "$dueDate" },
          total: { $sum: 1 },
          overdue: { $sum: "$isOverdue" },
        },
      },
      {
        $project: {
          _id: 0,
          date: 1,
          total: 1,
          overdue: 1,
          overdueRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $multiply: [{ $divide: ["$overdue", "$total"] }, 100] },
            ],
          },
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    res.json(overdueTrend);
  } catch (error) {
    console.error("Get overdue tasks trend error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get task distribution by priority
router.get("/priority-distribution", auth, async (req, res) => {
  try {
    const { userId } = req.query;

    // Build match stage
    const matchStage = {};

    // If userId is provided and user is admin/manager or the user themselves
    if (
      userId &&
      (req.user.role === "admin" ||
        req.user.role === "manager" ||
        req.userId.toString() === userId)
    ) {
      matchStage.createdBy = mongoose.Types.ObjectId(userId);
    } else if (req.user.role !== "admin" && req.user.role !== "manager") {
      // Regular users can only see their own metrics
      matchStage.createdBy = req.userId;
    }

    // Get task distribution by priority
    const priorityDistribution = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          priority: "$_id",
          count: 1,
        },
      },
      {
        $sort: { priority: 1 },
      },
    ]);

    res.json(priorityDistribution);
  } catch (error) {
    console.error("Get priority distribution error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get task creation trend
router.get("/task-creation-trend", auth, manager, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number.parseInt(days));

    // Get task creation trend
    const taskCreationTrend = await Task.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          dayOfYear: { $dayOfYear: "$createdAt" },
          year: { $year: "$createdAt" },
          date: "$createdAt",
        },
      },
      {
        $group: {
          _id: { dayOfYear: "$dayOfYear", year: "$year" },
          date: { $first: "$date" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: 1,
          count: 1,
        },
      },
      {
        $sort: { date: 1 },
      },
    ]);

    res.json(taskCreationTrend);
  } catch (error) {
    console.error("Get task creation trend error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user activity summary
router.get("/user-activity", auth, manager, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number.parseInt(days));

    // Get user activity summary
    const userActivity = await User.aggregate([
      {
        $lookup: {
          from: "tasks",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$createdBy", "$$userId"] },
                    { $gte: ["$createdAt", startDate] },
                    { $lte: ["$createdAt", endDate] },
                  ],
                },
              },
            },
          ],
          as: "createdTasks",
        },
      },
      {
        $lookup: {
          from: "tasks",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$assignedTo", "$$userId"] },
                    { $gte: ["$createdAt", startDate] },
                    { $lte: ["$createdAt", endDate] },
                  ],
                },
              },
            },
          ],
          as: "assignedTasks",
        },
      },
      {
        $lookup: {
          from: "tasks",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$assignedTo", "$$userId"] },
                    { $eq: ["$status", "completed"] },
                    { $gte: ["$updatedAt", startDate] },
                    { $lte: ["$updatedAt", endDate] },
                  ],
                },
              },
            },
          ],
          as: "completedTasks",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          tasksCreated: { $size: "$createdTasks" },
          tasksAssigned: { $size: "$assignedTasks" },
          tasksCompleted: { $size: "$completedTasks" },
          completionRate: {
            $cond: [
              { $eq: [{ $size: "$assignedTasks" }, 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      { $size: "$completedTasks" },
                      { $size: "$assignedTasks" },
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { tasksCompleted: -1 },
      },
    ]);

    res.json(userActivity);
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
