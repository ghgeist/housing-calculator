import { test } from "vitest";
import assert from "node:assert/strict";
import { housingInputsEqual } from "./housingInputsEqual";
import { DEFAULT_INPUTS } from "./defaults";
import type { HousingInputs } from "../types/housing";

test("housingInputsEqual matches regardless of key insertion order", () => {
  const forward = { ...DEFAULT_INPUTS };
  const reversed: HousingInputs = Object.fromEntries(
    Object.entries(DEFAULT_INPUTS).reverse(),
  ) as HousingInputs;
  assert.ok(housingInputsEqual(forward, reversed));
});

test("housingInputsEqual distinguishes values", () => {
  assert.ok(!housingInputsEqual(DEFAULT_INPUTS, { ...DEFAULT_INPUTS, homePrice: 1 }));
});
