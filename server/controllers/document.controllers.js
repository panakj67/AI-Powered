import Document from "../models/document.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseDocument } from "../services/document.service.js";

export const uploadDocumentController = asyncHandler(async (req, res) => {
  const parsed = await parseDocument(req.file);
  const doc = await Document.create({
    userId: req.userId,
    fileUrl: `/public/${req.file.filename}`,
    ...parsed,
  });
  res.status(201).json({ success: true, document: doc });
});

export const getDocumentsController = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, documents });
});
