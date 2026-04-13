import React, { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import classes from "./horizontalBar-chart.module.css";

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

interface BarChartComponentProps {
  data: ChartDataItem[];
  chartId?: string | number;
  barFillColor?: string;
  barDataKey?: string;
  categoryDataKey?: string;
  vertical?: boolean;
  tooltipSuffix?: string;
  tooltipLabel?: string;
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
  suffix?: string;
  tooltipLabel?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  suffix = "%",
  tooltipLabel,
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className={classes.tooltip}>
      <div className={classes.tooltipLabel}>{label}</div>
      <div className={classes.tooltipContent}>
        {payload?.map((entry, index) => (
          <div key={`tooltip-item-${index}`} className={classes.tooltipItem}>
            <span className={classes.tooltipName}>
              {tooltipLabel
                ? tooltipLabel.charAt(0).toUpperCase() + tooltipLabel.slice(1)
                : entry.dataKey.charAt(0).toUpperCase() +
                  entry.dataKey.slice(1)}
              :
            </span>
            <span className={classes.tooltipValue}>
              {entry.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AXIS_TICK_STYLE = {
  fontFamily: "var(--leagueSpartan-medium-500)",
  fontSize: "var(--regular16-)",
  fill: "var(--text-grey)",
};

const DEFAULT_DOMAIN: [number, number] = [0, 100];
const DEFAULT_TICKS = [0, 20, 40, 60, 80, 100];
const DEFAULT_CATEGORY_WIDTH = 110;
const MAX_LABEL_LENGTH = 10;
const DEFAULT_FORMATTER = (value: number): string => `${value}%`;

const BarChartComponent: React.FC<BarChartComponentProps> = memo(
  ({
    data,
    chartId,
    barFillColor,
    barDataKey = "",
    categoryDataKey = "",
    vertical = false,
    tooltipSuffix = "%",
    tooltipLabel,
    xAxisConfig,
    yAxisConfig,
  }) => {
    const formatCategoryLabel = useMemo(
      () =>
        (value: string): string =>
          value.length > MAX_LABEL_LENGTH
            ? `${value.substring(0, MAX_LABEL_LENGTH)}...`
            : value,
      [data],
    );

    const renderTooltip = useMemo(
      () => (
        <Tooltip
          content={
            <CustomTooltip suffix={tooltipSuffix} tooltipLabel={tooltipLabel} />
          }
        />
      ),
      [tooltipSuffix, tooltipLabel],
    );

    if (vertical) {
      return (
        <ResponsiveContainer width="100%" height="100%" id={`chart-${chartId}`}>
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--grey-color1)"
            />
            <XAxis
              dataKey={categoryDataKey}
              type="category"
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK_STYLE}
              tickFormatter={xAxisConfig?.tickFormatter}
              interval={0}
              width={xAxisConfig?.width}
            />
            <YAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={AXIS_TICK_STYLE}
              domain={yAxisConfig?.domain ?? DEFAULT_DOMAIN}
              tickFormatter={yAxisConfig?.tickFormatter ?? DEFAULT_FORMATTER}
              ticks={yAxisConfig?.ticks ?? DEFAULT_TICKS}
              width={yAxisConfig?.width ?? 45}
            />
            {renderTooltip}
            <Bar
              dataKey={barDataKey}
              fill={barFillColor || "var(--main-blue-color)"}
              radius={[10, 10, 2.5, 2.5]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%" id={`chart-${chartId}`}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="var(--grey-color1)"
          />
          <YAxis
            dataKey={categoryDataKey}
            type="category"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            width={yAxisConfig?.width ?? DEFAULT_CATEGORY_WIDTH}
            tickFormatter={yAxisConfig?.tickFormatter ?? formatCategoryLabel}
            interval={0}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={AXIS_TICK_STYLE}
            domain={xAxisConfig?.domain ?? DEFAULT_DOMAIN}
            tickFormatter={xAxisConfig?.tickFormatter ?? DEFAULT_FORMATTER}
            ticks={xAxisConfig?.ticks ?? DEFAULT_TICKS}
          />
          {renderTooltip}
          <Bar
            dataKey={barDataKey}
            fill={barFillColor || "var(--main-blue-color)"}
            radius={[2.5, 10, 10, 2.5]}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  },
);

BarChartComponent.displayName = "BarChartComponent";

export default BarChartComponent;
