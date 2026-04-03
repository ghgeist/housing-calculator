# External feedback — own vs rent calculator

## Purpose

This document records qualitative product feedback on the housing calculator (as of early 2026) and possible directions for the codebase. It is meant for contributors and anyone evaluating the tool in public; it does not change product behavior by itself.

**Related:** See `docs/2026-04-03-roadmap.md` for broader product evolution.

---

## Summary of feedback

1. **Comparable rent** — The main modeling risk is choosing a rent that is too low relative to the home under analysis (a “strawman” rent), which would make owning look worse than a fair comparison.

2. **Investing the difference** — When ownership cash outflows exceed rent, the user may or may not actually invest that surplus. Making that assumption explicit (or optional) would improve trust in the long-horizon comparison.

3. **Carry vs. cash flow** — “Negative carry” can be read as “your cash flow is bad,” but paying a mortgage always involves cash leaving your account; principal is partly an asset swap, not pure expense. The app’s metrics should be easy to distinguish from informal “cash flow” language.

4. **Monte Carlo vs. deterministic model** — A Monte Carlo layer was considered for varying all inputs at once. Counterpoint: simulation across many random draws is most valuable when parameters are highly uncertain or the dynamics are chaotic (non-ergodic, path-dependent in a way that does not settle toward a long-run average). Many calculator inputs are either **contracted or observable** (e.g. mortgage rate, term, insurance) or are already **long-horizon averages** by convention (e.g. expected investment return). That does not rule out stochastic extensions, but it frames *why* they might add less clarity than sensitivity analysis or scenarios for this tool.

5. **Questions beyond “rent vs buy”** — One motivating thread is not the binary rent-or-own choice but **whether cumulative cash put into a house comes back** over a long hold (e.g. 30 years): total payments (especially interest—often in the ballpark of **paying for the price of the house again** on a minimum-payment 30-year loan, depending on rate) versus ending equity and sale outcomes. A home is both an **asset** and, in another sense, the **largest durable “consumption” purchase** most people make—useful tension for future copy or metrics, not necessarily a call to duplicate the large existing rent-vs-buy literature.

6. **Inputs layout and discoverability** — Users may not immediately see where to enter numbers if primary controls sit **below the fold**; first impressions can feel like “nothing to type into” until they scroll.

7. **Condo / HOA and borderline carry** — Meaningful **HOA** can swing the own-vs-rent story; until those fees are included, **carry** can read “barely green” for owning in a way that matches intuition once HOA is modeled.

8. **How P&I is shown** — Some readers prefer **one amortized payment** mentally; breaking **principal vs interest** in the monthly breakdown can feel like extra moving parts even though both are contractually real each month.

9. **Location-based appreciation** — Interest in **metro- or market-specific** appreciation defaults (e.g. trade-association or other published series), with awareness that the tool’s sale-based path assumes a **liquidating** event.

10. **Illiquidity, rebuying, and the standard deduction** — **Home equity** is a real balance-sheet asset but not cash; if you still need housing and do not sell (or sell and rebuy), wealth is **embedded** in the next dwelling. **Mortgage interest deduction** is highly household-specific; assuming **standard deduction** matches many filers but should stay explicit if ever modeled.

11. **Many knobs vs ranges** — High **parameter count** makes “one true number” hard; **ranges or scenarios** could help or **muddy** the story—worth weighing against sensitivity presets. Serious users are expected to **tighten inputs** themselves.

12. **Term, rate, prepayment, and peer comparisons** — Short **mortgage term**, **lower rate**, **points**, **extra principal**, and **local appreciation** interact strongly; anecdotal comparisons across households are consistent with the model’s sensitivity, not a call for social features.

13. **External framing** — Third-party analyses sometimes conclude **renting is cheaper** in current conditions; the **BLS “owner equivalent rent”** idea (asking owners what their home would rent for) aligns with this app’s **comparable rent** input. Reference: [YouTube — discussion touching owner-equivalent rent and housing costs](https://youtu.be/yU2raZftgmE?si=syh01uy0ZkMtiOA5).

14. **Prepayment vs “earning the mortgage rate”** — It is tempting to treat **extra principal** as a risk-free “investment” that **returns exactly the mortgage rate**; in practice **opportunity cost**, **liquidity**, **taxes**, and **what else you would do with the dollar** break a simple 1:1 story (personal finance media often surfaces one of these wrinkles). That supports the broader theme—**many coupled variables**—while still validating **deterministic scenario** tools as a worthwhile way to play with the tradeoffs.

---

## Resolution summary (as of 2026-04-03)

Follow-through in `artifacts/housing-sanity-check` against this document: most **trust and clarity** items are **implemented**. The numbered sections below stay as the original feedback record; this block is the **pickup map**.

| Area | Status | Notes |
| ---- | ------ | ----- |
| §1 Comparable rent | **Done** | Guidance under the rent field; **sanity line** (annual rent as % of home price) in `InputsPanel.tsx`. |
| §2 Invest the surplus | **Done** | `investMonthlySavings` on `HousingInputs`; chart subtitles + methodology copy; behavior in `calcYearlyComparison` with tests. |
| §3 Carry vs cash flow | **Done** | Carry blurbs, **Owner cash outflow** vs true cost, methodology `<details>`, advanced carry note. |
| §4 Monte Carlo | **Deferred** | Framed as future / tradeoff; no feature. |
| §5 Money back / lifetime interest | **Partial** | **Money back at exit** section (cumulative cash in, net proceeds, net owner cost) + illiquidity note. No dedicated **lifetime total interest** line yet. |
| §6 Discoverability | **Done** | Header cue, Step 1 intro, **Core scenario** open by default, presets, `#inputs-start` / jump link. |
| §7 HOA / condos | **Done** | Field + helper copy (**condos/townhomes**); not the exact “mandatory for condos” wording. |
| §8 P&I presentation | **Done** | **Mortgage payment (P&I)** line after equity block; interest still under living costs. |
| §9 Tax / insurance / HOA inputs | **Done** | Fields, tooltips, **tax & maintenance base** control. |
| §10 Metro appreciation / redeploy | **Deferred** | Roadmap / data; partial illiquidity copy at exit. |
| §11 Income tax / standard deduction | **Done** | Visible guardrail in **What you’re looking at** (`App.tsx`): taxes not modeled; most take standard deduction. |
| §12 Many knobs | **Partial** | Named **presets**; no outcome bands. |
| §13 Peer / amortization education | **Open** | Optional copy or link-out only. |
| §14 Owner-equivalent rent | **Skipped (deliberate)** | **Comparable rent** framing is enough; OER named in public docs would add a new concept for marginal gain. |
| §15 Prepay vs mortgage rate | **Done** | One sentence in **Monthly breakdown** note (`ResultsPanel.tsx`): similar to earning the rate, **liquidity/flexibility** caveat. |

**Positioning copy (same pass):** Lead paragraph under **What you’re looking at** states the tool’s **stance**—living cost vs equity, structure not prediction (`App.tsx`).

**Repo docs:** `docs/README.md` indexes this file, roadmap, and memo for contributors.

---

## 1. Comparable rent and strawman risk

**Observation:** Outputs are only as good as the **equivalent monthly rent** input. A rent that understates what a truly comparable property would cost biases conclusions against owning.

**Current UI:** The results panel labels this **“Comparable rent”** with subtitle *“What you would pay to rent instead”* (`artifacts/housing-sanity-check/src/components/ResultsPanel.tsx`). The carry section already surfaces **implied rent yield** (annual rent ÷ home price) as part of carry analysis (`artifacts/housing-sanity-check/src/lib/housing/model.ts`).

**Possible directions:**

- **Copy:** Add brief guidance near the rent input stressing **equivalence** (same quality, location, size—not a cheaper unit used to make owning look expensive).
- **Sanity cue:** Show implied rent yield (or “rent as % of price per year”) next to the rent field so users notice outliers without adding new math.
- **Defaults:** Default inputs in `artifacts/housing-sanity-check/src/lib/defaults.ts` encode a specific story (e.g. rent vs. price ratio); revisiting defaults is optional and market-dependent.

---

## 2. Investing the monthly surplus (rent + invest path)

**Observation:** If owning costs materially more than rent in **cash-out terms**, the renter could invest the difference—but real people may spend it, hold cash, or invest at a different return.

**Current behavior:** In `calcYearlyComparison` (`artifacts/housing-sanity-check/src/lib/housing/model.ts`), when `investMonthlySavings` is true and annual owner cash outflows exceed annual rent, the model adds that surplus to the renter’s portfolio and compounds it at `investmentReturnRate`. When the flag is false, **upfront** capital still follows the rent+invest path, but **monthly** surplus is not auto-invested. Chart copy and the methodology block in `App.tsx` reflect the toggle.

**Note on definitions:** Headline **true monthly cost** excludes principal (consumption vs. equity). The **own vs rent + invest** simulation uses **full P&I plus taxes, maintenance, and insurance** as owner cash outflows—appropriate for “money that could otherwise be invested.”

**Possible directions (mostly addressed):**

- **Transparency:** Footnote on the comparison chart (`artifacts/housing-sanity-check/src/components/ComparisonChart.tsx`) stating that surplus cash vs. the owner payment path is assumed invested at the configured return.
- **Optional input:** A boolean (e.g. “Invest monthly savings”) defaulting to on, matching earlier behavior; when off, do not add surplus to the portfolio—**shipped** as `investMonthlySavings`.

---

## 3. Carry terminology vs. household cash flow

**Observation:** Paying a mortgage always moves cash out of the bank; interest is an expense on a consumption lens, while principal is largely an asset swap. “Negative carry” in this app is a **spread metric** (implied rent yield vs. financing and ownership drag), not a full cash-flow or FCF statement.

**Current behavior:** `calcCarryAnalysis` computes `delta = imputedRentYield - carryDrag` and classifies Positive / Near Neutral / Negative carry. Explanations live in `ResultsPanel.tsx` (`carryExplanation` and the carry detail note).

**Possible directions:**

- **Copy:** Clarify that **Negative carry** means “at the rent you entered, implied yield does not cover modeled drag,” not “your personal cash flow is negative.”
- **Education:** Reinforce the existing monthly breakdown: **true monthly cost** vs. **principal (equity)** vs. **total P&I** so “cash leaving the account” vs. “consumed cost” stays visible.

---

## 4. Monte Carlo simulation (idea and counter-argument)

**Idea:** Run many draws over uncertain inputs (rates, appreciation, rent growth, returns, etc.) to show a distribution of outcomes instead of a single path.

**Counter-argument (from discussion, paraphrased):** Monte Carlo tends to pay off when (a) **parameter uncertainty is large** and materially drives the conclusion, or (b) the system is **chaotic** in the sense that past paths do not predict future paths and outcomes do not **converge toward an average** over the horizon you care about. In a typical primary-residence calculator, several inputs are **known or fixed** for the scenario (mortgage terms, known costs) and others are already **interpreted as long-run averages** (e.g. expected portfolio return). That does not prove Monte Carlo is useless here, but it suggests **lighter-weight tools**—a few **presets**, **sliders**, or **scenario tables**—might deliver most of the insight with less implementation and cognitive load. There is also extensive existing writing on rent vs buy; any deep stochastic feature should justify itself against that backdrop.

**Possible directions if revisiting later:**

- **Targeted uncertainty:** Instead of shaking every knob, model uncertainty only where it matters most to the user’s question (e.g. appreciation and rent growth, or sale timing).
- **Sensitivity first:** One-at-a-time or small-grid sensitivity before full simulation.
- **Literature / benchmarks:** If adding random paths, document assumptions and compare to common published frameworks so users can sanity-check.

---

## 5. “Do you get your money back?” (long-horizon cash vs equity)

**Motivation (from discussion, paraphrased):** The interesting question may not be the classic **rent vs buy** framing alone, but whether **decades of ownership** return the **cumulative cash** sunk into the house (payments, taxes, upkeep) when you account for **sale proceeds, loan balance, and costs**. Minimum payments on a **30-year** mortgage, depending on rate, imply paying **roughly a bit more than twice the purchase price** in total cash out (principal + interest) before counting taxes, insurance, and maintenance—so the **magnitude of lifetime outflows** is easy to underestimate.

**Conceptual note:** A house is **an asset** (balance sheet) and simultaneously, for many households, the **largest durable good** they consume (shelter, location, risk bearing). The app already separates **consumed monthly cost** (interest, tax, maintenance, insurance) from **principal (equity)** in the monthly breakdown; a future enhancement could make **cumulative “cash in vs out”** or **total interest paid** more visible for users asking the “money back” question—without blurring the consumption vs equity distinction the project cares about.

**Possible directions:**

- **Copy or summary line:** Lifetime total interest (over hold period or full amortization) and/or cumulative true cost vs. estimated net equity at sale.
- **Chart or table:** Cumulative owner cash outflows vs. net equity path (some of this exists indirectly in yearly comparison logic; presentation could emphasize the “get my money back” story).
- **Scope:** Keep aligned with `AGENTS.md`—no need to become a full Monte Carlo or market data product to answer this more clearly.

---

## 6. Inputs discoverability and first-run layout

**Observation:** On first load, a user looked for **numeric inputs at the top** of the page and was briefly unsure how to enter a scenario; after **scrolling**, the input panel became clear.

**Possible directions:**

- **Layout:** Keep critical inputs **visible without scrolling** on common laptop viewports, or add a short **above-the-fold cue** (“Adjust assumptions below”) so the page does not read as static output only.
- **Progressive disclosure:** If the layout stays long-form, a compact **summary strip** or anchor link to “Your inputs” can reduce scroll-hunt friction.

---

## 7. Condos, HOA, and “barely positive” carry

**Observation:** For a **condo**, **HOA** materially affects total ownership drag. Intuition: once HOA is fully reflected, the same scenario may tilt toward **renting**; until then, **carry** can look **slightly favorable to owning**.

**Current behavior:** `HousingInputs` includes **`monthlyHoa`**; the monthly breakdown includes HOA in **true ownership cost** and **total cash outflow** (`artifacts/housing-sanity-check/src/types/housing.ts`, model in `src/lib/housing/model.ts`). If feedback predates a build with HOA surfaced in the UI, treat this as validation that **HOA must be easy to find and understand**, not only present in the schema.

**Possible directions:**

- **Copy near HOA:** One line that HOA is **mandatory for condos** for a fair comparison to rent.
- **Defaults:** Condo-oriented presets (higher HOA, maintenance) are optional and market-dependent; see `src/lib/defaults.ts`.

---

## 8. Presenting principal and interest in the monthly breakdown

**Observation:** From a household mental model, **P&I is one mortgage payment** that amortizes month to month; showing **interest** and **principal** as separate lines under “cost” can feel like **extra variables** even though interest is a true expense and principal is equity conversion (a distinction this repo intentionally preserves).

**Current behavior:** The UI separates **interest** vs **principal** to support **true monthly cost** (consumption) vs **equity** framing per `AGENTS.md`.

**Possible directions:**

- **Presentation:** Add a **subtotal line** (“Mortgage payment (P&I)”) with expandable detail, or a **tooltip** that states both parts are paid monthly but only interest counts toward **consumed** cost.
- **Scope:** Avoid blurring **principal into “cost”** in headline metrics; any consolidation should remain **visually** grouped, not mathematically merged into true monthly cost.

---

## 9. Insurance, property tax, and HOA as “missing” inputs (perception vs code)

**Observation:** Users may ask for explicit inputs for **insurance**, **HOA**, and **property taxes**.

**Current behavior:** The model already includes **`annualInsurance`**, **`monthlyHoa`**, and **`propertyTaxRate`** (rate applied to the chosen cost basis). If users still perceive gaps, the issue is likely **discoverability**, **wording** (“rate” vs dollar tax), or **ordering** of fields—not absence from the type system.

**Possible directions:**

- **Labels:** Clarify how tax is computed (rate × basis) and link to **assessed value** mentally.
- **Optional advanced input:** Assessed value or annual tax dollars **instead of** rate, derived behind the scenes—only if it reduces confusion without duplicating state.

---

## 10. Location-based appreciation and illiquidity

**Observation:** **Metro-specific** appreciation benchmarks (e.g. from trade groups or recurring market reports) would feel more grounded than a single generic default. Separately: **appreciation** in long-horizon charts often assumes a **sale**; if the user **does not sell** or **must buy again**, wealth is **illiquid** and **re-embedded** in housing—still a **transferable** asset on a balance sheet, but not spendable like cash.

**Alignment:** See `docs/2026-04-03-roadmap.md` for staged **market-aware** evolution; pulling official metro series is a **data-sourcing** decision, not a one-line UI change.

**Possible directions:**

- **Copy:** Short note where appreciation is used: “Shown as **equity at sale**; staying housed after a sale can **redeploy** much of this into the next purchase.”
- **Presets:** Optional metro appreciation **presets** with **source footnotes** if the project adopts external data later.

---

## 11. Mortgage interest deduction and standard deduction

**Observation:** **Itemizing** vs **standard deduction** makes **after-tax mortgage interest** highly individual; many households **take the standard deduction**, so tax savings from ownership are often **smaller than assumed** in informal conversation.

**Possible directions:**

- **Explicit non-goal:** State in methodology or help text that **income tax interactions are not modeled** (or add a simple toggle only with clear docs and tests—higher scope).
- **Copy:** One sentence that users who **do not itemize** should not mentally subtract a large **mortgage interest tax shield** from the displayed costs.

---

## 12. Many variables: single outcome vs ranges

**Observation:** With many uncertain inputs, it is **hard to generalize** one headline number. **Ranges** or **bands** on the final comparison could help honesty or could **obscure** the core story.

**Possible directions:**

- **Lightweight sensitivity:** Two or three **named scenarios** (e.g. “lower appreciation / higher rent growth”) before full distributions.
- **Principle:** Reserve **Monte Carlo** or wide bands for when the product explicitly commits to uncertainty storytelling; see §4.

---

## 13. Term, rate, points, prepayment, and informal peer comparison

**Observation:** Quick comparisons between households (e.g. **15-year** vs **30-year**, **rate buydown with points**, **extra principal**, and **local appreciation**) show **large dispersion in equity** even when monthly payments feel similar—consistent with the model’s sensitivity to **term**, **rate**, and **appreciation**.

**Possible directions:**

- **Education:** Optional copy or link-out on how **amortization schedule** and **term** change **equity build** independent of “house price went up.”
- **Avoid scope creep:** No need to model **every** peer scenario; the insight is **parameter sensitivity**.

---

## 14. External narratives and owner-equivalent rent

**Observation:** Some public and media analyses currently emphasize **renting cheaper than owning** in aggregate or in selected markets. The **BLS** concept of **owner equivalent rent**—asking owners what their home **would rent for**—parallels this tool’s reliance on a thoughtful **comparable rent** input.

**Reference:** [YouTube video touching owner-equivalent rent and housing-cost comparisons](https://youtu.be/yU2raZftgmE?si=syh01uy0ZkMtiOA5) (external; not an endorsement of every claim in the video).

**Possible directions:**

- **Copy:** Brief pointer to **owner equivalent rent** as a mental check for the rent field (with a neutral citation to BLS documentation if desired later).

---

## 15. Extra principal: “same as the mortgage rate?” (mental model)

**Observation:** A user recalled believing that **paying down principal** was economically identical to **earning the mortgage interest rate** on that money—until another factor (described in passing as a common **personal-finance video** framing) showed the comparison is **not a single-variable identity**. The takeaway aligns with **high dimensionality**: almost **too many variables** for a tidy universal equation, but **modeling concrete scenarios** remains engaging and useful.

**Conceptual note:** Prepaying **does** avoid future interest at the loan’s **contract rate**, which is often compared to a **guaranteed, after-tax-relevant** hurdle. The simplification breaks when you ask **versus what alternative** (portfolio return, liquidity premium, other debt, tax treatment, horizon, or probability of moving). This app’s **rent + invest** path already encodes one explicit alternative: **invest the difference** at `investmentReturnRate`—not the same as “prepay equals invest at mortgage rate” unless you deliberately equate them and accept the implicit assumptions.

**Possible directions:**

- **Education (light touch):** A short footnote or help line near **holding / equity** content: prepayment saves **contract interest**; comparing that to **other uses of cash** requires an assumed **alternative return** and **risk**—no need to cite third-party shows by name.
- **Scope:** Do not turn the UI into a full **optimal prepayment** solver; optional copy is enough unless the product later targets that question directly.

---

## Scope discipline

Per `AGENTS.md`, prefer small, readable changes: copy and optional inputs over heavy new infrastructure. Any change to **core metric definitions** or **carry thresholds** should stay deliberate, tested, and documented.

---

## Changelog

- **2026-04-03** — Initial external review notes; expanded same day with Monte Carlo vs deterministic discussion and long-horizon “money back” / total interest / housing as asset and consumption (conversation synthesized for the repo).
- **2026-04-03** — Added second-round notes: input discoverability, condo/HOA sensitivity, P&I presentation, appreciation/illiquidity, standard deduction, parameter ranges, peer comparison anecdotes, external rent-vs-own narratives, and owner-equivalent rent (including a user-supplied video link).
- **2026-04-03** — Added note on **prepayment vs mortgage-rate** mental model, opportunity cost, and validation of scenario-style tools despite many coupled variables (third-party media mentioned only generically in the doc body).
- **2026-04-03** — **Resolution summary** table (pickup map vs §1–§15). Updated §2 **Current behavior** for `investMonthlySavings`. Logged shipped copy: model stance + tax guardrail (`App.tsx`), prepayment line (`ResultsPanel.tsx`), deliberate **skip** of OER in UI, and `docs/README.md` index.
