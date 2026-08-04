import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateCommission,
  MARKETPLACE_FEE_RATE,
  PAYMENT_PROCESSING_RATE,
  SELLER_PAYOUT_RATE,
} from "./commission.js";

test("rates sum to a whole (15% + 5% + 80% = 100%)", () => {
  assert.equal(MARKETPLACE_FEE_RATE + PAYMENT_PROCESSING_RATE + SELLER_PAYOUT_RATE, 1);
});

test("splits a simple $100 sale into 15/5/80", () => {
  const result = calculateCommission(100, 1);
  assert.equal(result.subtotal, 100);
  assert.equal(result.marketplaceFee, 15);
  assert.equal(result.paymentProcessingFee, 5);
  assert.equal(result.totalCommission, 20);
  assert.equal(result.sellerPayout, 80);
  assert.equal(result.totalCharged, 100);
});

test("multiplies by quantity before splitting", () => {
  const result = calculateCommission(25, 4);
  assert.equal(result.subtotal, 100);
  assert.equal(result.sellerPayout, 80);
});

test("commission + payout always reconciles to the subtotal, even with rounding", () => {
  const result = calculateCommission(19.99, 3);
  assert.equal(
    Math.round((result.totalCommission + result.sellerPayout) * 100) / 100,
    result.subtotal
  );
});

test("defaults quantity to 1 when omitted", () => {
  const result = calculateCommission(50);
  assert.equal(result.quantity, 1);
  assert.equal(result.subtotal, 50);
});

test("rejects a zero or negative price", () => {
  assert.throws(() => calculateCommission(0), /positive number/);
  assert.throws(() => calculateCommission(-10), /positive number/);
});

test("rejects a non-numeric price", () => {
  assert.throws(() => calculateCommission("100"), /positive number/);
});

test("rejects a quantity below 1", () => {
  assert.throws(() => calculateCommission(10, 0), /positive integer/);
});
