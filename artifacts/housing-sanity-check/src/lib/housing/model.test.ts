import { expect, test } from "vitest";
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
  expect(Math.abs(payment - 2398.2021)).toBeLessThan(1e-4);
});

test("handles zero-interest mortgage payments", () => {
  const payment = calcMonthlyPayment(360_000, 0, 30);
  expect(payment).toBe(1000);
});

test("calculates remaining balance after amortization period", () => {
  const balance = calcRemainingBalance(400_000, 0.06, 30, 5);
  expect(Math.abs(balance - 372_217.4273)).toBeLessThan(1e-3);
});

test("reduces to straight-line principal at zero rate", () => {
  const balance = calcRemainingBalance(360_000, 0, 30, 10);
  expect(Math.abs(balance - 240_000)).toBeLessThan(1e-8);
});

test("computes true monthly ownership cost excluding principal paydown", () => {
  const monthly = calcMonthlyBreakdown(DEFAULT_INPUTS);

  const expected = monthly.interest + monthly.propertyTax + monthly.maintenance + monthly.insurance;
  expect(Math.abs(monthly.trueOwnershipCost - expected)).toBeLessThan(1e-8);
  const nonMortgageCosts = monthly.propertyTax + monthly.maintenance + monthly.insurance;
  expect(Math.abs(monthly.trueOwnershipCost + monthly.principal - (monthly.principalAndInterest + nonMortgageCosts))).toBeLessThan(1e-8);
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
  expect(nearNeutral.status).toBe("Near Neutral");

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
  expect(positiveCarry.status).toBe("Positive Carry");

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
  expect(negativeCarry.status).toBe("Negative Carry");
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
  expect(purchaseFinal).toBeDefined();
  expect(currentValueFinal).toBeDefined();
  expect(currentValueFinal!.ownerNetCost).toBeGreaterThan(purchaseFinal!.ownerNetCost);
});

test("returns coherent yearly comparison outputs", () => {
  const result = runModel(DEFAULT_INPUTS);

  expect(result.yearlyComparison.length).toBe(DEFAULT_INPUTS.holdingPeriod);
  expect(result.yearlyComparison[0].year).toBe(1);

  const final = result.yearlyComparison.at(-1);
  expect(final).toBeDefined();
  expect(final!.homeValue).toBeGreaterThan(DEFAULT_INPUTS.homePrice);
  expect(final!.remainingBalance).toBeLessThan(result.loanAmount);
});
