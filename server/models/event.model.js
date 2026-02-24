import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    attendees: [{ type: String }],
    location: String,
    conflicts: [{ type: mongoose.Schema.Types.ObjectId, ref: "event" }],
    createdFromChatId: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
  },
  { timestamps: true }
);

export default mongoose.models.event || mongoose.model("event", eventSchema);
