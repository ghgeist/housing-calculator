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

**Current behavior:** In `calcYearlyComparison` (`artifacts/housing-sanity-check/src/lib/housing/model.ts`), when annual owner cash outflows exceed annual rent, the model adds that surplus to the renter’s portfolio and compounds it at `investmentReturnRate`. There is no toggle; full discipline is assumed whenever the surplus is positive.

**Note on definitions:** Headline **true monthly cost** excludes principal (consumption vs. equity). The **own vs rent + invest** simulation uses **full P&I plus taxes, maintenance, and insurance** as owner cash outflows—appropriate for “money that could otherwise be invested.”

**Possible directions:**

- **Transparency:** Footnote on the comparison chart (`artifacts/housing-sanity-check/src/components/ComparisonChart.tsx`) stating that surplus cash vs. the owner payment path is assumed invested at the configured return.
- **Optional input:** A boolean (e.g. “Invest monthly savings”) defaulting to on, matching today’s behavior; when off, do not add surplus to the portfolio (or grow it at 0% / a separate cash rate).

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

## Scope discipline

Per `AGENTS.md`, prefer small, readable changes: copy and optional inputs over heavy new infrastructure. Any change to **core metric definitions** or **carry thresholds** should stay deliberate, tested, and documented.

---

## Changelog

- **2026-04-03** — Initial external review notes; expanded same day with Monte Carlo vs deterministic discussion and long-horizon “money back” / total interest / housing as asset and consumption (conversation synthesized for the repo).
