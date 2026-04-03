import type { ModelResults, HousingInputs } from "../types/housing.js";
import { formatCurrency, formatPercent } from "../lib/format.js";

interface ResultsPanelProps {
  results: ModelResults;
  inputs: HousingInputs;
}

function CarryBadge({ status }: { status: string }) {
  const classMap: Record<string, string> = {
    "Positive Carry": "badge-positive",
    "Near Neutral": "badge-neutral",
    "Negative Carry": "badge-negative",
  };
  return (
    <span className={`carry-badge ${classMap[status] ?? ""}`}>{status}</span>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
}) {
  return (
    <div className={`stat-card ${accent ? `stat-card-${accent}` : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function DetailRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`detail-row ${muted ? "detail-row-muted" : ""}`}>
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

export function ResultsPanel({ results, inputs }: ResultsPanelProps) {
  const { monthly, premiumVsRent, carry, loanAmount, ltv } = results;
  const isOwningCheaper = premiumVsRent < 0;
  const premiumAbs = Math.abs(premiumVsRent);

  const carryExplanation: Record<string, string> = {
    "Positive Carry": `At these prices and rates, the rental yield on this home more than covers your financing costs. You're not giving up much to own — owning is close to neutral or even favorable on a cash-flow basis.`,
    "Near Neutral": `The economics are roughly balanced. You're paying a modest premium for the stability and optionality of ownership, but it's not dramatically inefficient.`,
    "Negative Carry": `This home has meaningfully negative carry — your financing costs and holding expenses significantly exceed the implied rental yield. You're paying a real premium for ownership beyond just the convenience.`,
  };

  return (
    <div className="results-panel">
      <div className="hero-section">
        <div className="hero-premium">
          {isOwningCheaper ? (
            <>
              <span className="hero-amount hero-positive">{formatCurrency(premiumAbs)}/mo</span>
              <span className="hero-label">cheaper to own than rent</span>
            </>
          ) : (
            <>
              <span className="hero-amount hero-negative">{formatCurrency(premiumAbs)}/mo</span>
              <span className="hero-label">more expensive to own than rent</span>
            </>
          )}
        </div>
        <CarryBadge status={carry.status} />
        <p className="carry-explanation">{carryExplanation[carry.status]}</p>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Monthly P&I"
          value={formatCurrency(monthly.principalAndInterest)}
          sub="Principal + Interest"
        />
        <StatCard
          label="True Monthly Cost"
          value={formatCurrency(monthly.trueOwnershipCost)}
          sub="Interest + tax + maintenance + insurance"
        />
        <StatCard
          label="Equivalent Rent"
          value={formatCurrency(inputs.monthlyRent)}
          sub="Your comparison baseline"
        />
        <StatCard
          label="Down Payment"
          value={formatCurrency(inputs.homePrice * inputs.downPaymentPct / 100)}
          sub={`${formatPercent(inputs.downPaymentPct, 0)} · LTV ${formatPercent(ltv * 100, 0)}`}
        />
      </div>

      <div className="detail-section">
        <h3 className="section-title">Monthly breakdown</h3>
        <div className="detail-list">
          <DetailRow label="Mortgage interest" value={formatCurrency(monthly.interest)} />
          <DetailRow label="Property taxes" value={formatCurrency(monthly.propertyTax)} />
          <DetailRow label="Maintenance reserve" value={formatCurrency(monthly.maintenance)} />
          <DetailRow label="Insurance" value={formatCurrency(monthly.insurance)} />
          <div className="detail-divider" />
          <DetailRow label="True ownership cost" value={formatCurrency(monthly.trueOwnershipCost)} />
          <DetailRow label="Principal paydown (equity)" value={formatCurrency(monthly.principal)} muted />
          <DetailRow label="Total P&I payment" value={formatCurrency(monthly.principalAndInterest)} muted />
        </div>
        <p className="detail-note">
          Principal paydown is excluded from the true ownership cost because it converts cash to home equity, not to consumption.
        </p>
      </div>

      <div className="detail-section">
        <h3 className="section-title">Carry analysis</h3>
        <div className="detail-list">
          <DetailRow
            label="Imputed rent yield"
            value={formatPercent(carry.imputedRentYield * 100)}
          />
          <DetailRow
            label="Financing & carry drag"
            value={formatPercent(carry.carryDrag * 100)}
          />
          <div className="detail-divider" />
          <DetailRow
            label="Net carry delta"
            value={`${carry.delta >= 0 ? "+" : ""}${formatPercent(carry.delta * 100)}`}
          />
        </div>
        <p className="detail-note">
          Imputed rent yield = annual rent / home price. Carry drag = mortgage rate × LTV + tax rate + maintenance rate + insurance rate. A positive delta means renting implies the home is fairly priced; negative means you're carrying a cost premium.
        </p>
      </div>
    </div>
  );
}
