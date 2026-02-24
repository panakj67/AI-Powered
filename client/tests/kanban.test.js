import test from "node:test";
import assert from "node:assert/strict";
import { moveTaskStatus } from "../src/utils/kanban.js";

test("moveTaskStatus updates only selected task", () => {
  const tasks = [{ _id: "1", status: "todo" }, { _id: "2", status: "done" }];
  const updated = moveTaskStatus(tasks, "1", "in-progress");
  assert.equal(updated[0].status, "in-progress");
  assert.equal(updated[1].status, "done");
});
