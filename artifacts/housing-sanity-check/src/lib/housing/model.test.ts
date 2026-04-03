import { test } from "vitest";
import assert from "node:assert/strict";
import { DEFAULT_INPUTS } from "../defaults";
import {
  calcCarryAnalysis,
  calcMonthlyBreakdown,
  calcMonthlyPayment,
  calcRemainingBalance,
  calcYearlyComparison,
  runModel,
} from "./model";

test("calculates monthly mortgage payment", () => {
  const payment = calcMonthlyPayment(400_000, 0.06, 30);
  assert.ok(Math.abs(payment - 2398.2021) < 1e-4);
});

test("handles zero-interest mortgage payments", () => {
  const payment = calcMonthlyPayment(360_000, 0, 30);
  assert.equal(payment, 1000);
});

test("calculates remaining balance after amortization period", () => {
  const balance = calcRemainingBalance(400_000, 0.06, 30, 5);
  assert.ok(Math.abs(balance - 372_217.4273) < 1e-3);
});

test("reduces to straight-line principal at zero rate", () => {
  const balance = calcRemainingBalance(360_000, 0, 30, 10);
  assert.ok(Math.abs(balance - 240_000) < 1e-8);
});

test("computes true monthly ownership cost excluding principal paydown", () => {
  const monthly = calcMonthlyBreakdown(DEFAULT_INPUTS);

  const expected = monthly.interest + monthly.propertyTax + monthly.maintenance + monthly.insurance;
  assert.ok(Math.abs(monthly.trueOwnershipCost - expected) < 1e-8);
  const nonMortgageCosts = monthly.propertyTax + monthly.maintenance + monthly.insurance;
  assert.ok(Math.abs((monthly.trueOwnershipCost + monthly.principal) - (monthly.principalAndInterest + nonMortgageCosts)) < 1e-8);
});

test("classifies carry using documented thresholds", () => {
  const nearNeutral = calcCarryAnalysis({
    ...DEFAULT_INPUTS,
    homePrice: 100,
    downPaymentPct: 0,
    mortgageRate: 0,
    propertyTaxRate: 0,
    maintenanceRate: 0,
    annualInsurance: 0,
    monthlyRent: 0,
  });
  assert.equal(nearNeutral.status, "Near Neutral");

  const positiveCarry = calcCarryAnalysis({
    ...DEFAULT_INPUTS,
    homePrice: 100,
    downPaymentPct: 0,
    mortgageRate: 0,
    propertyTaxRate: 0,
    maintenanceRate: 0,
    annualInsurance: 0,
    monthlyRent: 1,
  });
  assert.equal(positiveCarry.status, "Positive Carry");

  const negativeCarry = calcCarryAnalysis({
    ...DEFAULT_INPUTS,
    homePrice: 100,
    downPaymentPct: 0,
    mortgageRate: 18,
    propertyTaxRate: 0,
    maintenanceRate: 0,
    annualInsurance: 0,
    monthlyRent: 0,
  });
  assert.equal(negativeCarry.status, "Negative Carry");
});

test("propertyCostBasis=currentValue increases owner cost under appreciation", () => {
  const purchaseBasis = calcYearlyComparison({
    ...DEFAULT_INPUTS,
    propertyCostBasis: "purchase",
    appreciationRate: 6,
    propertyTaxRate: 2,
    maintenanceRate: 2,
    holdingPeriod: 5,
  });

  const currentValueBasis = calcYearlyComparison({
    ...DEFAULT_INPUTS,
    propertyCostBasis: "currentValue",
    appreciationRate: 6,
    propertyTaxRate: 2,
    maintenanceRate: 2,
    holdingPeriod: 5,
  });

  const purchaseFinal = purchaseBasis.at(-1);
  const currentValueFinal = currentValueBasis.at(-1);
  assert.ok(purchaseFinal && currentValueFinal);
  assert.ok(currentValueFinal.ownerNetCost > purchaseFinal.ownerNetCost);
});

test("returns coherent yearly comparison outputs", () => {
  const result = runModel(DEFAULT_INPUTS);

  assert.equal(result.yearlyComparison.length, DEFAULT_INPUTS.holdingPeriod);
  assert.equal(result.yearlyComparison[0].year, 1);

  const final = result.yearlyComparison.at(-1);
  assert.ok(final);
  assert.ok(final!.homeValue > DEFAULT_INPUTS.homePrice);
  assert.ok(final!.remainingBalance < result.loanAmount);
});
