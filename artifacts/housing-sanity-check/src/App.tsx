import { useState, useMemo } from "react";
import { InputsPanel } from "@/components/InputsPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ComparisonChart } from "@/components/ComparisonChart";
import { DEFAULT_INPUTS } from "@/lib/defaults";
import { runModel } from "@/lib/housing/model";
import type { HousingInputs } from "@/types/housing";
import "./app.css";

function App() {
  const [inputs, setInputs] = useState<HousingInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => runModel(inputs), [inputs]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-inner">
          <h1 className="app-title">Housing Sanity Check</h1>
          <p className="app-subtitle">
            Plug in a few numbers and compare what owning really costs each month to renting something similar.
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          <aside className="layout-inputs">
            <InputsPanel inputs={inputs} onChange={setInputs} />
          </aside>

          <div className="layout-results">
            <ResultsPanel results={results} inputs={inputs} />
            <ComparisonChart data={results.yearlyComparison} />

            <div className="framing-note">
              <h3 className="framing-title">What you&apos;re looking at</h3>
              <p>
                I built so I could see the <strong>monthly reality</strong>: interest, taxes, upkeep, and insurance
                — versus what you&apos;d pay to rent a comparable place. A home is something you live in and pay for; this
                isn&apos;t a pitch that owning always beats the market.
              </p>
              <p>
                <strong>True monthly cost</strong> leaves out principal paydown because that turns cash into equity, not
                day-to-day spending. The chart compares two straight stories: you own, or you rent and invest the
                difference. Neither path is automatically right — the point is to make the tradeoff visible.
              </p>
              <ul>
                <li>
                  <strong>Positive Carry</strong> — the rent implied by this home is high enough that your
                  mortgage-heavy costs don&apos;t feel like a huge drag. Owning is roughly efficient on cash flow.
                </li>
                <li>
                  <strong>Near Neutral</strong> — roughly in balance. You pay a modest premium to own.
                </li>
                <li>
                  <strong>Negative Carry</strong> — owning costs more than this implied rent each month. You&apos;re
                  paying a real premium to own; that can still be worth it for stability or other reasons — here you can
                  see how much.
                </li>
              </ul>
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
