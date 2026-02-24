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

const extractAction = (intent, command = "") => {
  const lower = command.toLowerCase();

  if (intent === "reminder") {
    const title = command.replace(/remind me/i, "").trim() || "Reminder";
    const hours = lower.includes("tomorrow") ? 24 : 1;
    return {
      entity: "reminder",
      payload: {
        title,
        datetime: new Date(Date.now() + hours * 60 * 60 * 1000),
        followUpSuggestion: "Do you want me to draft the submission email too?",
      },
    };
  }

  if (intent === "task") {
    return {
      entity: "task",
      payload: {
        title: command.replace(/create|add|task|todo/gi, "").trim() || "New task",
        status: "todo",
        priority: lower.includes("high") ? "high" : lower.includes("low") ? "low" : "medium",
      },
    };
  }

  if (intent === "email") {
    const emailMatch = command.match(/[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/);
    return {
      entity: "email",
      payload: {
        to: emailMatch?.[0] || "demo@example.com",
        subject: "Draft from assistant",
        body: command,
      },
    };
  }

  if (intent === "calendar") {
    return {
      entity: "calendar",
      payload: {
        title: command,
        startTime: new Date(Date.now() + 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
    };
  }

  if (intent === "agent-mode") {
    return {
      entity: "agent-run",
      payload: {
        goal: command,
      },
    };
  }

  return null;
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
    const action = extractAction(intent, command);

    const enrichedCommand = memoryContext ? `${command}\nUser memory: ${memoryContext}` : command;
    const result = await geminiResponse(enrichedCommand, user.name);

    if (!result || typeof result !== "string") {
      return res.status(503).json({ response: "Assistant temporarily unavailable", intent, action });
    }

    const jsonMatch = result.match(/{[\s\S]*}/);

    if (command.toLowerCase().includes("prefer") || command.toLowerCase().includes("i like")) {
      await storeMemory({ userId: req.userId, key: "tone", value: command, source: "chat", confidence: 0.6 });
    }

    if (!jsonMatch) {
      return res.status(200).json({ type: intent, response: result, userInput: command, intent, action });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    switch (type) {
      case "get-date":
        return res.json({ type, userInput: gemResult.userInput, response: `current date is ${moment().format("YYYY-MM-DD")}`, intent, action });
      case "get-time":
        return res.json({ type, userInput: gemResult.userInput, response: `current time is ${moment().format("hh:mm A")}`, intent, action });
      case "get-day":
        return res.json({ type, userInput: gemResult.userInput, response: `today is ${moment().format("dddd")}`, intent, action });
      case "get-month":
        return res.json({ type, userInput: gemResult.userInput, response: `today is ${moment().format("MMMM")}`, intent, action });
      default:
        return res.json({ ...gemResult, intent, action });
    }
  } catch (error) {
    return res.status(500).json({ response: "ask assistant error" });
  }
};
