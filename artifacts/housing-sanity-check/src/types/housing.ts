export type PropertyCostBasis = "purchase" | "currentValue";

export interface HousingInputs {
  homePrice: number;
  downPaymentPct: number;
  mortgageRate: number;
  mortgageTerm: number;
  propertyTaxRate: number;
  maintenanceRate: number;
  annualInsurance: number;
  monthlyHoa: number;
  propertyCostBasis: PropertyCostBasis;
  monthlyRent: number;
  rentGrowthRate: number;
  appreciationRate: number;
  sellingCostPct: number;
  investmentReturnRate: number;
  investMonthlySavings: boolean;
  holdingPeriod: number;
}

export interface MonthlyBreakdown {
  principalAndInterest: number;
  interest: number;
  principal: number;
  propertyTax: number;
  maintenance: number;
  insurance: number;
  hoa: number;
  trueOwnershipCost: number;
  totalOwnerCashOutflow: number;
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
  cumulativeOwnerCashIn: number;
}

export interface ModelResults {
  loanAmount: number;
  ltv: number;
  monthly: MonthlyBreakdown;
  premiumVsRent: number;
  carry: CarryAnalysis;
  yearlyComparison: YearlyComparison[];
}
