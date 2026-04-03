import { expect, test } from "vitest";
import { commitNumberFromDraft, committedNumberDisplay } from "./numberInputCommit";

test("commitNumberFromDraft keeps committed on empty or invalid draft", () => {
  expect(commitNumberFromDraft("", 750000, 0)).toBe(750000);
  expect(commitNumberFromDraft("   ", 12.5, 0)).toBe(12.5);
  expect(commitNumberFromDraft("-", 5, 0)).toBe(5);
  expect(commitNumberFromDraft(".", 5, 0)).toBe(5);
  expect(commitNumberFromDraft("not-a-number", 99, 0)).toBe(99);
});

test("commitNumberFromDraft parses and clamps to min", () => {
  expect(commitNumberFromDraft("400000", 750000, 0)).toBe(400000);
  expect(commitNumberFromDraft("3", 30, 5)).toBe(5);
  expect(commitNumberFromDraft("-10", 100, 0)).toBe(0);
});

test("commitNumberFromDraft applies transform", () => {
  const roundYears = (n: number) => Math.max(1, Math.round(n));
  expect(commitNumberFromDraft("7.4", 10, 1, roundYears)).toBe(7);
  expect(commitNumberFromDraft("0.4", 10, 1, roundYears)).toBe(1);
});

test("committedNumberDisplay stringifies numbers", () => {
  expect(committedNumberDisplay(750000)).toBe("750000");
  expect(committedNumberDisplay(6.75)).toBe("6.75");
});
