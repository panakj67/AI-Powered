import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getInsightsController } from "../controllers/analytics.controllers.js";

const router = express.Router();
router.use(isAuth);
router.get("/", getInsightsController);

export default router;
