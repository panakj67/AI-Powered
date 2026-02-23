import express from "express";
import { getRedisClient } from "../config/redis.js";

const router = express.Router();

router.get("/redis", async (_req, res) => {
  const redis = getRedisClient();
  try {
    const pong = await redis.ping();
    return res.status(200).json({ success: true, redis: pong, status: redis.status });
  } catch (error) {
    return res.status(503).json({ success: false, message: "Redis unavailable", error: error.message });
  }
});

export default router;
