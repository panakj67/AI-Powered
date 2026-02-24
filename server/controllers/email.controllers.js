import Email from "../models/email.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { draftEmail, sendEmail } from "../services/email.service.js";

export const draftEmailController = asyncHandler(async (req, res) => {
  const email = await draftEmail({ ...req.body, userId: req.userId });
  res.status(201).json({ success: true, email });
});

export const approveEmailController = asyncHandler(async (req, res) => {
  const email = await Email.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    { status: "approved", $push: { auditLogs: { action: "approved", actor: "user" } } },
    { new: true }
  );
  res.json({ success: true, email });
});

export const sendEmailController = asyncHandler(async (req, res) => {
  const email = await sendEmail(req.params.id, req.userId);
  res.json({ success: true, email });
});

export const getEmailsController = asyncHandler(async (req, res) => {
  const emails = await Email.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, emails });
});
