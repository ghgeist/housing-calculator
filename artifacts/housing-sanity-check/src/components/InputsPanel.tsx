import { useState } from "react";
import type { HousingInputs, PropertyCostBasis } from "@/types/housing";
import { DEFAULT_INPUTS, PRESETS } from "@/lib/defaults";
import { formatCurrency } from "@/lib/format";

interface InputsPanelProps {
  inputs: HousingInputs;
  onChange: (inputs: HousingInputs) => void;
}

function Field({
  label,
  tooltip,
  children,
}: {
  label: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  const [showTip, setShowTip] = useState(false);

  return (
    <div className="input-field">
      <div className="field-label-row">
        <label className="field-label">{label}</label>
        {tooltip && (
          <div className="tooltip-wrapper">
            <button
              className="tooltip-trigger"
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              onClick={() => setShowTip((v) => !v)}
              type="button"
              aria-label="More information"
            >
              ?
            </button>
            {showTip && <div className="tooltip-content">{tooltip}</div>}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
}) {
  return (
    <div className="number-input-wrapper">
      {prefix && <span className="input-prefix">{prefix}</span>}
      <input
        type="number"
        className="number-input"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
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
    onChange(DEFAULT_INPUTS);
  }

  const downPaymentAmount = inputs.homePrice * (inputs.downPaymentPct / 100);
  const loanAmount = inputs.homePrice - downPaymentAmount;

  return (
    <div className="inputs-panel">
      <div className="panel-header">
        <h2 className="panel-title">Assumptions</h2>
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
        <h3 className="section-title">The Home</h3>
        <Field
          label="Home price"
          tooltip="The purchase price of the home you are considering."
        >
          <NumberInput
            value={inputs.homePrice}
            onChange={(v) => update("homePrice", v)}
            prefix="$"
            step={10000}
          />
        </Field>
        <Field
          label="Down payment"
          tooltip="Percent of the home price you pay upfront. This becomes your initial equity."
        >
          <div className="field-with-note">
            <NumberInput
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
          label="Mortgage rate"
          tooltip="Your annual interest rate on the mortgage. Shop around — rates vary significantly."
        >
          <NumberInput
            value={inputs.mortgageRate}
            onChange={(v) => update("mortgageRate", v)}
            suffix="%"
            step={0.125}
            min={0}
          />
        </Field>
        <Field label="Mortgage term">
          <NumberInput
            value={inputs.mortgageTerm}
            onChange={(v) => update("mortgageTerm", v)}
            suffix="years"
            step={5}
            min={5}
          />
        </Field>
        <Field
          label="Property tax rate"
          tooltip="Annual property tax as a percent of home value. Typically 0.5–2.5% depending on location."
        >
          <NumberInput
            value={inputs.propertyTaxRate}
            onChange={(v) => update("propertyTaxRate", v)}
            suffix="%/yr"
            step={0.1}
            min={0}
          />
        </Field>
        <Field
          label="Maintenance rate"
          tooltip="Annual maintenance and repairs as a percent of home value. A common rule of thumb is 1–2% per year."
        >
          <NumberInput
            value={inputs.maintenanceRate}
            onChange={(v) => update("maintenanceRate", v)}
            suffix="%/yr"
            step={0.1}
            min={0}
          />
        </Field>
        <Field label="Annual insurance">
          <NumberInput
            value={inputs.annualInsurance}
            onChange={(v) => update("annualInsurance", v)}
            prefix="$"
            step={100}
            min={0}
          />
        </Field>

        <Field
          label="Tax & maintenance base"
          tooltip="Choose whether property tax and maintenance are modeled from the original purchase price or from the home's current appreciated value each year."
        >
          <select
            className="number-input"
            value={inputs.propertyCostBasis}
            onChange={(e) => updatePropertyCostBasis(e.target.value as PropertyCostBasis)}
          >
            <option value="purchase">Purchase price (default)</option>
            <option value="currentValue">Current home value</option>
          </select>
        </Field>
      </div>

      <div className="inputs-section">
        <h3 className="section-title">The Alternative</h3>
        <Field
          label="Equivalent monthly rent"
          tooltip="What would you pay to rent a comparable home? This is the key comparison point."
        >
          <NumberInput
            value={inputs.monthlyRent}
            onChange={(v) => update("monthlyRent", v)}
            prefix="$"
            step={100}
            min={0}
          />
        </Field>
        <Field
          label="Rent growth rate"
          tooltip="How much rent increases each year. Historically 2–4% in most markets."
        >
          <NumberInput
            value={inputs.rentGrowthRate}
            onChange={(v) => update("rentGrowthRate", v)}
            suffix="%/yr"
            step={0.25}
            min={0}
          />
        </Field>
      </div>

      <div className="inputs-section">
        <h3 className="section-title">Growth Assumptions</h3>
        <Field
          label="Home appreciation rate"
          tooltip="Expected annual increase in home value. Long-run US average is roughly 3–4%, but varies widely by market."
        >
          <NumberInput
            value={inputs.appreciationRate}
            onChange={(v) => update("appreciationRate", v)}
            suffix="%/yr"
            step={0.25}
          />
        </Field>
        <Field
          label="Selling costs"
          tooltip="Transaction costs when you sell: agent commissions, transfer taxes, closing costs. Typically 5–8%."
        >
          <NumberInput
            value={inputs.sellingCostPct}
            onChange={(v) => update("sellingCostPct", v)}
            suffix="%"
            step={0.5}
            min={0}
          />
        </Field>
        <Field
          label="Investment return rate"
          tooltip="Annual return on money invested instead of used for a down payment. A diversified stock portfolio has historically returned ~7% real."
        >
          <NumberInput
            value={inputs.investmentReturnRate}
            onChange={(v) => update("investmentReturnRate", v)}
            suffix="%/yr"
            step={0.25}
          />
        </Field>
        <Field label="Holding period">
          <NumberInput
            value={inputs.holdingPeriod}
            onChange={(v) => update("holdingPeriod", Math.max(1, Math.round(v)))}
            suffix="years"
            step={1}
            min={1}
          />
        </Field>
      </div>
    </div>
  );
}
