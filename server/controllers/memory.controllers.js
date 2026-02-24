import { asyncHandler } from "../utils/asyncHandler.js";
import { retrieveRelevantMemory, storeMemory } from "../services/memory.service.js";

export const saveMemoryController = asyncHandler(async (req, res) => {
  const memory = await storeMemory({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, memory });
});

export const getMemoriesController = asyncHandler(async (req, res) => {
  const keys = req.query.keys ? String(req.query.keys).split(",") : [];
  const memories = await retrieveRelevantMemory(req.userId, keys);
  res.json({ success: true, memories });
});
