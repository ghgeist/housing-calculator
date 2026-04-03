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
          <h1 className="app-title">Housing Sanity Check</h1>
          <p className="app-subtitle">
            Plug in a few numbers and compare the monthly cash cost of owning with renting a comparable place. You type
            the rent you think matches this home; it is your estimate, not a market scrape.
          </p>
          <a className="jump-to-results" href="#results">
            Jump to results
          </a>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <aside className="layout-inputs">
            <InputsPanel inputs={inputs} onChange={setInputs} />
          </aside>

          <div className="layout-results">
            <ResultsPanel results={results} inputs={inputs} />
            <Suspense fallback={<ChartSectionFallback />}>
              <ComparisonChart data={results.yearlyComparison} />
            </Suspense>

            <div className="framing-note">
              <h3 className="framing-title">What you&apos;re looking at</h3>
              <p>
                <strong>Monthly reality</strong>: interest, taxes, upkeep, and insurance versus the monthly rent you
                assign for a comparable place (your estimate from the form). A home is something you live in and pay
                for; this is not a pitch that owning always beats the market.
              </p>
              <details className="framing-methodology">
                <summary className="framing-methodology-summary">
                  More on carry, the chart, and true monthly cost
                </summary>
                <p>
                  <strong>True monthly cost</strong> leaves out principal paydown because that turns cash into equity, not
                  day-to-day spending. The chart compares two straight stories: you own, or you rent and invest the
                  difference. Neither path is automatically right. The point is to make the tradeoff visible.
                </p>
                <ul>
                  <li>
                    <strong>Positive Carry</strong>: implied rent from your numbers is high enough that total financing
                    and ownership drag stays modest (see the carry snapshot). Owning is roughly efficient on cash flow.
                  </li>
                  <li>
                    <strong>Near Neutral</strong>: roughly in balance. You pay a modest premium to own.
                  </li>
                  <li>
                    <strong>Negative Carry</strong>: owning costs more each month than that implied rent. You pay a real
                    premium to own; that can still be worth it for stability or other reasons, and you can see how much
                    in the results.
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
