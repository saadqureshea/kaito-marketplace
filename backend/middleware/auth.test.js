import { test } from "node:test";
import assert from "node:assert/strict";
import { requireRole } from "./auth.js";

function mockRes() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; } };
}

test("requireRole calls next() when the user has an allowed role", () => {
  const req = { user: { role: "seller" } };
  const res = mockRes();
  let nextCalled = false;
  requireRole("seller", "admin")(req, res, () => { nextCalled = true; });
  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("requireRole throws 403 when the user's role is not allowed", () => {
  const req = { user: { role: "buyer" } };
  const res = mockRes();
  assert.throws(() => requireRole("seller", "admin")(req, res, () => {}), /Access denied/);
  assert.equal(res.statusCode, 403);
});

test("requireRole throws 403 when there is no authenticated user", () => {
  const req = {};
  const res = mockRes();
  assert.throws(() => requireRole("admin")(req, res, () => {}), /Access denied/);
  assert.equal(res.statusCode, 403);
});

test("requireRole accepts any of multiple allowed roles", () => {
  const res = mockRes();
  let calls = 0;
  requireRole("seller", "admin")({ user: { role: "admin" } }, res, () => calls++);
  assert.equal(calls, 1);
});
