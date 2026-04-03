import React, { useId, useState } from "react";
import type { ModelResults, HousingInputs } from "../types/housing";
import { formatCurrency, formatPercent } from "../lib/format";
import { useIsMobile } from "../hooks/use-mobile";

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
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "positive" | "negative" | "neutral";
  className?: string;
}) {
  const extra = [accent ? `stat-card-${accent}` : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <div className={`stat-card ${extra}`.trim()}>
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

function CollapsibleResultSection({
  sectionId,
  defaultOpen = true,
  title,
  children,
}: {
  sectionId: string;
  defaultOpen?: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reactId = useId();
  const labelId = `${sectionId}-${reactId}-label`;
  const panelId = `${sectionId}-${reactId}-panel`;

  return (
    <div className="results-disclosure" data-open={open}>
      <button
        type="button"
        id={labelId}
        className="results-disclosure-summary"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="results-disclosure-chevron" aria-hidden />
        <span className="section-title results-disclosure-title">{title}</span>
      </button>
      <div
        id={panelId}
        className="results-disclosure-body"
        role="region"
        aria-labelledby={labelId}
        aria-hidden={!open}
      >
        <div className="results-disclosure-inner">{children}</div>
      </div>
    </div>
  );
}

export function ResultsPanel({ results, inputs }: ResultsPanelProps) {
  const isCompact = useIsMobile();
  const { monthly, premiumVsRent, carry, ltv } = results;
  const isOwningCheaper = premiumVsRent < 0;
  const premiumAbs = Math.abs(premiumVsRent);
  const finalYear = results.yearlyComparison.at(-1);

  const carryExplanation: Record<string, string> = {
    "Positive Carry": `At these numbers, rent as a share of home price is higher than modeled mortgage and ownership costs. That’s a favorable comparison on this lens—not the same as your full household budget.`,
    "Near Neutral": `Rent as a share of home price and modeled ownership costs are close to even on this view.`,
    "Negative Carry": `Here, rent as a share of home price is below modeled mortgage and ownership costs—an ownership premium on this comparison, not the same as saying your everyday cash flow is negative.`,
  };

  return (
    <div className="results-panel" id="results">
      <div className="results-hero-section">
        <div className="hero-premium">
          {isOwningCheaper ? (
            <>
              <span className="hero-amount hero-positive">{formatCurrency(premiumAbs)}/mo</span>
              <span className="hero-label">
                <span className="hero-scenario-prefix">In this scenario, </span>
                cheaper to own than rent{" "}
                <span className="hero-label-scope">(true monthly cost)</span>
              </span>
            </>
          ) : (
            <>
              <span className="hero-amount hero-negative">{formatCurrency(premiumAbs)}/mo</span>
              <span className="hero-label">
                <span className="hero-scenario-prefix">In this scenario, </span>
                more expensive to own than rent{" "}
                <span className="hero-label-scope">(true monthly cost)</span>
              </span>
            </>
          )}
        </div>
        <CarryBadge status={carry.status} />
        <p className="carry-explanation">{carryExplanation[carry.status]}</p>
      </div>

      <div className="stats-tier-compare" aria-label="True monthly living cost versus rent">
        <StatCard
          label="True monthly cost"
          value={formatCurrency(monthly.trueOwnershipCost)}
          sub="Interest, taxes, upkeep, insurance, HOA"
        />
        <StatCard
          label="Comparable rent"
          value={formatCurrency(inputs.monthlyRent)}
          sub="Your estimate"
        />
      </div>

      <div className="stats-grid stats-tier-secondary" aria-label="Cash outflow and upfront capital">
        <StatCard
          className="stat-card-secondary"
          label="Owner cash outflow"
          value={formatCurrency(monthly.totalOwnerCashOutflow)}
          sub="All cash leaving your account each month"
        />
        <StatCard
          className="stat-card-secondary"
          label="Down payment"
          value={formatCurrency((inputs.homePrice * inputs.downPaymentPct) / 100)}
          sub={`${formatPercent(inputs.downPaymentPct, 0)} down · ${formatPercent(ltv * 100, 0)} loan-to-value`}
        />
      </div>

      <CollapsibleResultSection sectionId="monthly-breakdown" defaultOpen title="Monthly breakdown">
        <div className="detail-list">
          <h4 className="breakdown-subheading">Living costs</h4>
          <DetailRow label="Mortgage interest" value={formatCurrency(monthly.interest)} />
          <DetailRow label="Property taxes" value={formatCurrency(monthly.propertyTax)} />
          <DetailRow label="Maintenance (budgeted)" value={formatCurrency(monthly.maintenance)} />
          <DetailRow label="Insurance" value={formatCurrency(monthly.insurance)} />
          <DetailRow label="HOA dues" value={formatCurrency(monthly.hoa)} />
          <DetailRow
            label="Total consumed cost (your true monthly cost)"
            value={formatCurrency(monthly.trueOwnershipCost)}
          />

          <h4 className="breakdown-subheading">Equity (not a cost)</h4>
          <p className="breakdown-hint">
            Principal paydown isn’t its own field: it’s implied by the standard payment from home price, down payment,
            mortgage rate, and term under <strong>Your numbers</strong>. The split shown is for the{" "}
            <strong>first month</strong> on the starting loan balance (principal grows each month after that).
          </p>
          <DetailRow
            label="Principal paydown (builds equity, not a cost)"
            value={formatCurrency(monthly.principal)}
            muted
          />
          <DetailRow
            label="Mortgage payment (principal + interest)"
            value={formatCurrency(monthly.principalAndInterest)}
            muted
          />

          <div className="detail-divider" />
          <DetailRow label="Total owner cash outflow" value={formatCurrency(monthly.totalOwnerCashOutflow)} />
        </div>
        <p className="detail-note">
          Living costs are what you pay to occupy the home. Principal turns cash into home equity—it’s not a cost of
          living in the home. Paying down principal is similar to earning your mortgage rate on that money, but it
          reduces liquidity and flexibility. Total owner cash outflow is everything that left your account this month,
          including the full mortgage payment.
        </p>
      </CollapsibleResultSection>

      {finalYear && (
        <CollapsibleResultSection
          sectionId="money-at-exit"
          defaultOpen={false}
          title={
            isCompact
              ? `Money back at exit (${inputs.holdingPeriod}y summary)`
              : `Money back at exit (${inputs.holdingPeriod}-year summary)`
          }
        >
          <div className="detail-list">
            <DetailRow
              label={`Owner cash in over ${inputs.holdingPeriod} years`}
              value={formatCurrency(finalYear.cumulativeOwnerCashIn, true)}
            />
            <DetailRow label="Estimated net sale proceeds" value={formatCurrency(finalYear.netEquity, true)} />
            <div className="detail-divider" />
            <DetailRow
              label="Modeled net owner cost over hold"
              value={formatCurrency(finalYear.ownerNetCost, true)}
            />
          </div>
          <p className="detail-note">
            Cash back uses the estimated sale price after selling costs and paying off the loan. Home equity is value on
            paper until you sell or borrow against it.
          </p>
        </CollapsibleResultSection>
      )}

      <CollapsibleResultSection sectionId="carry-advanced" defaultOpen={false} title="Carry (advanced)">
        <div className="detail-list">
          <DetailRow label="Rent as % of home price (annual)" value={formatPercent(carry.imputedRentYield * 100)} />
          <DetailRow
            label="Modeled ownership costs (annual % of price)"
            value={formatPercent(carry.carryDrag * 100)}
          />
          <div className="detail-divider" />
          <DetailRow
            label="Net (rent % minus ownership %)"
            value={`${carry.delta >= 0 ? "+" : ""}${formatPercent(carry.delta * 100)}`}
          />
        </div>
        <p className="detail-note">
          <strong>Rent as % of price</strong> is annual rent ÷ home price. <strong>Ownership %</strong> rolls up modeled
          mortgage (by loan size), taxes, upkeep, insurance, and HOA. The net line compares those two percentages—not your
          day-to-day bank balance.
        </p>
      </CollapsibleResultSection>
    </div>
  );
}
