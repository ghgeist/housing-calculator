/**
 * Number-input commit helpers used by `InputsPanel` (`NumberInput`).
 *
 * Do not wire `onChange` to `parseFloat` on every keystroke—that snaps empty or partial
 * input to 0 and feels broken. Pattern: local string `draft` while editing, commit on
 * `blur`, sync from props in `useEffect` when the parent value changes (presets/reset).
 *
 * `commitNumberFromDraft`: on blur, parse the draft; empty or invalid input keeps the
 * previous committed value from props. Commas are stripped before parsing so dollar
 * fields can show thousands separators.
 */
function normalizeDraftForParse(trimmed: string): string {
  return trimmed.replace(/,/g, "");
}

export function commitNumberFromDraft(
  draft: string,
  committed: number,
  min: number,
  transform?: (n: number) => number,
): number {
  const trimmed = draft.trim();
  const normalized = normalizeDraftForParse(trimmed);
  if (
    normalized === "" ||
    normalized === "-" ||
    normalized === "." ||
    normalized === "-."
  ) {
    return committed;
  }
  const parsed = parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return committed;
  }
  let next = Math.max(min, parsed);
  if (transform) {
    next = transform(next);
  }
  return next;
}

/** Display string for the input when it is not being edited. */
export function committedNumberDisplay(value: number): string {
  return String(value);
}

/** Whole-dollar display with US grouping (e.g. 400000 → "400,000"). */
export function committedNumberDisplayDollars(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(Math.round(value));
}
