/**
 * Number-input commit helpers used by `InputsPanel` (`NumberInput`).
 *
 * Do not wire `onChange` to `parseFloat` on every keystroke—that snaps empty or partial
 * input to 0 and feels broken. Pattern: local string `draft` while editing, commit on
 * `blur`, sync from props in `useEffect` when the parent value changes (presets/reset).
 *
 * `commitNumberFromDraft`: on blur, parse the draft; empty or invalid input keeps the
 * previous committed value from props.
 */
export function commitNumberFromDraft(
  draft: string,
  committed: number,
  min: number,
  transform?: (n: number) => number,
): number {
  const trimmed = draft.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return committed;
  }
  const parsed = parseFloat(trimmed);
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
