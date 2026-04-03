import type { HousingInputs } from "../types/housing.js";

export const DEFAULT_INPUTS: HousingInputs = {
  homePrice: 750000,
  downPaymentPct: 20,
  mortgageRate: 6.75,
  mortgageTerm: 30,
  propertyTaxRate: 1.2,
  maintenanceRate: 1.0,
  annualInsurance: 1800,
  propertyCostBasis: "purchase",
  monthlyRent: 3200,
  rentGrowthRate: 3.0,
  appreciationRate: 4.0,
  sellingCostPct: 6.0,
  investmentReturnRate: 7.0,
  holdingPeriod: 10,
};

export const PRESETS: { label: string; description: string; inputs: Partial<HousingInputs> }[] = [
  {
    label: "Low-Rate Regime",
    description: "Mortgage rates around 3-4%. Favorable financing conditions.",
    inputs: {
      mortgageRate: 3.5,
      investmentReturnRate: 6.0,
      appreciationRate: 5.0,
    },
  },
  {
    label: "Current Regime",
    description: "Elevated mortgage rates, still-high prices. Typical 2024-2025 market.",
    inputs: {
      mortgageRate: 6.75,
      investmentReturnRate: 7.0,
      appreciationRate: 3.5,
    },
  },
  {
    label: "Price Correction",
    description: "Prices drop 15%, rents stabilize. What if the market softens?",
    inputs: {
      homePrice: 637500,
      mortgageRate: 6.0,
      appreciationRate: 2.0,
      rentGrowthRate: 2.0,
    },
  },
];
