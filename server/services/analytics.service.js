import Task from "../models/task.model.js";
import Reminder from "../models/reminder.model.js";
import Email from "../models/email.model.js";

export const getInsights = async (userId) => {
  const [completedTasks, reminders, emailsSent] = await Promise.all([
    Task.countDocuments({ userId, status: "done" }),
    Reminder.find({ userId }),
    Email.countDocuments({ userId, status: "sent" }),
  ]);

  const reminderSuccessRate = reminders.length
    ? (reminders.filter((r) => r.status === "completed").length / reminders.length) * 100
    : 0;

  return {
    tasksCompleted: completedTasks,
    reminderSuccessRate: Number(reminderSuccessRate.toFixed(2)),
    emailsSent,
    productivityScore: Math.min(100, completedTasks * 10 + emailsSent * 5),
    timeSavedEstimateHours: Number((completedTasks * 0.5 + emailsSent * 0.2).toFixed(1)),
  };
};
