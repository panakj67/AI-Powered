import express from 'express'
import { addMessages, createNewChat, deleteChat, getMessages } from '../controllers/chat.controllers.js';
import isAuth from '../middlewares/isAuth.js'

const router = express.Router();

// Create a new chat
router.post("/", isAuth, createNewChat);

// Add a new message to a chat
router.post("/:chatId/messages", isAuth, addMessages);

// Get all messages for a chat
router.get("/:chatId/messages", isAuth, getMessages);

// Delete a chat
router.delete("/:chatId", isAuth, deleteChat);

export default router;