export interface HousingInputs {
  homePrice: number;
  downPaymentPct: number;
  mortgageRate: number;
  mortgageTerm: number;
  propertyTaxRate: number;
  maintenanceRate: number;
  annualInsurance: number;
  monthlyRent: number;
  rentGrowthRate: number;
  appreciationRate: number;
  sellingCostPct: number;
  investmentReturnRate: number;
  holdingPeriod: number;
}

export interface MonthlyBreakdown {
  principalAndInterest: number;
  interest: number;
  principal: number;
  propertyTax: number;
  maintenance: number;
  insurance: number;
  trueOwnershipCost: number;
}

export type CarryStatus = "Positive Carry" | "Near Neutral" | "Negative Carry";

export interface CarryAnalysis {
  delta: number;
  status: CarryStatus;
  imputedRentYield: number;
  carryDrag: number;
}

export interface YearlyComparison {
  year: number;
  ownerNetCost: number;
  renterNetCost: number;
  homeValue: number;
  remainingBalance: number;
  netEquity: number;
  renterPortfolio: number;
  cumulativeRentPaid: number;
}

export interface ModelResults {
  loanAmount: number;
  ltv: number;
  monthly: MonthlyBreakdown;
  premiumVsRent: number;
  carry: CarryAnalysis;
  yearlyComparison: YearlyComparison[];
}
