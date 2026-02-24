import Email from "../models/email.model.js";

export const draftEmail = async (payload) => {
  const email = await Email.create({
    ...payload,
    status: "draft",
    auditLogs: [{ action: "drafted", actor: "assistant" }],
  });
  return email;
};

export const sendEmail = async (emailId, userId) => {
  const email = await Email.findOne({ _id: emailId, userId });
  if (!email) throw new Error("Email not found");
  email.status = "sent";
  email.sentAt = new Date();
  email.auditLogs.push({ action: "sent", actor: "user" });
  await email.save();
  return email;
};
