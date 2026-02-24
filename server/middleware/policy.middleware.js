const riskMap = {
  "chat:delete": "high",
  "email:send": "high",
  "bulk:action": "high",
  "task:update": "low",
  "reminder:create": "low",
  "event:create": "medium",
};

const FALLBACK_PIN = "1234";

export const enforcePolicy = (action) => (req, res, next) => {
  const risk = riskMap[action] || "low";
  req.policyRisk = risk;

  if (risk === "low") return next();

  const confirmed = req.headers["x-action-confirmed"] === "true";
  if (!confirmed) {
    return res.status(428).json({
      success: false,
      action,
      risk,
      message: "Confirmation required",
      requirePin: risk === "high",
      hint: risk === "high" ? "Use configured action PIN" : undefined,
    });
  }

  if (risk === "high") {
    const pin = req.headers["x-action-pin"];
    const expectedPin = process.env.ACTION_PIN_PLACEHOLDER || FALLBACK_PIN;

    if (!pin || pin !== expectedPin) {
      return res.status(401).json({
        success: false,
        message: "PIN confirmation required",
      });
    }
  }

  return next();
};
