import Reminder from "../models/reminder.model.js";

const timers = new Map();

export const triggerReminder = async (reminder) => {
  const now = new Date();
  if (reminder.datetime < now && reminder.status === "pending") {
    await Reminder.findByIdAndUpdate(reminder._id, { status: "missed" });
  }
  return {
    reminderId: reminder._id,
    followUpSuggestion: reminder.followUpSuggestion || "Do you want me to create a follow-up task?",
  };
};

const scheduleReminder = (reminder) => {
  if (timers.has(String(reminder._id))) clearTimeout(timers.get(String(reminder._id)));
  const delay = new Date(reminder.datetime).getTime() - Date.now();
  if (delay <= 0) return;
  const timer = setTimeout(async () => {
    await triggerReminder(reminder);
    timers.delete(String(reminder._id));
  }, delay);
  timers.set(String(reminder._id), timer);
};

export const bootstrapReminderScheduler = async () => {
  const pending = await Reminder.find({ status: "pending", datetime: { $gte: new Date() } });
  pending.forEach(scheduleReminder);
};

export const createReminder = async (payload) => {
  const reminder = await Reminder.create(payload);
  scheduleReminder(reminder);
  return reminder;
};

export const updateReminder = async (id, userId, payload) => {
  const reminder = await Reminder.findOneAndUpdate({ _id: id, userId }, payload, { new: true });
  if (reminder) scheduleReminder(reminder);
  return reminder;
};

export const deleteReminder = async (id, userId) => {
  if (timers.has(String(id))) clearTimeout(timers.get(String(id)));
  return Reminder.findOneAndDelete({ _id: id, userId });
};

export const getUserReminders = async (userId) => Reminder.find({ userId }).sort({ datetime: 1 });
