import express from "express";
import { getRedisClient } from "../config/redis.js";

const router = express.Router();

router.get("/redis", async (_req, res) => {
  const redis = getRedisClient();
  const start = Date.now();

  try {
    const pong = await redis.ping();
    return res.status(200).json({
      success: true,
      redis: pong,
      status: redis.status,
      latencyMs: Date.now() - start,
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Redis unavailable",
      status: redis.status,
      latencyMs: Date.now() - start,
      error: error.message,
    });
  }
});

export default router;
