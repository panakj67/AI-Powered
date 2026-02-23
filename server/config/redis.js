import Redis from "ioredis";

let redisClient;

export const getRedisClient = () => {
  if (redisClient) return redisClient;

  const useTls = process.env.REDIS_TLS === "true";

  redisClient = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0),
    keyPrefix: process.env.REDIS_KEY_PREFIX || "aura:",
    maxRetriesPerRequest: Number(process.env.REDIS_MAX_RETRIES || 2),
    enableAutoPipelining: true,
    lazyConnect: true,
    tls: useTls ? {} : undefined,
  });

  redisClient.on("connect", () => console.log("[redis] connected"));
  redisClient.on("error", (error) => console.error("[redis] error", error?.message || error));
  redisClient.on("reconnecting", () => console.warn("[redis] reconnecting"));

  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();
  if (client.status !== "ready") {
    await client.connect();
  }
  return client;
};

export default getRedisClient;
