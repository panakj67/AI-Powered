import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getMemoriesController, saveMemoryController } from "../controllers/memory.controllers.js";

const router = express.Router();
router.use(isAuth);
router.post("/", saveMemoryController);
router.get("/", getMemoriesController);

export default router;
