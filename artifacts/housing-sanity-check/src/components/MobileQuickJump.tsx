import { INPUTS_SECTION_ID, RESULTS_SECTION_ID } from "@/lib/sectionAnchors";

export function MobileQuickJump() {
  return (
    <nav className="mobile-quick-jump" aria-label="Mobile section navigation">
      <a className="mobile-quick-jump-link" href={`#${INPUTS_SECTION_ID}`}>
        Inputs
      </a>
      <a className="mobile-quick-jump-link" href={`#${RESULTS_SECTION_ID}`}>
        Results
      </a>
    </nav>
  );
}
