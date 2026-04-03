import { useEffect, useState, type ChangeEvent } from "react";
import type { ReactNode } from "react";
import type { HousingInputs, PropertyCostBasis } from "@/types/housing";
import { DEFAULT_INPUTS, PRESETS } from "@/lib/defaults";
import { formatCurrency } from "@/lib/format";
import { commitNumberFromDraft, committedNumberDisplay } from "@/lib/numberInputCommit";
import { housingInputsEqual } from "@/lib/housingInputsEqual";

interface InputsPanelProps {
  inputs: HousingInputs;
  onChange: (inputs: HousingInputs) => void;
}

function Field({
  label,
  fieldId,
  tooltip,
  connectLabelToControl = true,
  children,
}: {
  label: string;
  fieldId: string;
  tooltip?: string;
  /** When false, label is not tied to `htmlFor` (e.g. button groups). */
  connectLabelToControl?: boolean;
  children: ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);
  const tooltipId = `${fieldId}-tooltip`;
  const labelEl = connectLabelToControl ? (
    <label className="field-label" htmlFor={fieldId}>
      {label}
    </label>
  ) : (
    <span className="field-label" id={`${fieldId}-label`}>
      {label}
    </span>
  );

  return (
    <div className="input-field">
      <div className="field-label-row">
        {labelEl}
        {tooltip && (
          <div className="tooltip-wrapper">
            <button
              className="tooltip-trigger"
              type="button"
              aria-label={`More information: ${label}`}
              aria-expanded={showTip}
              aria-controls={tooltipId}
              aria-describedby={showTip ? tooltipId : undefined}
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              onFocus={() => setShowTip(true)}
              onBlur={() => setShowTip(false)}
            >
              ?
            </button>
            {showTip && (
              <div className="tooltip-content" id={tooltipId} role="tooltip">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function NumberInput({
  id,
  value: committed,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  commitTransform,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  commitTransform?: (n: number) => number;
}) {
  const [draft, setDraft] = useState(() => committedNumberDisplay(committed));

  useEffect(() => {
    setDraft(committedNumberDisplay(committed));
  }, [committed]);

  function handleBlur() {
    const next = commitNumberFromDraft(draft, committed, min, commitTransform);
    setDraft(committedNumberDisplay(next));
    if (next !== committed) {
      onChange(next);
    }
  }

  return (
    <div className="number-input-wrapper">
      {prefix && <span className="input-prefix">{prefix}</span>}
      <input
        id={id}
        type="number"
        className="number-input"
        value={draft}
        step={step}
        min={min}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
        onBlur={handleBlur}
      />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </div>
  );
}

export function InputsPanel({ inputs, onChange }: InputsPanelProps) {
  function update(key: keyof HousingInputs, value: number) {
    onChange({ ...inputs, [key]: value });
  }

  function updatePropertyCostBasis(value: PropertyCostBasis) {
    onChange({ ...inputs, propertyCostBasis: value });
  }

  function applyPreset(presetIdx: number) {
    onChange({ ...inputs, ...PRESETS[presetIdx].inputs });
  }

  function reset() {
    if (!housingInputsEqual(inputs, DEFAULT_INPUTS)) {
      if (!window.confirm("Reset all inputs to defaults?")) {
        return;
      }
    }
    onChange(DEFAULT_INPUTS);
  }

  const downPaymentAmount = inputs.homePrice * (inputs.downPaymentPct / 100);
  const loanAmount = inputs.homePrice - downPaymentAmount;

  return (
    <div className="inputs-panel">
      <div className="panel-header">
        <h2 className="panel-title">Your numbers</h2>
        <button className="reset-btn" onClick={reset} type="button">
          Reset to defaults
        </button>
      </div>

      <div className="presets-row">
        <span className="presets-label">Scenario:</span>
        {PRESETS.map((preset, i) => (
          <button
            key={preset.label}
            className="preset-btn"
            onClick={() => applyPreset(i)}
            type="button"
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="inputs-section">
        <h3 className="section-title">The place</h3>
        <Field
          fieldId="homePrice"
          label="Home price"
          tooltip="The purchase price of the home you are considering."
        >
          <NumberInput
            id="homePrice"
            value={inputs.homePrice}
            onChange={(v) => update("homePrice", v)}
            prefix="$"
            step={10000}
          />
        </Field>
        <Field
          fieldId="downPaymentPct"
          label="Down payment"
          tooltip="Percent of the home price you pay upfront. This becomes your initial equity."
        >
          <div className="field-with-note">
            <NumberInput
              id="downPaymentPct"
              value={inputs.downPaymentPct}
              onChange={(v) => update("downPaymentPct", v)}
              suffix="%"
              step={0.5}
              min={0}
            />
            <span className="field-note">
              {formatCurrency(downPaymentAmount)} down · {formatCurrency(loanAmount)} loan
            </span>
          </div>
        </Field>
        <Field
          fieldId="mortgageRate"
          label="Mortgage rate"
          tooltip="Your annual interest rate on the mortgage. Shop around. Rates vary significantly."
        >
          <NumberInput
            id="mortgageRate"
            value={inputs.mortgageRate}
            onChange={(v) => update("mortgageRate", v)}
            suffix="%"
            step={0.125}
            min={0}
          />
        </Field>
        <Field fieldId="mortgageTerm" label="Mortgage term">
          <NumberInput
            id="mortgageTerm"
            value={inputs.mortgageTerm}
            onChange={(v) => update("mortgageTerm", v)}
            suffix="years"
            step={5}
            min={5}
          />
        </Field>
        <Field
          fieldId="propertyTaxRate"
          label="Property tax rate"
          tooltip="Annual property tax as a percent of home value. Typically 0.5–2.5% depending on location."
        >
          <NumberInput
            id="propertyTaxRate"
            value={inputs.propertyTaxRate}
            onChange={(v) => update("propertyTaxRate", v)}
            suffix="%/yr"
            step={0.1}
            min={0}
          />
        </Field>
        <Field
          fieldId="maintenanceRate"
          label="Maintenance rate"
          tooltip="Annual maintenance and repairs as a percent of home value. A common rule of thumb is 1–2% per year."
        >
          <NumberInput
            id="maintenanceRate"
            value={inputs.maintenanceRate}
            onChange={(v) => update("maintenanceRate", v)}
            suffix="%/yr"
            step={0.1}
            min={0}
          />
        </Field>
        <Field fieldId="annualInsurance" label="Annual insurance">
          <NumberInput
            id="annualInsurance"
            value={inputs.annualInsurance}
            onChange={(v) => update("annualInsurance", v)}
            prefix="$"
            step={100}
            min={0}
          />
        </Field>

        <Field
          fieldId="propertyCostBasis"
          label="Tax & maintenance base"
          connectLabelToControl={false}
          tooltip="Choose whether property tax and maintenance are modeled from the original purchase price or from the home's current appreciated value each year."
        >
          <div className="choice-row" role="group" aria-label="Tax and maintenance basis">
            <button
              type="button"
              className={`choice-btn ${inputs.propertyCostBasis === "purchase" ? "choice-btn-active" : ""}`}
              aria-pressed={inputs.propertyCostBasis === "purchase"}
              onClick={() => updatePropertyCostBasis("purchase")}
            >
              Purchase price
            </button>
            <button
              type="button"
              className={`choice-btn ${inputs.propertyCostBasis === "currentValue" ? "choice-btn-active" : ""}`}
              aria-pressed={inputs.propertyCostBasis === "currentValue"}
              onClick={() => updatePropertyCostBasis("currentValue")}
            >
              Current value
            </button>
          </div>
        </Field>
      </div>

      <div className="inputs-section">
        <h3 className="section-title">Or renting</h3>
        <Field
          fieldId="monthlyRent"
          label="Equivalent monthly rent"
          tooltip="What would you pay to rent a comparable home? This is the key comparison point."
        >
          <NumberInput
            id="monthlyRent"
            value={inputs.monthlyRent}
            onChange={(v) => update("monthlyRent", v)}
            prefix="$"
            step={100}
            min={0}
          />
        </Field>
        <Field
          fieldId="rentGrowthRate"
          label="Rent growth rate"
          tooltip="How much rent increases each year. Historically 2–4% in most markets."
        >
          <NumberInput
            id="rentGrowthRate"
            value={inputs.rentGrowthRate}
            onChange={(v) => update("rentGrowthRate", v)}
            suffix="%/yr"
            step={0.25}
            min={0}
          />
        </Field>
      </div>

      <details className="inputs-disclosure">
        <summary className="inputs-disclosure-summary">
          <span className="section-title">Growth & timeline</span>
        </summary>
        <div className="inputs-disclosure-body">
          <Field
            fieldId="appreciationRate"
            label="Home appreciation rate"
            tooltip="Expected annual increase in home value. Long-run US average is roughly 3–4%, but varies widely by market."
          >
            <NumberInput
              id="appreciationRate"
              value={inputs.appreciationRate}
              onChange={(v) => update("appreciationRate", v)}
              suffix="%/yr"
              step={0.25}
              min={0}
            />
          </Field>
          <Field
            fieldId="sellingCostPct"
            label="Selling costs"
            tooltip="Transaction costs when you sell: agent commissions, transfer taxes, closing costs. Typically 5–8%."
          >
            <NumberInput
              id="sellingCostPct"
              value={inputs.sellingCostPct}
              onChange={(v) => update("sellingCostPct", v)}
              suffix="%"
              step={0.5}
              min={0}
            />
          </Field>
          <Field
            fieldId="investmentReturnRate"
            label="Investment return rate"
            tooltip="Annual return on money invested instead of used for a down payment. A diversified stock portfolio has historically returned ~7% real."
          >
            <NumberInput
              id="investmentReturnRate"
              value={inputs.investmentReturnRate}
              onChange={(v) => update("investmentReturnRate", v)}
              suffix="%/yr"
              step={0.25}
              min={0}
            />
          </Field>
          <Field fieldId="holdingPeriod" label="Holding period">
            <NumberInput
              id="holdingPeriod"
              value={inputs.holdingPeriod}
              onChange={(v) => update("holdingPeriod", v)}
              suffix="years"
              step={1}
              min={1}
              commitTransform={(n) => Math.max(1, Math.round(n))}
            />
          </Field>
        </div>
      </details>
    </div>
  );
}
