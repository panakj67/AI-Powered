import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    fileUrl: { type: String, required: true },
    type: String,
    extractedData: mongoose.Schema.Types.Mixed,
    suggestedActions: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.document || mongoose.model("document", documentSchema);
