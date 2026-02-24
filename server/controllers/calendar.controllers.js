import Event from "../models/event.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createEvent, detectConflicts } from "../services/calendar.service.js";

export const createEventController = asyncHandler(async (req, res) => {
  const event = await createEvent({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, event });
});

export const getEventsController = asyncHandler(async (req, res) => {
  const events = await Event.find({ userId: req.userId }).sort({ startTime: 1 });
  res.json({ success: true, events });
});

export const getConflictsController = asyncHandler(async (req, res) => {
  const conflicts = await detectConflicts({ userId: req.userId, ...req.query });
  res.json({ success: true, conflicts });
});
