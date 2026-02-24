import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addCommentController, createWorkspaceController, getWorkspacesController } from "../controllers/workspace.controllers.js";

const router = express.Router();
router.use(isAuth);
router.post("/", createWorkspaceController);
router.get("/", getWorkspacesController);
router.post("/:id/comments", addCommentController);

export default router;
