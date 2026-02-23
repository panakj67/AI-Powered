let session;
let RedisStore;

try {
  ({ default: session } = await import("express-session"));
  ({ default: RedisStore } = await import("connect-redis"));
} catch {
  session = null;
  RedisStore = null;
}

import { getRedisClient } from "../config/redis.js";

export const createSessionMiddleware = () => {
  if (
    process.env.ENABLE_REDIS_SESSION !== "true" ||
    !session ||
    !RedisStore ||
    !process.env.SESSION_SECRET
  ) {
    return (_req, _res, next) => next();
  }

  const redisClient = getRedisClient();
  const store = new RedisStore({
    client: redisClient,
    prefix: process.env.REDIS_SESSION_PREFIX || "sess:",
  });

  return session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(process.env.SESSION_TTL_MS || 24 * 60 * 60 * 1000),
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  });
};

export default createSessionMiddleware;
