import { expect, test } from "vitest";
import { housingInputsEqual } from "./housingInputsEqual";
import { DEFAULT_INPUTS } from "./defaults";
import type { HousingInputs } from "../types/housing";

test("housingInputsEqual matches regardless of key insertion order", () => {
  const forward = { ...DEFAULT_INPUTS };
  const reversed: HousingInputs = Object.fromEntries(
    Object.entries(DEFAULT_INPUTS).reverse(),
  ) as HousingInputs;
  expect(housingInputsEqual(forward, reversed)).toBe(true);
});

test("housingInputsEqual distinguishes values", () => {
  expect(housingInputsEqual(DEFAULT_INPUTS, { ...DEFAULT_INPUTS, homePrice: 1 })).toBe(false);
});
