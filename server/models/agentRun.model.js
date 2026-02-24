import mongoose from "mongoose";

const agentRunSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    goal: { type: String, required: true },
    steps: [
      {
        title: String,
        status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
      },
    ],
    status: { type: String, enum: ["planned", "running", "completed"], default: "planned" },
    logs: [{ message: String, createdAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

export default mongoose.models.agentRun || mongoose.model("agentRun", agentRunSchema);
