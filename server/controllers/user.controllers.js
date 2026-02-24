import geminiResponse from "../gemini.js";
import User from "../models/user.model.js";
import moment from "moment";
import { retrieveRelevantMemory, storeMemory } from "../services/memory.service.js";

const detectIntent = (command = "") => {
  const text = command.toLowerCase();
  if (text.includes("remind")) return "reminder";
  if (text.includes("task") || text.includes("todo")) return "task";
  if (text.includes("email") || text.includes("mail")) return "email";
  if (text.includes("meeting") || text.includes("calendar") || text.includes("event")) return "calendar";
  if (text.includes("upload") || text.includes("document") || text.includes("pdf") || text.includes("image")) return "document";
  if (text.includes("plan") || text.includes("step") || text.includes("trip")) return "agent-mode";
  return "general";
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password").populate("chats");
    if (!user) return res.status(400).json({ message: "user not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "get current user error" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    const memories = await retrieveRelevantMemory(req.userId, ["tone", "reminder-time", "goals", "priorities"]);
    const memoryContext = memories.map((m) => `${m.key}: ${m.value}`).join("; ");

    const intent = detectIntent(command);
    const enrichedCommand = memoryContext ? `${command}\nUser memory: ${memoryContext}` : command;
    const result = await geminiResponse(enrichedCommand, user.name);

    if (!result || typeof result !== "string") {
      return res.status(503).json({ response: "Assistant temporarily unavailable" });
    }

    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      return res.status(200).json({ type: intent, response: result, userInput: command, intent });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    if (command.toLowerCase().includes("prefer") || command.toLowerCase().includes("i like")) {
      await storeMemory({ userId: req.userId, key: "tone", value: command, source: "chat", confidence: 0.6 });
    }

    switch (type) {
      case "get-date":
        return res.json({ type, userInput: gemResult.userInput, response: `current date is ${moment().format("YYYY-MM-DD")}`, intent });
      case "get-time":
        return res.json({ type, userInput: gemResult.userInput, response: `current time is ${moment().format("hh:mm A")}`, intent });
      case "get-day":
        return res.json({ type, userInput: gemResult.userInput, response: `today is ${moment().format("dddd")}`, intent });
      case "get-month":
        return res.json({ type, userInput: gemResult.userInput, response: `today is ${moment().format("MMMM")}`, intent });
      case "gmail-send":
        return res.json({ ...gemResult, intent });
      default:
        return res.json({ ...gemResult, intent });
    }
  } catch (error) {
    return res.status(500).json({ response: "ask assistant error" });
  }
};
