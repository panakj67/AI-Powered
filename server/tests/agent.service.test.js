import test from "node:test";
import assert from "node:assert/strict";
import { planSteps } from "../services/agent.service.js";

test("planSteps returns multiple actionable steps", async () => {
  const steps = await planSteps("Plan my Goa trip");
  assert.equal(Array.isArray(steps), true);
  assert.equal(steps.length >= 3, true);
});
