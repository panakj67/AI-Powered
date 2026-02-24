import Task from "../models/task.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, task });
});

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, tasks });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, req.body, { new: true });
  res.json({ success: true, task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ success: true });
});
