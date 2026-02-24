import mongoose from "mongoose";

const emailSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ["draft", "approved", "sent"], default: "draft" },
    sentAt: Date,
    auditLogs: [
      {
        action: String,
        actor: String,
        metadata: mongoose.Schema.Types.Mixed,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.email || mongoose.model("email", emailSchema);
