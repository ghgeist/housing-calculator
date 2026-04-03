import { lazy, Suspense, useState, useMemo } from "react";
import { InputsPanel } from "@/components/InputsPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_INPUTS } from "@/lib/defaults";
import { runModel } from "@/lib/housing/model";
import type { HousingInputs } from "@/types/housing";
import "./app.css";

const ComparisonChart = lazy(() =>
  import("@/components/ComparisonChart").then((m) => ({ default: m.ComparisonChart })),
);

function ChartSectionFallback() {
  return (
    <div className="comparison-chart" aria-busy="true" aria-label="Loading chart">
      <Skeleton className="mb-4 h-6 w-48" />
      <Skeleton className="mb-6 h-4 w-full max-w-md" />
      <Skeleton className="mb-6 h-[300px] w-full" />
      <Skeleton className="mb-2 h-5 w-40" />
      <Skeleton className="mb-4 h-4 w-full max-w-lg" />
      <Skeleton className="h-[220px] w-full" />
    </div>
  );
}

function App() {
  const [inputs, setInputs] = useState<HousingInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => runModel(inputs), [inputs]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">Housing Calculator</h1>
          <p className="app-subtitle">
            Start with the form below: home price, down payment, and rent for a truly comparable place. Outputs are only
            as good as your rent, tax, insurance, HOA, and appreciation assumptions.
          </p>
          <a className="jump-to-results" href="#results">
            Jump to results
          </a>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <aside className="layout-inputs">
            <InputsPanel
              inputs={inputs}
              impliedRentYield={results.carry.imputedRentYield}
              onChange={setInputs}
            />
          </aside>

          <div className="layout-results">
            <ResultsPanel results={results} inputs={inputs} />
            <Suspense fallback={<ChartSectionFallback />}>
              <ComparisonChart data={results.yearlyComparison} investMonthlySavings={inputs.investMonthlySavings} />
            </Suspense>

            <div className="framing-note">
              <h3 className="framing-title">What you&apos;re looking at</h3>
              <p className="framing-lead">
                This tool separates what you pay to live in a home from what builds equity. It is meant to make the{" "}
                <strong>structure</strong> of housing decisions clearer, not to predict the future.
              </p>
              <p className="framing-guardrail">
                Income tax is not modeled (for example, mortgage interest deductions). Most households take the
                standard deduction.
              </p>
              <ul className="framing-bullets">
                <li>
                  <strong>Monthly reality</strong> compares what it really costs to live in the home (interest, taxes,
                  upkeep, insurance, HOA) to the comparable rent you enter.
                </li>
                <li>
                  <strong>Principal</strong> pays down the loan and builds equity—it isn’t counted in{" "}
                  <strong>true monthly cost</strong>, which is about living costs, not building ownership.
                </li>
                <li>
                  <strong>Results</strong> depend heavily on your rent assumption and the other inputs you choose.
                </li>
              </ul>
              <details className="framing-methodology">
                <summary className="framing-methodology-summary">
                  More on carry, the chart, and true monthly cost
                </summary>
                <p>
                  <strong>True monthly cost</strong> leaves out principal because that turns cash into home equity—not
                  part of what you spend to live there month to month. The chart compares two straight stories: you own,
                  or you rent and{" "}
                  {inputs.investMonthlySavings
                    ? "invest the upfront cash plus any positive monthly savings."
                    : "invest the upfront cash only, without auto-investing monthly savings."}{" "}
                  Neither path is automatically right. The point is to make the tradeoff visible.
                </p>
                <ul className="framing-methodology-bullets">
                  <li>
                    <strong>Positive Carry</strong>: rent as a share of home price is above modeled mortgage and
                    ownership costs. That’s a favorable comparison on this lens—not a promise about your personal cash
                    flow.
                  </li>
                  <li>
                    <strong>Near Neutral</strong>: those two ideas are close to even on this view.
                  </li>
                  <li>
                    <strong>Negative Carry</strong>: rent as a share of home price is below modeled ownership costs—an
                    ownership premium on this comparison, not the same as negative cash flow in daily life.
                  </li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          This is a simplified model for comparing scenarios, not financial advice. Talk to a qualified professional
          before big housing decisions.
        </p>
      </footer>
    </div>
  );
}

export default App;
