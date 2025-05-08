const cron = require("node-cron");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

// Initialize recurring task scheduler
const initializeRecurringTaskScheduler = () => {
  // Run every day at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running recurring task scheduler...");
      await createRecurringTasks();
    } catch (error) {
      console.error("Error in recurring task scheduler:", error);
    }
  });

  console.log("Recurring task scheduler initialized");
};

// Create recurring tasks
const createRecurringTasks = async () => {
  try {
    // Get all recurring tasks
    const recurringTasks = await Task.find({ isRecurring: true })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createdTasks = [];

    // Process each recurring task
    for (const task of recurringTasks) {
      const dueDate = new Date(task.dueDate);
      let shouldCreateTask = false;

      // Check if we should create a new task instance based on the recurring pattern
      switch (task.recurringPattern) {
        case "daily":
          shouldCreateTask = true;
          break;

        case "weekly":
          // If the day of the week matches
          if (dueDate.getDay() === today.getDay()) {
            shouldCreateTask = true;
          }
          break;

        case "monthly":
          // If the day of the month matches
          if (dueDate.getDate() === today.getDate()) {
            shouldCreateTask = true;
          }
          break;

        default:
          break;
      }

      if (shouldCreateTask) {
        // Calculate the new due date
        const newDueDate = new Date(today);

        // Set the time from the original due date
        newDueDate.setHours(
          dueDate.getHours(),
          dueDate.getMinutes(),
          dueDate.getSeconds(),
          dueDate.getMilliseconds()
        );

        // Create a new task instance
        const newTask = new Task({
          title: task.title,
          description: task.description,
          status: "todo", // Always start as todo
          priority: task.priority,
          dueDate: newDueDate,
          assignedTo: task.assignedTo,
          createdBy: task.createdBy,
          isRecurring: false, // This instance is not recurring
        });

        await newTask.save();
        createdTasks.push(newTask);

        // Create notification for assigned user
        if (task.assignedTo) {
          const notification = new Notification({
            user: task.assignedTo,
            title: "Recurring Task Created",
            message: `A recurring task has been created: ${task.title}`,
            type: "task_assigned",
            relatedTask: newTask._id,
          });

          await notification.save();
        }
      }
    }

    console.log(`Created ${createdTasks.length} recurring tasks`);
    return createdTasks;
  } catch (error) {
    console.error("Error creating recurring tasks:", error);
    throw error;
  }
};

module.exports = {
  initializeRecurringTaskScheduler,
  createRecurringTasks,
};
