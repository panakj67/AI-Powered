import Event from "../models/event.model.js";

export const detectConflicts = async ({ userId, startTime, endTime }) => {
  return Event.find({
    userId,
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  });
};

export const createEvent = async (payload) => {
  const conflicts = await detectConflicts(payload);
  return Event.create({ ...payload, conflicts: conflicts.map((x) => x._id) });
};
