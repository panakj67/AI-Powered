import chatModel from "../models/chat.model.js";
import User from "../models/user.model.js";


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

        const chat = await chatModel.create({title})

        user.chats.push(chat._id);
        await user.save();

        return res.status(201).json({ success: true, chat });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const addMessages = async (req, res) => {
    try {
        const { sender, text } = req.body;
        const chat_id  = req.params.chatId;

        if (!chat_id || !sender || !text) {
          return res.status(400).json({ success: false, message: "chat_id, sender and text are required" });
        }

        const chat = await chatModel.findById(chat_id);
        if (!chat) {
          return res.status(404).json({ success: false, message: "Chat not found" });
        }
        chat.messages.push({ sender, text });
        await chat.save();

        return res.json({success : true});
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const getMessages = async ( req, res ) => {
    try {
        const chat_id  = req.params.chatId;
        if (!chat_id) {
          return res.status(400).json({ success: false, message: "chat_id is required" });
        }

        const chat = await chatModel.findById(chat_id);
        if (!chat) {
          return res.status(404).json({ success: false, message: "Chat not found" });
        }
        return res.json({ success : true, messages : chat.messages });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteChat = async (req, res) => {
  try {
    const chat_id = req.params.chatId;

    if (!chat_id) {
      return res.status(400).json({ success: false, message: "Chat ID is required!" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    const chat = await chatModel.findByIdAndDelete(chat_id);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found!" });
    }

    // Remove reference from user's chats
    user.chats.pull(chat_id);
    await user.save();

    return res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
