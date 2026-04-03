import type { HousingInputs } from "@/types/housing";

/**
 * Compare two {@link HousingInputs} for equality (e.g. reset / “dirty” checks).
 * Uses sorted keys so key order on the object does not matter, and new fields on
 * {@link HousingInputs} are included automatically—avoid hand-maintained field lists.
 */
export function housingInputsEqual(a: HousingInputs, b: HousingInputs): boolean {
  return stableJsonStringify(a) === stableJsonStringify(b);
}

function stableJsonStringify(h: HousingInputs): string {
  const sorted: Record<string, unknown> = {};
  for (const k of (Object.keys(h) as (keyof HousingInputs)[]).sort()) {
    sorted[k] = h[k];
  }
  return JSON.stringify(sorted);
}
