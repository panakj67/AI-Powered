import express from 'express'
import {
  addMessages,
  createNewChat,
  deleteChat,
  getChatById,
  getMessages,
  getUserChats,
} from '../controllers/chat.controllers.js';
import isAuth from '../middlewares/isAuth.js'
import { cacheMiddleware } from '../middleware/cache.middleware.js';
import { cacheKeys } from '../utils/cacheKeys.js';

const router = express.Router();

router.get(
  "/",
  isAuth,
  cacheMiddleware({
    keyBuilder: (req) => cacheKeys.userChats(req.userId),
    ttlSeconds: Number(process.env.CACHE_TTL_CHAT_LIST || 120),
    tags: (req) => [`user:${req.userId}:chats`],
  }),
  getUserChats
);

router.get(
  "/:chatId",
  isAuth,
  cacheMiddleware({
    keyBuilder: (req) => cacheKeys.chatById(req.params.chatId),
    ttlSeconds: Number(process.env.CACHE_TTL_CHAT_BY_ID || 90),
    tags: (req) => [`chat:${req.params.chatId}`, `user:${req.userId}:chats`],
  }),
  getChatById
);

// Create a new chat
router.post("/", isAuth, createNewChat);

// Add a new message to a chat
router.post("/:chatId/messages", isAuth, addMessages);

// Get all messages for a chat
router.get("/:chatId/messages", isAuth, getMessages);

// Delete a chat
router.delete("/:chatId", isAuth, deleteChat);

export default router;
