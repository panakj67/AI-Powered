import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { createEventController, getConflictsController, getEventsController } from "../controllers/calendar.controllers.js";
import { enforcePolicy } from "../middleware/policy.middleware.js";

const router = express.Router();
router.use(isAuth);
router.post("/", enforcePolicy("event:create"), createEventController);
router.get("/", getEventsController);
router.get("/conflicts", getConflictsController);

export default router;
