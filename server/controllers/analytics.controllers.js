import { asyncHandler } from "../utils/asyncHandler.js";
import { getInsights } from "../services/analytics.service.js";

export const getInsightsController = asyncHandler(async (req, res) => {
  const insights = await getInsights(req.userId);
  res.json({ success: true, insights });
});
