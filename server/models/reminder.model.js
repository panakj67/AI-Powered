import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    title: { type: String, required: true },
    description: String,
    datetime: { type: Date, required: true, index: true },
    status: { type: String, enum: ["pending", "completed", "missed"], default: "pending" },
    followUpSuggestion: String,
    createdFromChatId: { type: mongoose.Schema.Types.ObjectId, ref: "chat" },
  },
  { timestamps: true }
);

export default mongoose.models.reminder || mongoose.model("reminder", reminderSchema);
