import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
        role: { type: String, enum: ["admin", "editor", "viewer"], default: "viewer" },
      },
    ],
    sharedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "chat" }],
    comments: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, text: String }],
  },
  { timestamps: true }
);

export default mongoose.models.workspace || mongoose.model("workspace", workspaceSchema);
