import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/task.controllers.js";

const router = express.Router();
router.use(isAuth);
router.post("/", createTask);
router.get("/", getTasks);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
