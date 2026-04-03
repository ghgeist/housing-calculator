import type { HousingInputs, MonthlyBreakdown, CarryAnalysis, CarryStatus, YearlyComparison, ModelResults } from "./types";

export function calcMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const r = annualRate / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export function calcMonthlyBreakdown(inputs: HousingInputs): MonthlyBreakdown {
  const { homePrice, downPaymentPct, mortgageRate, mortgageTerm, propertyTaxRate, maintenanceRate, annualInsurance } = inputs;
  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;

  const principalAndInterest = calcMonthlyPayment(loanAmount, mortgageRate / 100, mortgageTerm);

  const monthlyInterest = loanAmount * (mortgageRate / 100 / 12);
  const principal = principalAndInterest - monthlyInterest;

  const propertyTax = homePrice * (propertyTaxRate / 100) / 12;
  const maintenance = homePrice * (maintenanceRate / 100) / 12;
  const insurance = annualInsurance / 12;

  const trueOwnershipCost = monthlyInterest + propertyTax + maintenance + insurance;

  return {
    principalAndInterest,
    interest: monthlyInterest,
    principal,
    propertyTax,
    maintenance,
    insurance,
    trueOwnershipCost,
  };
}

export function calcCarryAnalysis(inputs: HousingInputs): CarryAnalysis {
  const { homePrice, downPaymentPct, mortgageRate, propertyTaxRate, maintenanceRate, annualInsurance, monthlyRent } = inputs;
  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const ltv = loanAmount / homePrice;
  const insuranceRate = annualInsurance / homePrice;

  const imputedRentYield = (monthlyRent * 12) / homePrice;
  const carryDrag = (mortgageRate / 100) * ltv + (propertyTaxRate / 100) + (maintenanceRate / 100) + insuranceRate;

  const delta = imputedRentYield - carryDrag;

  let status: CarryStatus;
  if (delta > 0.005) {
    status = "Positive Carry";
  } else if (delta > -0.01) {
    status = "Near Neutral";
  } else {
    status = "Negative Carry";
  }

  return { delta, status, imputedRentYield, carryDrag };
}

export function calcRemainingBalance(principal: number, annualRate: number, termYears: number, yearsElapsed: number): number {
  const r = annualRate / 12;
  const n = termYears * 12;
  const p = yearsElapsed * 12;
  if (r === 0) return Math.max(0, principal * (1 - p / n));
  const pmt = calcMonthlyPayment(principal, annualRate, termYears);
  const balance = principal * Math.pow(1 + r, p) - pmt * (Math.pow(1 + r, p) - 1) / r;
  return Math.max(0, balance);
}

export function calcYearlyComparison(inputs: HousingInputs): YearlyComparison[] {
  const {
    homePrice, downPaymentPct, mortgageRate, mortgageTerm,
    propertyTaxRate, maintenanceRate, annualInsurance,
    monthlyRent, rentGrowthRate, appreciationRate, sellingCostPct,
    investmentReturnRate, holdingPeriod,
  } = inputs;

  const downPayment = homePrice * (downPaymentPct / 100);
  const loanAmount = homePrice - downPayment;
  const monthlyPnI = calcMonthlyPayment(loanAmount, mortgageRate / 100, mortgageTerm);

  const results: YearlyComparison[] = [];

  for (let year = 1; year <= holdingPeriod; year++) {
    const homeValue = homePrice * Math.pow(1 + appreciationRate / 100, year);
    const remainingBalance = calcRemainingBalance(loanAmount, mortgageRate / 100, mortgageTerm, Math.min(year, mortgageTerm));

    const saleProceedsGross = homeValue;
    const sellingCosts = saleProceedsGross * (sellingCostPct / 100);
    const saleProceedsNet = saleProceedsGross - sellingCosts - remainingBalance;

    const annualTax = homePrice * (propertyTaxRate / 100);
    const annualMaintenance = homePrice * (maintenanceRate / 100);
    const annualInsuranceCost = annualInsurance;
    const annualPnI = monthlyPnI * 12;

    let cumulativeOwnerCashflow = downPayment;
    for (let y = 1; y <= year; y++) {
      cumulativeOwnerCashflow += annualPnI + annualTax + annualMaintenance + annualInsuranceCost;
    }
    const ownerNetCost = cumulativeOwnerCashflow - saleProceedsNet;

    let cumulativeRentPaid = 0;
    let rentPortfolio = downPayment;
    for (let y = 1; y <= year; y++) {
      const yearlyRent = monthlyRent * 12 * Math.pow(1 + rentGrowthRate / 100, y - 1);
      cumulativeRentPaid += yearlyRent;

      const annualOwnerCashflow = annualPnI + annualTax + annualMaintenance + annualInsuranceCost;
      const annualSavingsFromRenting = annualOwnerCashflow - yearlyRent;
      if (annualSavingsFromRenting > 0) {
        rentPortfolio += annualSavingsFromRenting;
      }

      rentPortfolio *= (1 + investmentReturnRate / 100);
    }

    const renterNetCost = cumulativeRentPaid - (rentPortfolio - downPayment);

    results.push({
      year,
      ownerNetCost,
      renterNetCost,
      homeValue,
      remainingBalance,
      netEquity: homeValue - remainingBalance - sellingCosts,
      renterPortfolio: rentPortfolio,
      cumulativeRentPaid,
    });
  }

  return results;
}

export function runModel(inputs: HousingInputs): ModelResults {
  const downPayment = inputs.homePrice * (inputs.downPaymentPct / 100);
  const loanAmount = inputs.homePrice - downPayment;
  const ltv = loanAmount / inputs.homePrice;

  const monthly = calcMonthlyBreakdown(inputs);
  const premiumVsRent = monthly.trueOwnershipCost - inputs.monthlyRent;
  const carry = calcCarryAnalysis(inputs);
  const yearlyComparison = calcYearlyComparison(inputs);

  return {
    loanAmount,
    ltv,
    monthly,
    premiumVsRent,
    carry,
    yearlyComparison,
  };
}
