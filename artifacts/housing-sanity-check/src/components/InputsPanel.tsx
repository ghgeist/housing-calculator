import { useEffect, useState, type ChangeEvent, type KeyboardEvent } from "react";
import type { ReactNode } from "react";
import type { HousingInputs, PropertyCostBasis } from "@/types/housing";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_INPUTS, PRESETS } from "@/lib/defaults";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  commitNumberFromDraft,
  committedNumberDisplay,
  committedNumberDisplayDollars,
} from "@/lib/numberInputCommit";
import { housingInputsEqual } from "@/lib/housingInputsEqual";

interface InputsPanelProps {
  inputs: HousingInputs;
  impliedRentYield: number;
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
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="tooltip-trigger"
                type="button"
                aria-label={`More information: ${label}`}
                aria-controls={tooltipId}
              >
                ?
              </button>
            </PopoverTrigger>
            <PopoverContent
              id={tooltipId}
              side="bottom"
              align="start"
              collisionPadding={16}
              className="field-help-popover-content"
            >
              {tooltip}
            </PopoverContent>
          </Popover>
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
  dollars = false,
}: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  commitTransform?: (n: number) => number;
  /** Whole-dollar fields: commas in display, `type="text"` + commit on blur/Enter. */
  dollars?: boolean;
}) {
  const [draft, setDraft] = useState(() =>
    dollars ? committedNumberDisplayDollars(committed) : committedNumberDisplay(committed),
  );

  useEffect(() => {
    setDraft(dollars ? committedNumberDisplayDollars(committed) : committedNumberDisplay(committed));
  }, [committed, dollars]);

  function commit() {
    let next = commitNumberFromDraft(draft, committed, min, commitTransform);
    if (dollars) {
      next = Math.max(min, Math.round(next));
    }
    setDraft(dollars ? committedNumberDisplayDollars(next) : committedNumberDisplay(next));
    if (next !== committed) {
      onChange(next);
    }
  }

  function handleBlur() {
    commit();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }

  return (
    <div className="number-input-wrapper">
      {prefix && <span className="input-prefix">{prefix}</span>}
      <input
        id={id}
        type={dollars ? "text" : "number"}
        className="number-input"
        value={draft}
        step={dollars ? undefined : step}
        min={dollars ? undefined : min}
        inputMode={dollars ? "decimal" : undefined}
        autoComplete="off"
        onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      {suffix && <span className="input-suffix">{suffix}</span>}
    </div>
  );
}

export function InputsPanel({ inputs, impliedRentYield, onChange }: InputsPanelProps) {
  function update(key: keyof HousingInputs, value: number) {
    onChange({ ...inputs, [key]: value });
  }

  function updateBoolean(key: keyof HousingInputs, value: boolean) {
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
    <div className="inputs-panel" id="inputs-start">
      <div className="panel-header">
        <h2 className="panel-title">Your numbers</h2>
        <div className="panel-header-actions">
          <button className="reset-btn" onClick={reset} type="button">
            Reset to defaults
          </button>
        </div>
      </div>

      <div className="panel-intro panel-intro-step">
        <div className="panel-intro-title">Step 1: Enter your scenario</div>
        <ol className="panel-intro-steps">
          <li>Home price</li>
          <li>Down payment</li>
          <li>Comparable rent</li>
        </ol>
        <p className="panel-intro-copy">
          Fill the three fields in <span className="panel-intro-emphasis">Core scenario</span> first. Use presets or open{" "}
          <strong>Growth & timeline</strong> for appreciation, selling costs, and the chart assumptions.
        </p>
      </div>

      <div className="presets-row">
        <span className="presets-label">
          Scenario:
          <span className="presets-hint presets-hint-pointer">Hover or focus for details · click to apply</span>
          <span className="presets-hint presets-hint-touch">Tap a preset to apply</span>
        </span>
        <div className="presets-chips">
          <TooltipProvider delayDuration={200}>
            {PRESETS.map((preset, i) => (
              <Tooltip key={preset.label}>
                <TooltipTrigger asChild>
                  <button
                    className="preset-btn"
                    onClick={() => applyPreset(i)}
                    type="button"
                  >
                    {preset.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" collisionPadding={16} className="preset-tooltip">
                  {preset.description}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      <details className="inputs-disclosure inputs-section" open>
        <summary className="inputs-disclosure-summary">
          <span className="section-title">Core scenario</span>
        </summary>
        <div className="inputs-disclosure-body">
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
              dollars
            />
          </Field>
          <Field
            fieldId="downPaymentPct"
            label="Down payment"
            tooltip="Percent of the home price you pay upfront. That money becomes your ownership stake in the home."
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
            fieldId="monthlyRent"
            label="Comparable rent"
            tooltip="What would you pay to rent a comparable home? This is the key comparison point."
          >
            <div className="field-with-note">
              <NumberInput
                id="monthlyRent"
                value={inputs.monthlyRent}
                onChange={(v) => update("monthlyRent", v)}
                prefix="$"
                step={100}
                min={0}
                dollars
              />
              <p className="field-helper">
                This drives the comparison. Use a truly comparable property (similar size, quality, and location).
              </p>
              <span className="field-note">
                Sanity check: annual rent is {formatPercent(impliedRentYield * 100)} of the home price.
              </span>
            </div>
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
      </details>

      <details className="inputs-disclosure inputs-section">
        <summary className="inputs-disclosure-summary">
          <span className="section-title">Financing &amp; property costs</span>
        </summary>
        <div className="inputs-disclosure-body">
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
            tooltip="Annual upkeep as a percent of home value (often ~1–2% for many houses). If HOA dues already cover building upkeep and reserves, lower this or set to 0 to avoid double-counting. Add some back for expected special assessments or a thin reserve fund."
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
              dollars
            />
          </Field>
          <Field
            fieldId="monthlyHoa"
            label="Monthly HOA"
            tooltip="Association dues—often includes reserves for future repairs (similar in spirit to maintenance). Comparing to rent: note what rent includes (e.g. utilities, cable). If reserves are thin, expect assessments; you may reflect that with a non-zero maintenance rate."
          >
            <div className="field-with-note">
              <NumberInput
                id="monthlyHoa"
                value={inputs.monthlyHoa}
                onChange={(v) => update("monthlyHoa", v)}
                prefix="$"
                step={25}
                min={0}
                dollars
              />
              <p className="field-helper">
                Important for condos/townhomes. Overlaps with maintenance when dues fund upkeep and reserves—avoid double-counting with the maintenance rate above.
              </p>
            </div>
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
      </details>

      <details className="inputs-disclosure inputs-section">
        <summary className="inputs-disclosure-summary">
          <span className="section-title">Growth & timeline</span>
        </summary>
        <div className="inputs-disclosure-body">
          <Field
            fieldId="appreciationRate"
            label="Home appreciation assumption"
            tooltip="Expected annual increase in home value. This is an assumption, not a market data feed; long-run averages vary a lot by location."
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
          <Field
            fieldId="investMonthlySavings"
            label="Invest monthly savings"
            connectLabelToControl={false}
            tooltip="When on, any gap where renting costs less than the owner cash outflow is added to the renter portfolio. The avoided down payment stays invested either way."
          >
            <div className="toggle-control">
              <div className="toggle-copy">
                <span className="toggle-title">Invest monthly savings</span>
                <span className="field-note">
                  Turns the renter surplus assumption on or off. Upfront down-payment capital remains invested either
                  way.
                </span>
              </div>
              <Switch
                id="investMonthlySavings"
                checked={inputs.investMonthlySavings}
                onCheckedChange={(checked) => updateBoolean("investMonthlySavings", checked)}
                aria-label="Invest monthly savings"
              />
            </div>
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
