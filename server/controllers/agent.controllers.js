import AgentRun from "../models/agentRun.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { executeStep, planSteps, updateProgress } from "../services/agent.service.js";

export const createAgentRunController = asyncHandler(async (req, res) => {
  const steps = await planSteps(req.body.goal);
  const run = await AgentRun.create({ userId: req.userId, goal: req.body.goal, steps, status: "planned" });
  res.status(201).json({ success: true, run });
});

export const progressAgentRunController = asyncHandler(async (req, res) => {
  const run = await AgentRun.findOne({ _id: req.params.id, userId: req.userId });
  if (!run) return res.status(404).json({ success: false, message: "Run not found" });
  await executeStep(run, Number(req.body.stepIndex || 0));
  await updateProgress(run);
  await run.save();
  res.json({ success: true, run });
});

export const getAgentRunsController = asyncHandler(async (req, res) => {
  const runs = await AgentRun.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, runs });
});
