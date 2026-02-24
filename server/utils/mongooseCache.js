import { getCache, setCache } from "../services/cache.service.js";

export const execWithCache = async ({ key, query, ttlSeconds = 120, tags = [] }) => {
  const cached = await getCache(key);
  if (cached) return cached;

  const data = await query;
  await setCache(key, data, { ttlSeconds, tags });
  return data;
};

export default execWithCache;
