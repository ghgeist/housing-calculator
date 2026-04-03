import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { YearlyComparison } from "@/types/housing";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/format";

type TooltipPayloadEntry = NonNullable<TooltipProps<number, string>["payload"]>[number];

interface ComparisonChartProps {
  data: YearlyComparison[];
  investMonthlySavings: boolean;
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-title">Year {label}</p>
      {payload.map((entry: TooltipPayloadEntry) => (
        <div key={entry.dataKey} className="chart-tooltip-row">
          <span className="chart-tooltip-color" style={{ background: entry.color }} />
          <span className="chart-tooltip-name">{entry.name}:</span>
          <span className="chart-tooltip-value">{formatCurrency(entry.value ?? 0, true)}</span>
        </div>
      ))}
    </div>
  );
}

export function ComparisonChart({ data, investMonthlySavings }: ComparisonChartProps) {
  const isCompact = useIsMobile();
  const chartMargin = isCompact
    ? { top: 34, right: 8, left: 0, bottom: 12 }
    : { top: 8, right: 16, left: 8, bottom: 8 };
  const yAxisWidth = isCompact ? 52 : 60;
  const legendFontSize = isCompact ? 11 : 12;
  const mainChartHeight = isCompact ? 332 : 300;
  const wealthChartHeight = isCompact ? 252 : 220;
  const legendProps = isCompact
    ? {
        layout: "horizontal" as const,
        align: "left" as const,
        verticalAlign: "top" as const,
        wrapperStyle: {
          fontSize: legendFontSize,
          paddingTop: 0,
          lineHeight: 1.3 as const,
        },
      }
    : {
        layout: "horizontal" as const,
        align: "center" as const,
        verticalAlign: "top" as const,
        wrapperStyle: {
          fontSize: legendFontSize,
          paddingTop: 12,
        },
      };
  const ownerNetName = isCompact ? "Own (net)" : "Own: net cost";
  const renterNetName = isCompact ? "Rent path" : investMonthlySavings ? "Rent + invest: net cost" : "Rent path: net cost";
  const homeEquityName = isCompact ? "Home equity" : "Home equity (net)";
  const renterPortfolioName = isCompact ? "Renter fund" : "Renter portfolio";
  const comparisonTitle = investMonthlySavings ? "Owning vs renting + investing" : "Owning vs renting";

  const chartData = data.map((d) => ({
    year: d.year,
    ownerNetCost: Math.round(d.ownerNetCost),
    renterNetCost: Math.round(d.renterNetCost),
    homeEquity: Math.round(d.netEquity),
    renterPortfolio: Math.round(d.renterPortfolio),
  }));

  const breakEvenYear = data.find((d, i) => {
    if (i === 0) return false;
    const prev = data[i - 1];
    return (
      (prev.ownerNetCost > prev.renterNetCost && d.ownerNetCost <= d.renterNetCost) ||
      (prev.ownerNetCost < prev.renterNetCost && d.ownerNetCost >= d.renterNetCost)
    );
  });

  const finalYear = data[data.length - 1];
  const ownerWins = finalYear && finalYear.ownerNetCost < finalYear.renterNetCost;

  return (
    <div className="comparison-chart">
      <div className="chart-header">
        <h3 className="section-title">{comparisonTitle}</h3>
        <p className="chart-subtitle">
          Cumulative net cost of each path over the years you entered. Lower is cheaper.
        </p>
        <p className="chart-subtitle">
          {investMonthlySavings
            ? "Renter path includes the invested down payment and any positive monthly savings."
            : "Renter path includes the invested down payment only; monthly savings are not auto-invested."}
        </p>
      </div>

      {finalYear && (
        <div className="chart-summary">
          {ownerWins ? (
            <span className="chart-summary-win">
              In this scenario, owning is about{" "}
              {formatCurrency(Math.abs(finalYear.ownerNetCost - finalYear.renterNetCost), true)} cheaper net over{" "}
              {data.length} years
            </span>
          ) : (
            <span className="chart-summary-lose">
              In this scenario, {investMonthlySavings ? "renting + investing" : "renting"} is about{" "}
              {formatCurrency(Math.abs(finalYear.ownerNetCost - finalYear.renterNetCost), true)} cheaper net over{" "}
              {data.length} years
            </span>
          )}
          {breakEvenYear && (
            <span className="chart-breakeven">
              · Lines cross around year {breakEvenYear.year}
            </span>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={mainChartHeight}>
        <LineChart data={chartData} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="year"
            tick={{ fontSize: isCompact ? 11 : 12, fill: "var(--chart-axis)" }}
            tickLine={false}
            label={{ value: "Year", position: "insideBottom", offset: -4, fontSize: 11, fill: "var(--chart-axis)" }}
          />
          <YAxis
            tick={{ fontSize: isCompact ? 10 : 11, fill: "var(--chart-axis)" }}
            tickLine={false}
            tickFormatter={(v: number) => formatCurrency(v, true)}
            width={yAxisWidth}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            {...legendProps}
            formatter={(value: string | number) => (
              <span style={{ color: "var(--chart-axis)" }}>{value}</span>
            )}
          />
          {breakEvenYear && (
            <ReferenceLine
              x={breakEvenYear.year}
              stroke="var(--chart-breakeven)"
              strokeDasharray="4 4"
              label={{ value: "Break-even", position: "top", fontSize: 10, fill: "var(--chart-breakeven)" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="ownerNetCost"
            name={ownerNetName}
            stroke="var(--chart-own)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="renterNetCost"
            name={renterNetName}
            stroke="var(--chart-rent)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="chart-wealth-section">
        <h4 className="chart-wealth-title">Where the money ends up</h4>
        <p className="chart-subtitle">
          {investMonthlySavings
            ? "Home equity versus what the renter's investments grew to. Balance-sheet value, not cash in hand."
            : "Home equity versus the renter's invested upfront capital. Balance-sheet value, not cash in hand."}
        </p>
        <ResponsiveContainer width="100%" height={wealthChartHeight}>
          <LineChart data={chartData} margin={chartMargin}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: isCompact ? 11 : 12, fill: "var(--chart-axis)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: isCompact ? 10 : 11, fill: "var(--chart-axis)" }}
              tickLine={false}
              tickFormatter={(v: number) => formatCurrency(v, true)}
              width={yAxisWidth}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              {...legendProps}
              formatter={(value: string | number) => (
                <span style={{ color: "var(--chart-axis)" }}>{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="homeEquity"
              name={homeEquityName}
              stroke="var(--chart-own)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="renterPortfolio"
              name={renterPortfolioName}
              stroke="var(--chart-rent)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
