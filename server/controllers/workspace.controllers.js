import Workspace from "../models/workspace.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createWorkspaceController = asyncHandler(async (req, res) => {
  const workspace = await Workspace.create({
    name: req.body.name,
    members: [{ userId: req.userId, role: "admin" }],
    sharedChats: req.body.sharedChats || [],
  });
  res.status(201).json({ success: true, workspace });
});

export const getWorkspacesController = asyncHandler(async (req, res) => {
  const workspaces = await Workspace.find({ "members.userId": req.userId });
  res.json({ success: true, workspaces });
});

export const addCommentController = asyncHandler(async (req, res) => {
  const workspace = await Workspace.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { userId: req.userId, text: req.body.text } } },
    { new: true }
  );
  res.json({ success: true, workspace });
});
