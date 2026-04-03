import type {
  CarryAnalysis,
  CarryStatus,
  HousingInputs,
  ModelResults,
  MonthlyBreakdown,
  PropertyCostBasis,
  YearlyComparison,
} from "../../types/housing";

const MONTHS_PER_YEAR = 12;
const POSITIVE_CARRY_THRESHOLD = 0.005;
const NEAR_NEUTRAL_THRESHOLD = -0.01;

interface LoanSnapshot {
  downPayment: number;
  loanAmount: number;
  ltv: number;
}

function toRate(percent: number): number {
  return percent / 100;
}

function getLoanSnapshot(homePrice: number, downPaymentPct: number): LoanSnapshot {
  const downPayment = homePrice * toRate(downPaymentPct);
  const loanAmount = homePrice - downPayment;
  const ltv = homePrice === 0 ? 0 : loanAmount / homePrice;

  return { downPayment, loanAmount, ltv };
}

function getPropertyCostBase(
  year: number,
  homePrice: number,
  appreciationRatePct: number,
  propertyCostBasis: PropertyCostBasis,
): number {
  if (propertyCostBasis === "purchase") {
    return homePrice;
  }

  // For "currentValue", year 1 uses purchase price, then scales with appreciation.
  return homePrice * Math.pow(1 + toRate(appreciationRatePct), year - 1);
}

export function calcMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  const monthlyRate = annualRate / MONTHS_PER_YEAR;
  const totalPayments = termYears * MONTHS_PER_YEAR;

  if (monthlyRate === 0) {
    return principal / totalPayments;
  }

  const compoundFactor = Math.pow(1 + monthlyRate, totalPayments);
  return principal * (monthlyRate * compoundFactor) / (compoundFactor - 1);
}

export function calcRemainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  yearsElapsed: number,
): number {
  const monthlyRate = annualRate / MONTHS_PER_YEAR;
  const totalPayments = termYears * MONTHS_PER_YEAR;
  const paymentsMade = yearsElapsed * MONTHS_PER_YEAR;

  if (monthlyRate === 0) {
    return Math.max(0, principal * (1 - paymentsMade / totalPayments));
  }

  const payment = calcMonthlyPayment(principal, annualRate, termYears);
  const growthFactor = Math.pow(1 + monthlyRate, paymentsMade);
  const balance = principal * growthFactor - payment * (growthFactor - 1) / monthlyRate;

  return Math.max(0, balance);
}

export function calcMonthlyBreakdown(inputs: HousingInputs): MonthlyBreakdown {
  const {
    homePrice,
    downPaymentPct,
    mortgageRate,
    mortgageTerm,
    propertyTaxRate,
    maintenanceRate,
    annualInsurance,
    monthlyHoa,
  } = inputs;

  const { loanAmount } = getLoanSnapshot(homePrice, downPaymentPct);
  const annualMortgageRate = toRate(mortgageRate);

  const principalAndInterest = calcMonthlyPayment(loanAmount, annualMortgageRate, mortgageTerm);
  const interest = loanAmount * (annualMortgageRate / MONTHS_PER_YEAR);
  const principal = principalAndInterest - interest;

  const propertyTax = homePrice * toRate(propertyTaxRate) / MONTHS_PER_YEAR;
  const maintenance = homePrice * toRate(maintenanceRate) / MONTHS_PER_YEAR;
  const insurance = annualInsurance / MONTHS_PER_YEAR;
  const hoa = monthlyHoa;

  // True ownership cost tracks consumed monthly spend, not equity conversion.
  const trueOwnershipCost = interest + propertyTax + maintenance + insurance + hoa;
  const totalOwnerCashOutflow = principalAndInterest + propertyTax + maintenance + insurance + hoa;

  return {
    principalAndInterest,
    interest,
    principal,
    propertyTax,
    maintenance,
    insurance,
    hoa,
    trueOwnershipCost,
    totalOwnerCashOutflow,
  };
}

function classifyCarry(delta: number): CarryStatus {
  if (delta > POSITIVE_CARRY_THRESHOLD) {
    return "Positive Carry";
  }
  if (delta > NEAR_NEUTRAL_THRESHOLD) {
    return "Near Neutral";
  }
  return "Negative Carry";
}

export function calcCarryAnalysis(inputs: HousingInputs): CarryAnalysis {
  const {
    homePrice,
    downPaymentPct,
    mortgageRate,
    propertyTaxRate,
    maintenanceRate,
    annualInsurance,
    monthlyHoa,
    monthlyRent,
  } = inputs;

  const { ltv } = getLoanSnapshot(homePrice, downPaymentPct);

  const imputedRentYield = homePrice === 0 ? 0 : (monthlyRent * MONTHS_PER_YEAR) / homePrice;
  const insuranceRate = homePrice === 0 ? 0 : annualInsurance / homePrice;
  const hoaRate = homePrice === 0 ? 0 : (monthlyHoa * MONTHS_PER_YEAR) / homePrice;
  const carryDrag =
    toRate(mortgageRate) * ltv +
    toRate(propertyTaxRate) +
    toRate(maintenanceRate) +
    insuranceRate +
    hoaRate;

  const delta = imputedRentYield - carryDrag;

  return {
    delta,
    status: classifyCarry(delta),
    imputedRentYield,
    carryDrag,
  };
}

export function calcYearlyComparison(inputs: HousingInputs): YearlyComparison[] {
  const {
    homePrice,
    downPaymentPct,
    mortgageRate,
    mortgageTerm,
    propertyTaxRate,
    maintenanceRate,
    annualInsurance,
    monthlyHoa,
    propertyCostBasis,
    monthlyRent,
    rentGrowthRate,
    appreciationRate,
    sellingCostPct,
    investmentReturnRate,
    investMonthlySavings,
    holdingPeriod,
  } = inputs;

  const { downPayment, loanAmount } = getLoanSnapshot(homePrice, downPaymentPct);
  const annualMortgageRate = toRate(mortgageRate);
  const monthlyPrincipalAndInterest = calcMonthlyPayment(loanAmount, annualMortgageRate, mortgageTerm);
  const annualPrincipalAndInterest = monthlyPrincipalAndInterest * MONTHS_PER_YEAR;

  const annualOwnershipCashOutflows = Array.from({ length: holdingPeriod }, (_, i) => {
    const year = i + 1;
    const propertyCostBase = getPropertyCostBase(year, homePrice, appreciationRate, propertyCostBasis);
    return (
      annualPrincipalAndInterest +
      propertyCostBase * toRate(propertyTaxRate) +
      propertyCostBase * toRate(maintenanceRate) +
      annualInsurance +
      monthlyHoa * MONTHS_PER_YEAR
    );
  });

  const yearlyComparison: YearlyComparison[] = [];

  for (let year = 1; year <= holdingPeriod; year++) {
    const homeValue = homePrice * Math.pow(1 + toRate(appreciationRate), year);
    const remainingBalance = calcRemainingBalance(
      loanAmount,
      annualMortgageRate,
      mortgageTerm,
      Math.min(year, mortgageTerm),
    );

    const sellingCosts = homeValue * toRate(sellingCostPct);
    const saleProceedsNet = homeValue - sellingCosts - remainingBalance;

    const cumulativeOwnerCashIn =
      downPayment + annualOwnershipCashOutflows.slice(0, year).reduce((sum, yearlyCost) => sum + yearlyCost, 0);
    const ownerNetCost = cumulativeOwnerCashIn - saleProceedsNet;

    let cumulativeRentPaid = 0;
    let renterPortfolio = downPayment;

    for (let currentYear = 1; currentYear <= year; currentYear++) {
      const annualRent = monthlyRent * MONTHS_PER_YEAR * Math.pow(1 + toRate(rentGrowthRate), currentYear - 1);
      cumulativeRentPaid += annualRent;

      const annualSavingsFromRenting = annualOwnershipCashOutflows[currentYear - 1] - annualRent;
      if (investMonthlySavings && annualSavingsFromRenting > 0) {
        renterPortfolio += annualSavingsFromRenting;
      }

      renterPortfolio *= 1 + toRate(investmentReturnRate);
    }

    const renterNetCost = cumulativeRentPaid - (renterPortfolio - downPayment);

    yearlyComparison.push({
      year,
      ownerNetCost,
      renterNetCost,
      homeValue,
      remainingBalance,
      netEquity: homeValue - remainingBalance - sellingCosts,
      renterPortfolio,
      cumulativeRentPaid,
      cumulativeOwnerCashIn,
    });
  }

  return yearlyComparison;
}

export function runModel(inputs: HousingInputs): ModelResults {
  const { loanAmount, ltv } = getLoanSnapshot(inputs.homePrice, inputs.downPaymentPct);
  const monthly = calcMonthlyBreakdown(inputs);

  return {
    loanAmount,
    ltv,
    monthly,
    premiumVsRent: monthly.trueOwnershipCost - inputs.monthlyRent,
    carry: calcCarryAnalysis(inputs),
    yearlyComparison: calcYearlyComparison(inputs),
  };
}
