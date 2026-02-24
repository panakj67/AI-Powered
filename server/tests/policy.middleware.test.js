import test from "node:test";
import assert from "node:assert/strict";
import { enforcePolicy } from "../middleware/policy.middleware.js";

test("high-risk action requires confirmation", async () => {
  const middleware = enforcePolicy("email:send");
  const req = { headers: {} };
  const res = { statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(body) { this.payload = body; return this; } };
  let called = false;
  middleware(req, res, () => { called = true; });
  assert.equal(called, false);
  assert.equal(res.statusCode, 428);
});
