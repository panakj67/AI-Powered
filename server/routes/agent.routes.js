import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createAgentRunController, getAgentRunsController, progressAgentRunController } from "../controllers/agent.controllers.js";

const router = express.Router();
router.use(isAuth);
router.post("/", createAgentRunController);
router.patch("/:id/progress", progressAgentRunController);
router.get("/", getAgentRunsController);

export default router;
