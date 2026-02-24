const APP_NS = process.env.CACHE_NAMESPACE || "app";

export const cacheKeys = {
  userChats: (userId) => `${APP_NS}:user:${userId}:chats`,
  chatById: (userId, chatId) => `${APP_NS}:user:${userId}:chat:${chatId}`,
  chatMessages: (userId, chatId) => `${APP_NS}:user:${userId}:chat:${chatId}:messages`,
  lock: (key) => `${APP_NS}:lock:${key}`,
  stale: (key) => `${APP_NS}:stale:${key}`,
  tag: (tagName) => `${APP_NS}:tag:${tagName}`,
};

export default cacheKeys;
