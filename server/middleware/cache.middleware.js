import {
  acquireLock,
  getCache,
  getStaleCache,
  releaseLock,
  setCache,
} from "../services/cache.service.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const cacheMiddleware = (options = {}) => {
  const ttlSeconds = Number(options.ttlSeconds || process.env.CACHE_DEFAULT_TTL || 120);
  const staleSeconds = Number(options.staleSeconds || process.env.CACHE_STALE_TTL || 600);
  const tags = options.tags || [];
  const lockWaitMs = Number(options.lockWaitMs || process.env.CACHE_LOCK_WAIT_MS || 1500);
  const lockRetryEveryMs = Number(options.lockRetryEveryMs || 100);

  if (typeof options.keyBuilder !== "function") {
    throw new Error("cacheMiddleware requires a keyBuilder function");
  }

  return async (req, res, next) => {
    const key = options.keyBuilder(req);
    req.cacheKey = key;

    const hit = await getCache(key);
    if (hit) {
      return res.status(200).json(hit);
    }

    const lockAcquired = await acquireLock(key);

    if (!lockAcquired) {
      const waitLoops = Math.ceil(lockWaitMs / lockRetryEveryMs);

      for (let i = 0; i < waitLoops; i += 1) {
        await sleep(lockRetryEveryMs);
        const cachedAfterWait = await getCache(key);
        if (cachedAfterWait) {
          return res.status(200).json(cachedAfterWait);
        }
      }

      const stale = await getStaleCache(key);
      if (stale) {
        console.log(`[cache] STALE_SERVE ${key}`);
        return res.status(200).json(stale);
      }
    }

    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        const shouldCache = res.statusCode >= 200 && res.statusCode < 300 && body && !body?.token;
        if (shouldCache) {
          await setCache(key, body, {
            ttlSeconds,
            staleSeconds,
            tags: typeof tags === "function" ? tags(req, body) : tags,
          });
        }
      } catch (error) {
        console.error("[cache] ERROR while storing response", error?.message || error);
      } finally {
        if (lockAcquired) {
          await releaseLock(key);
        }
      }

      return originalJson(body);
    };

    next();
  };
};

export default cacheMiddleware;
