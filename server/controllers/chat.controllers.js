import chatModel from "../models/chat.model.js";
import User from "../models/user.model.js";
import { invalidateByTags } from "../services/cache.service.js";
import { cacheKeys } from "../utils/cacheKeys.js";
import execWithCache from "../utils/mongooseCache.js";

const chatMessagesTTL = Number(process.env.CACHE_TTL_CHAT_MESSAGES || 60);

const assertChatOwnership = async (userId, chatId) => {
  const user = await User.findById(userId).select("chats");
  if (!user) return { user: null, ownsChat: false };

  const ownsChat = user.chats.some((id) => String(id) === String(chatId));
  return { user, ownsChat };
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await User.findById(userId).populate("chats").select("chats");

    if (!chats) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, chats: chats.chats || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const { ownsChat } = await assertChatOwnership(req.userId, chatId);

    if (!ownsChat) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const chat = await chatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    return res.status(200).json({ success: true, chat });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createNewChat = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const chat = await chatModel.create({ title });

    user.chats.push(chat._id);
    await user.save();

    await invalidateByTags([`user:${req.userId}:chats`]);

    return res.status(201).json({ success: true, chat });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addMessages = async (req, res) => {
  try {
    const { sender, text } = req.body;
    const chatId = req.params.chatId;

    if (!chatId || !sender || !text) {
      return res.status(400).json({ success: false, message: "chat_id, sender and text are required" });
    }

    const { ownsChat } = await assertChatOwnership(req.userId, chatId);
    if (!ownsChat) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const chat = await chatModel.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    chat.messages.push({ sender, text });
    await chat.save();

    await invalidateByTags([
      `chat:${chatId}`,
      `chat:${chatId}:messages`,
      `user:${req.userId}:chats`,
    ]);

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) {
      return res.status(400).json({ success: false, message: "chat_id is required" });
    }

    const { ownsChat } = await assertChatOwnership(req.userId, chatId);
    if (!ownsChat) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const chat = await execWithCache({
      key: cacheKeys.chatMessages(chatId),
      ttlSeconds: chatMessagesTTL,
      tags: [`chat:${chatId}:messages`, `chat:${chatId}`],
      query: chatModel.findById(chatId).select("messages"),
    });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    return res.json({ success: true, messages: chat.messages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;

    if (!chatId) {
      return res.status(400).json({ success: false, message: "Chat ID is required!" });
    }

    const { user, ownsChat } = await assertChatOwnership(req.userId, chatId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    if (!ownsChat) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const chat = await chatModel.findByIdAndDelete(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found!" });
    }

    user.chats.pull(chatId);
    await user.save();

    await invalidateByTags([
      `chat:${chatId}`,
      `chat:${chatId}:messages`,
      `user:${req.userId}:chats`,
    ]);

    return res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
