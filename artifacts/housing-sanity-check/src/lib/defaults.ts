import type { HousingInputs } from "../types/housing";

export const DEFAULT_INPUTS: HousingInputs = {
  homePrice: 750000,
  downPaymentPct: 20,
  mortgageRate: 6.75,
  mortgageTerm: 30,
  propertyTaxRate: 1.2,
  maintenanceRate: 1.0,
  annualInsurance: 1800,
  monthlyHoa: 0,
  propertyCostBasis: "purchase",
  monthlyRent: 3200,
  rentGrowthRate: 3.0,
  appreciationRate: 4.0,
  sellingCostPct: 6.0,
  investmentReturnRate: 7.0,
  investMonthlySavings: true,
  holdingPeriod: 10,
};

export const PRESETS: { label: string; description: string; inputs: Partial<HousingInputs> }[] = [
  {
    label: "Low-Rate Regime",
    description:
      "Sets a ~3.5% mortgage, higher appreciation, and a slightly lower investment-return assumption—meant to mimic cheaper financing conditions.",
    inputs: {
      mortgageRate: 3.5,
      investmentReturnRate: 6.0,
      appreciationRate: 5.0,
    },
  },
  {
    label: "Current Regime",
    description:
      "Elevated mortgage (~6.75%), moderate appreciation, and baseline investment return—roughly a 2024–2025-style setup.",
    inputs: {
      mortgageRate: 6.75,
      investmentReturnRate: 7.0,
      appreciationRate: 3.5,
    },
  },
  {
    label: "Price Correction",
    description:
      "15% lower home price, a slightly lower mortgage rate, and slower appreciation and rent growth—a softer-market what-if.",
    inputs: {
      homePrice: 637500,
      mortgageRate: 6.0,
      appreciationRate: 2.0,
      rentGrowthRate: 2.0,
    },
  },
];
