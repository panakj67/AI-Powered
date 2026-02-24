import { asyncHandler } from "../utils/asyncHandler.js";
import { createReminder, deleteReminder, getUserReminders, updateReminder } from "../services/reminder.service.js";

export const createReminderController = asyncHandler(async (req, res) => {
  const reminder = await createReminder({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, reminder });
});

export const getRemindersController = asyncHandler(async (req, res) => {
  const reminders = await getUserReminders(req.userId);
  res.json({ success: true, reminders });
});

export const updateReminderController = asyncHandler(async (req, res) => {
  const reminder = await updateReminder(req.params.id, req.userId, req.body);
  res.json({ success: true, reminder });
});

export const deleteReminderController = asyncHandler(async (req, res) => {
  await deleteReminder(req.params.id, req.userId);
  res.json({ success: true });
});
