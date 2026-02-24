import Memory from "../models/memory.model.js";

export const storeMemory = async ({ userId, key, value, confidence = 0.7, source = "chat" }) => {
  return Memory.findOneAndUpdate(
    { userId, key },
    { value, confidence, source },
    { upsert: true, new: true }
  );
};

export const retrieveRelevantMemory = async (userId, keys = []) => {
  const query = { userId };
  if (keys.length) query.key = { $in: keys };
  return Memory.find(query).sort({ confidence: -1 }).limit(10);
};
