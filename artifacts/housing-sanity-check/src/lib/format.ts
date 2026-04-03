export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    const absVal = Math.abs(value);
    const sign = value < 0 ? "-" : "";
    if (absVal >= 1_000_000) {
      return `${sign}$${(absVal / 1_000_000).toFixed(1)}M`;
    }
    return `${sign}$${(absVal / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatSignedCurrency(value: number): string {
  const abs = formatCurrency(Math.abs(value));
  return value >= 0 ? `+${abs}` : `-${abs.slice(1)}`;
}
