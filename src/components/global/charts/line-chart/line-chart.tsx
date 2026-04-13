import React, { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import styles from "./line-chart.tsx.module.css";

// Types
interface ChartDataItem {
  [key: string]: string | number;
}

interface AxisConfig {
  domain?: [number, number];
  ticks?: number[];
  tickFormatter?: (value: any) => string;
  width?: number;
}

interface LineChartProps {
  data: ChartDataItem[];
  chartId?: string | number;
  strokeFillColor1?: string;
  strokeFillColor2?: string;
  dataKey1?: string;
  dataKey2?: string;
  xAxisDataKey?: string;
  xAxisConfig?: AxisConfig;
  yAxisConfig?: AxisConfig;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: ChartDataItem;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipContent}>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className={styles.tooltipItem}>
            <div
              className={styles.tooltipIndicator}
              style={{ backgroundColor: entry.color }}
            />
            <span className={styles.tooltipName}>{entry.name}:</span>
            <span className={styles.tooltipValue}>{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DEFAULT_X_FORMATTER = (value: string) => {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString("default", { month: "short" });
  }
  return value.substring(0, 3);
};

const AXIS_TICK_STYLE = {
  fontFamily: "var(--leagueSpartan-medium-500)",
  fontSize: "var(--regular16-)",
  fill: "var(--text-grey)",
};

const LineChartComponent: React.FC<LineChartProps> = memo(
  ({
    data,
    chartId,
    strokeFillColor1,
    strokeFillColor2,
    dataKey1 = "newStudents",
    dataKey2,
    xAxisDataKey = "month",
    xAxisConfig,
    yAxisConfig,
  }) => {
    return (
      <ResponsiveContainer width="100%" height="100%" id={`chart-${chartId}`}>
        <LineChart
          data={data}
          margin={{ top: 7, right: 5, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--text-grey)"
            className={styles.grid}
          />
          <XAxis
            dataKey={xAxisDataKey}
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            className={styles.axis}
            tickFormatter={xAxisConfig?.tickFormatter ?? DEFAULT_X_FORMATTER}
            ticks={xAxisConfig?.ticks}
            domain={xAxisConfig?.domain}
            width={xAxisConfig?.width ?? 40}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            className={styles.axis}
            domain={yAxisConfig?.domain}
            ticks={yAxisConfig?.ticks}
            tickFormatter={yAxisConfig?.tickFormatter}
            width={yAxisConfig?.width ?? 38}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey1}
            name={dataKey1}
            stroke={strokeFillColor1 || "var(--main-blue-color)"}
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
          {dataKey2 && (
            <Line
              type="monotone"
              dataKey={dataKey2}
              name={dataKey2}
              stroke={strokeFillColor2 || "var(--blue-color3)"}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  },
);

LineChartComponent.displayName = "LineChartComponent";

export default LineChartComponent;
