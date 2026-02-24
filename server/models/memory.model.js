import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    key: { type: String, required: true },
    value: { type: String, required: true },
    confidence: { type: Number, default: 0.5 },
    source: { type: String, default: "chat" },
  },
  { timestamps: true }
);

memorySchema.index({ userId: 1, key: 1 }, { unique: true });

export default mongoose.models.memory || mongoose.model("memory", memorySchema);
