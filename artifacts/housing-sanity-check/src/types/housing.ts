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
  /** Interest portion of P&I on the first payment (matches true monthly cost). */
  interest: number;
  /** Principal portion of P&I on the first payment. */
  principal: number;
  /** Average interest portion over months 1–12 (P&I is constant; interest share falls over time). */
  interestYearOneMonthlyAvg: number;
  /** Average principal portion over months 1–12. */
  principalYearOneMonthlyAvg: number;
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
