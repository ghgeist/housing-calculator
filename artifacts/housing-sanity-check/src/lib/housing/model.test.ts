import { expect, test } from "vitest";
import { DEFAULT_INPUTS } from "../defaults";
import {
  calcAmortizationForMonth,
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

  const expected = monthly.interest + monthly.propertyTax + monthly.maintenance + monthly.insurance + monthly.hoa;
  expect(Math.abs(monthly.trueOwnershipCost - expected)).toBeLessThan(1e-8);
  const nonMortgageCosts = monthly.propertyTax + monthly.maintenance + monthly.insurance + monthly.hoa;
  expect(Math.abs(monthly.trueOwnershipCost + monthly.principal - (monthly.principalAndInterest + nonMortgageCosts))).toBeLessThan(1e-8);
  expect(Math.abs(monthly.totalOwnerCashOutflow - (monthly.principalAndInterest + nonMortgageCosts))).toBeLessThan(1e-8);
});

test("first-payment amortization matches standard interest-on-opening-balance", () => {
  const loanAmount = 400_000;
  const annualRate = 0.06;
  const termYears = 30;
  const payment = calcMonthlyPayment(loanAmount, annualRate, termYears);
  const { interest, principal } = calcAmortizationForMonth(loanAmount, annualRate, termYears, 0);
  expect(interest).toBeCloseTo(loanAmount * (annualRate / 12), 8);
  expect(principal).toBeCloseTo(payment - interest, 8);
});

test("year-one average P&I split sums to the monthly payment", () => {
  const monthly = calcMonthlyBreakdown(DEFAULT_INPUTS);
  expect(
    monthly.interestYearOneMonthlyAvg + monthly.principalYearOneMonthlyAvg,
  ).toBeCloseTo(monthly.principalAndInterest, 8);
});

test("principal portion rises on average through year one for a typical mortgage", () => {
  const monthly = calcMonthlyBreakdown(DEFAULT_INPUTS);
  expect(monthly.principalYearOneMonthlyAvg).toBeGreaterThan(monthly.principal);
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
  expect(final!.cumulativeOwnerCashIn).toBeGreaterThan(DEFAULT_INPUTS.homePrice * (DEFAULT_INPUTS.downPaymentPct / 100));
});

test("includes HOA in ownership cost and carry drag", () => {
  const withoutHoa = runModel({
    ...DEFAULT_INPUTS,
    monthlyHoa: 0,
  });
  const withHoa = runModel({
    ...DEFAULT_INPUTS,
    monthlyHoa: 450,
  });

  expect(withHoa.monthly.hoa).toBe(450);
  expect(withHoa.monthly.trueOwnershipCost - withoutHoa.monthly.trueOwnershipCost).toBe(450);
  expect(withHoa.monthly.totalOwnerCashOutflow - withoutHoa.monthly.totalOwnerCashOutflow).toBe(450);
  expect(withHoa.carry.carryDrag).toBeGreaterThan(withoutHoa.carry.carryDrag);
});

test("disabling monthly savings investing keeps owner outputs unchanged and still invests upfront capital", () => {
  const baseInputs = {
    ...DEFAULT_INPUTS,
    homePrice: 100,
    downPaymentPct: 20,
    mortgageRate: 0,
    mortgageTerm: 30,
    propertyTaxRate: 0,
    maintenanceRate: 0,
    annualInsurance: 0,
    monthlyHoa: 0,
    monthlyRent: 0,
    rentGrowthRate: 0,
    appreciationRate: 0,
    sellingCostPct: 0,
    investmentReturnRate: 10,
    holdingPeriod: 1,
  };

  const withSavingsInvested = calcYearlyComparison({
    ...baseInputs,
    investMonthlySavings: true,
  });
  const withoutSavingsInvested = calcYearlyComparison({
    ...baseInputs,
    investMonthlySavings: false,
  });

  expect(withoutSavingsInvested[0].ownerNetCost).toBeCloseTo(withSavingsInvested[0].ownerNetCost, 8);
  expect(withoutSavingsInvested[0].cumulativeOwnerCashIn).toBeCloseTo(withSavingsInvested[0].cumulativeOwnerCashIn, 8);
  expect(withoutSavingsInvested[0].renterPortfolio).toBeCloseTo(22, 8);
  expect(withSavingsInvested[0].renterPortfolio).toBeGreaterThan(withoutSavingsInvested[0].renterPortfolio);
});

test("surfaces cumulative owner cash in for the selected hold period", () => {
  const inputs = {
    ...DEFAULT_INPUTS,
    homePrice: 240_000,
    downPaymentPct: 25,
    mortgageRate: 0,
    mortgageTerm: 30,
    propertyTaxRate: 1,
    maintenanceRate: 1,
    annualInsurance: 1_200,
    monthlyHoa: 250,
    holdingPeriod: 1,
  };

  const monthly = calcMonthlyBreakdown(inputs);
  const yearly = calcYearlyComparison(inputs);
  const expected = inputs.homePrice * 0.25 + monthly.totalOwnerCashOutflow * 12;

  expect(yearly[0].cumulativeOwnerCashIn).toBeCloseTo(expected, 8);
});
