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
            A decision clarity tool. See the real economics of owning vs. renting before you commit.
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
              <h3 className="framing-title">How to read this</h3>
              <p>
                This tool models a home as a <strong>leveraged consumption system</strong>, not a default investment.
                It asks: are you paying a fair price for the stability and optionality of ownership, or are you taking on
                clearly negative carry?
              </p>
              <p>
                The true monthly cost excludes principal paydown — that converts cash to equity, not consumption.
                The comparison models two honest paths: one where you own, one where you rent and invest the difference.
                Neither is obviously right. The point is to make the tradeoff visible.
              </p>
              <ul>
                <li><strong>Positive Carry</strong> — rental yield exceeds your financing costs. Owning is efficient.</li>
                <li><strong>Near Neutral</strong> — roughly balanced. You're paying a modest premium for the benefits of ownership.</li>
                <li><strong>Negative Carry</strong> — financing costs significantly exceed rental yield. You're paying a real premium to own. That may still be worth it for other reasons — but now you can see how much.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          This is a simplified model for decision clarity, not financial advice. Consult a financial advisor before making housing decisions.
        </p>
      </footer>
    </div>
  );
}

export default App;
