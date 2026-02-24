let rateLimit;
let RedisStore;

try {
  ({ default: rateLimit } = await import("express-rate-limit"));
  ({ RedisStore } = await import("rate-limit-redis"));
} catch {
  rateLimit = null;
  RedisStore = null;
}

import { getRedisClient } from "../config/redis.js";

export const createApiRateLimiter = () => {
  if (!rateLimit || !RedisStore || process.env.ENABLE_RATE_LIMIT !== "true") {
    return (_req, _res, next) => next();
  }

  const redis = getRedisClient();

  return rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000),
    limit: Number(process.env.RATE_LIMIT_MAX || 120),
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: "ratelimit:",
    }),
  });
};

export default createApiRateLimiter;
