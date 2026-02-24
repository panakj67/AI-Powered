export const parseDocument = async ({ originalname, mimetype }) => {
  const type = mimetype?.includes("pdf") ? "pdf" : mimetype?.startsWith("image") ? "image" : "other";
  return {
    type,
    extractedData: { summary: `Parsed ${originalname}` },
    suggestedActions: ["create-reminder", "create-task"],
  };
};
