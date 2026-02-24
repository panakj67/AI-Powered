import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createReminderController, deleteReminderController, getRemindersController, updateReminderController } from "../controllers/reminder.controllers.js";

const router = express.Router();
router.use(isAuth);
router.post("/", createReminderController);
router.get("/", getRemindersController);
router.patch("/:id", updateReminderController);
router.delete("/:id", deleteReminderController);

export default router;
