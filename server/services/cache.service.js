import { randomUUID } from "crypto";
import { getRedisClient } from "../config/redis.js";
import { cacheKeys } from "../utils/cacheKeys.js";

const DEFAULT_TTL_SECONDS = Number(process.env.CACHE_DEFAULT_TTL || 120);
const DEFAULT_LOCK_TTL_MS = Number(process.env.CACHE_LOCK_TTL_MS || 5000);
const DEFAULT_STALE_SECONDS = Number(process.env.CACHE_STALE_TTL || 600);

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("[cache] json parse error", error?.message || error);
    return null;
  }
};

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("[cache] json stringify error", error?.message || error);
    return null;
  }
};

const withRedisSafe = async (callback, fallback = null) => {
  try {
    const client = getRedisClient();
    return await callback(client);
  } catch (error) {
    console.error("[cache] redis unavailable", error?.message || error);
    return fallback;
  }
};

export const getCache = async (key) => {
  return withRedisSafe(async (client) => {
    const raw = await client.get(key);
    if (!raw) {
      console.log(`[cache] MISS ${key}`);
      return null;
    }
    console.log(`[cache] HIT ${key}`);
    return safeParse(raw);
  });
};

export const setCache = async (key, value, options = {}) => {
  const ttlSeconds = Number(options.ttlSeconds || DEFAULT_TTL_SECONDS);
  const staleSeconds = Number(options.staleSeconds || DEFAULT_STALE_SECONDS);
  const tags = options.tags || [];

  const payload = safeStringify(value);
  if (!payload) return;

  await withRedisSafe(async (client) => {
    const pipeline = client.pipeline();
    pipeline.set(key, payload, "EX", ttlSeconds);
    pipeline.set(cacheKeys.stale(key), payload, "EX", ttlSeconds + staleSeconds);

    for (const tag of tags) {
      pipeline.sadd(cacheKeys.tag(tag), key);
      pipeline.expire(cacheKeys.tag(tag), ttlSeconds + staleSeconds);
    }

    await pipeline.exec();
  });
};

export const getStaleCache = async (key) => {
  return withRedisSafe(async (client) => {
    const raw = await client.get(cacheKeys.stale(key));
    return safeParse(raw);
  });
};

export const invalidateByTags = async (tags = []) => {
  if (!tags.length) return;

  await withRedisSafe(async (client) => {
    const pipeline = client.pipeline();
    for (const tag of tags) {
      pipeline.smembers(cacheKeys.tag(tag));
    }

    const result = await pipeline.exec();
    const keysToDelete = [];

    for (const [, keys] of result) {
      if (Array.isArray(keys)) {
        keysToDelete.push(...keys);
        keysToDelete.push(...keys.map((k) => cacheKeys.stale(k)));
      }
    }

    if (keysToDelete.length) {
      const uniqueKeys = [...new Set(keysToDelete)];
      await client.unlink(...uniqueKeys);
    }

    const clearTags = client.pipeline();
    for (const tag of tags) clearTags.del(cacheKeys.tag(tag));
    await clearTags.exec();
  });
};

export const invalidateByPattern = async (pattern) => {
  await withRedisSafe(async (client) => {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 200);
      cursor = nextCursor;
      if (keys.length) {
        await client.unlink(...keys);
      }
    } while (cursor !== "0");
  });
};

export const acquireLock = async (key, ttlMs = DEFAULT_LOCK_TTL_MS) => {
  return withRedisSafe(async (client) => {
    const lockKey = cacheKeys.lock(key);
    const token = randomUUID();

    const result = await client.set(lockKey, token, "PX", ttlMs, "NX");
    if (result !== "OK") return null;

    return token;
  });
};

export const releaseLock = async (key, token) => {
  if (!token) return;

  await withRedisSafe(async (client) => {
    const releaseScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1]
      then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;

    await client.eval(releaseScript, 1, cacheKeys.lock(key), token);
  });
};
