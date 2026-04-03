import React from "react";
import type { ModelResults, HousingInputs } from "../types/housing";
import { formatCurrency, formatPercent } from "../lib/format";

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
  const { monthly, premiumVsRent, carry, ltv } = results;
  const isOwningCheaper = premiumVsRent < 0;
  const premiumAbs = Math.abs(premiumVsRent);
  const finalYear = results.yearlyComparison.at(-1);

  const carryExplanation: Record<string, string> = {
    "Positive Carry": `At these numbers, implied rent yield more than covers modeled financing and ownership drag. This is a spread view, not a household cash-flow statement.`,
    "Near Neutral": `The spread is roughly balanced. Implied rent yield and ownership drag are close to even here.`,
    "Negative Carry": `Negative Carry here means implied rent yield is below modeled ownership drag. It is a spread metric, not a claim that your household free cash flow is negative.`,
  };

  return (
    <div className="results-panel" id="results">
      <div className="stats-grid">
        <StatCard
          label="Owner cash outflow"
          value={formatCurrency(monthly.totalOwnerCashOutflow)}
          sub="Cash leaving your account each month"
        />
        <StatCard
          label="True monthly cost"
          value={formatCurrency(monthly.trueOwnershipCost)}
          sub="Consumed cost: interest, taxes, upkeep, insurance, HOA"
        />
        <StatCard
          label="Comparable rent"
          value={formatCurrency(inputs.monthlyRent)}
          sub="Your estimate for a comparable property"
        />
        <StatCard
          label="Down Payment"
          value={formatCurrency(inputs.homePrice * inputs.downPaymentPct / 100)}
          sub={`${formatPercent(inputs.downPaymentPct, 0)} · LTV ${formatPercent(ltv * 100, 0)}`}
        />
      </div>

      <div className="hero-section">
        <div className="hero-premium">
          {isOwningCheaper ? (
            <>
              <span className="hero-amount hero-positive">{formatCurrency(premiumAbs)}/mo</span>
              <span className="hero-label">
                cheaper to own than rent{" "}
                <span className="hero-label-scope">(true monthly cost)</span>
              </span>
            </>
          ) : (
            <>
              <span className="hero-amount hero-negative">{formatCurrency(premiumAbs)}/mo</span>
              <span className="hero-label">
                more expensive to own than rent{" "}
                <span className="hero-label-scope">(true monthly cost)</span>
              </span>
            </>
          )}
        </div>
        <CarryBadge status={carry.status} />
        <p className="carry-explanation">{carryExplanation[carry.status]}</p>
      </div>

      <div className="detail-section">
        <h3 className="section-title">Monthly breakdown</h3>
        <div className="detail-list">
          <DetailRow label="Mortgage interest" value={formatCurrency(monthly.interest)} />
          <DetailRow label="Property taxes" value={formatCurrency(monthly.propertyTax)} />
          <DetailRow label="Maintenance reserve" value={formatCurrency(monthly.maintenance)} />
          <DetailRow label="Insurance" value={formatCurrency(monthly.insurance)} />
          <DetailRow label="HOA dues" value={formatCurrency(monthly.hoa)} />
          <div className="detail-divider" />
          <DetailRow label="True monthly ownership cost (consumed)" value={formatCurrency(monthly.trueOwnershipCost)} />
          <DetailRow label="Principal paydown (equity)" value={formatCurrency(monthly.principal)} muted />
          <DetailRow label="Mortgage payment (P&I only)" value={formatCurrency(monthly.principalAndInterest)} muted />
          <DetailRow label="Total owner cash outflow" value={formatCurrency(monthly.totalOwnerCashOutflow)} />
        </div>
        <p className="detail-note">
          True monthly ownership cost tracks consumed cost. Total owner cash outflow adds principal paydown because that
          cash still leaves your account even though it becomes equity.
        </p>
      </div>

      {finalYear && (
        <div className="detail-section">
          <h3 className="section-title">Money back at exit</h3>
          <div className="detail-list">
            <DetailRow
              label={`Owner cash in over ${inputs.holdingPeriod} years`}
              value={formatCurrency(finalYear.cumulativeOwnerCashIn, true)}
            />
            <DetailRow label="Estimated net sale proceeds" value={formatCurrency(finalYear.netEquity, true)} />
            <div className="detail-divider" />
            <DetailRow label="Modeled net owner cost over hold" value={formatCurrency(finalYear.ownerNetCost, true)} />
          </div>
          <p className="detail-note">
            Cash back uses the estimated sale value after selling costs and remaining loan payoff. Home equity is
            balance-sheet value and may be illiquid unless you sell or borrow against it.
          </p>
        </div>
      )}

      <div className="detail-section">
        <h3 className="section-title">Carry snapshot</h3>
        <div className="detail-list">
          <DetailRow
            label="Rent vs price (yield)"
            value={formatPercent(carry.imputedRentYield * 100)}
          />
          <DetailRow
            label="Financing + ownership drag"
            value={formatPercent(carry.carryDrag * 100)}
          />
          <div className="detail-divider" />
          <DetailRow
            label="Net (yield minus drag)"
            value={`${carry.delta >= 0 ? "+" : ""}${formatPercent(carry.delta * 100)}`}
          />
        </div>
        <p className="detail-note">
          <strong>Implied rent yield</strong> is annual rent ÷ home price. <strong>Drag</strong> adds mortgage cost (by
          loan-to-value), taxes, maintenance, insurance, and HOA. The net line is a carry spread, not a household
          free-cash-flow metric.
        </p>
      </div>
    </div>
  );
}
