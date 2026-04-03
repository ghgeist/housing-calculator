import { test } from "vitest";
import assert from "node:assert/strict";
import { commitNumberFromDraft, committedNumberDisplay } from "./numberInputCommit";

test("commitNumberFromDraft keeps committed on empty or invalid draft", () => {
  assert.equal(commitNumberFromDraft("", 750000, 0), 750000);
  assert.equal(commitNumberFromDraft("   ", 12.5, 0), 12.5);
  assert.equal(commitNumberFromDraft("-", 5, 0), 5);
  assert.equal(commitNumberFromDraft(".", 5, 0), 5);
  assert.equal(commitNumberFromDraft("not-a-number", 99, 0), 99);
});

test("commitNumberFromDraft parses and clamps to min", () => {
  assert.equal(commitNumberFromDraft("400000", 750000, 0), 400000);
  assert.equal(commitNumberFromDraft("3", 30, 5), 5);
  assert.equal(commitNumberFromDraft("-10", 100, 0), 0);
});

test("commitNumberFromDraft applies transform", () => {
  const roundYears = (n: number) => Math.max(1, Math.round(n));
  assert.equal(commitNumberFromDraft("7.4", 10, 1, roundYears), 7);
  assert.equal(commitNumberFromDraft("0.4", 10, 1, roundYears), 1);
});

test("committedNumberDisplay stringifies numbers", () => {
  assert.equal(committedNumberDisplay(750000), "750000");
  assert.equal(committedNumberDisplay(6.75), "6.75");
});
