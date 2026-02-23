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

export const getCache = async (key) => {
  const client = getRedisClient();
  try {
    const raw = await client.get(key);
    if (!raw) {
      console.log(`[cache] MISS ${key}`);
      return null;
    }
    console.log(`[cache] HIT ${key}`);
    return safeParse(raw);
  } catch (error) {
    console.error(`[cache] ERROR get ${key}`, error?.message || error);
    return null;
  }
};

export const setCache = async (key, value, options = {}) => {
  const client = getRedisClient();
  const ttlSeconds = Number(options.ttlSeconds || DEFAULT_TTL_SECONDS);
  const staleSeconds = Number(options.staleSeconds || DEFAULT_STALE_SECONDS);
  const tags = options.tags || [];

  const payload = safeStringify(value);
  if (!payload) return;

  try {
    const pipeline = client.pipeline();
    pipeline.set(key, payload, "EX", ttlSeconds);
    pipeline.set(cacheKeys.stale(key), payload, "EX", ttlSeconds + staleSeconds);

    for (const tag of tags) {
      pipeline.sadd(cacheKeys.tag(tag), key);
      pipeline.expire(cacheKeys.tag(tag), ttlSeconds + staleSeconds);
    }

    await pipeline.exec();
  } catch (error) {
    console.error(`[cache] ERROR set ${key}`, error?.message || error);
  }
};

export const getStaleCache = async (key) => {
  const client = getRedisClient();
  try {
    const raw = await client.get(cacheKeys.stale(key));
    return safeParse(raw);
  } catch (error) {
    console.error(`[cache] ERROR get stale ${key}`, error?.message || error);
    return null;
  }
};

export const deleteCacheKeys = async (keys = []) => {
  if (!keys.length) return;
  const client = getRedisClient();
  try {
    await client.unlink(...keys);
  } catch (error) {
    console.error("[cache] ERROR delete keys", error?.message || error);
  }
};

export const invalidateByTags = async (tags = []) => {
  if (!tags.length) return;
  const client = getRedisClient();

  try {
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
  } catch (error) {
    console.error("[cache] ERROR invalidate by tags", error?.message || error);
  }
};

export const invalidateByPattern = async (pattern) => {
  const client = getRedisClient();
  let cursor = "0";

  try {
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 200);
      cursor = nextCursor;
      if (keys.length) {
        await client.unlink(...keys);
      }
    } while (cursor !== "0");
  } catch (error) {
    console.error("[cache] ERROR invalidate by pattern", error?.message || error);
  }
};

export const acquireLock = async (key, ttlMs = DEFAULT_LOCK_TTL_MS) => {
  const client = getRedisClient();
  const lockKey = cacheKeys.lock(key);

  try {
    const result = await client.set(lockKey, "1", "PX", ttlMs, "NX");
    return result === "OK";
  } catch (error) {
    console.error(`[cache] ERROR lock acquire ${key}`, error?.message || error);
    return false;
  }
};

export const releaseLock = async (key) => {
  const client = getRedisClient();
  try {
    await client.del(cacheKeys.lock(key));
  } catch (error) {
    console.error(`[cache] ERROR lock release ${key}`, error?.message || error);
  }
};
