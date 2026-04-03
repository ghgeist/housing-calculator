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

  const carryExplanation: Record<string, string> = {
    "Positive Carry": `At these numbers, implied rent (from what you entered) roughly covers financing and ownership drag. Owning is not much of a monthly drain.`,
    "Near Neutral": `Roughly balanced. You pay a bit more to own than implied rent here, but not wildly.`,
    "Negative Carry": `Owning costs noticeably more each month than implied rent here. You are paying a real premium to own (which might still be worth it for other reasons).`,
  };

  return (
    <div className="results-panel">
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

      <div className="stats-grid">
        <StatCard
          label="Mortgage payment"
          value={formatCurrency(monthly.principalAndInterest)}
          sub="Principal + interest (P&I)"
        />
        <StatCard
          label="True monthly cost"
          value={formatCurrency(monthly.trueOwnershipCost)}
          sub="Interest, taxes, upkeep, insurance"
        />
        <StatCard
          label="Comparable rent"
          value={formatCurrency(inputs.monthlyRent)}
          sub="What you would pay to rent instead"
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
          Principal paydown is not included in true monthly cost; it builds equity in the home, not spending like interest
          or repairs.
        </p>
      </div>

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
          loan-to-value), taxes, maintenance, and insurance. Positive net means implied rent keeps up with those costs;
          negative means you are carrying extra cost to own.
        </p>
      </div>
    </div>
  );
}
