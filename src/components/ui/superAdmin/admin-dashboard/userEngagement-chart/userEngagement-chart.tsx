import React, { useId } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import classes from "./userEngagement-chart.module.css";
import ChartContainer from "../chartContainer/chartContainer";

// Define data types
type DataPoint = {
  day: string;
  activeUsers: number;
  avgTimeSpent: number;
  newUsers: number;
  returningUsers: number;
  engagementRate: number;
};

// Define custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
    payload: DataPoint;
  }>;
  label?: string;
}

interface UserEngagementChartProps {
  className?: string;
  label?: string;
  subtitle?: string;
}

export default function UserEngagementChart({
  label,
  subtitle,
  className,
  inLineStyles,
}: UserEngagementChartProps & {
  inLineStyles?: React.CSSProperties;
}): JSX.Element {
  const chartId = useId();

  // Chart data
  const data: DataPoint[] = [
    {
      day: "Mon",
      activeUsers: 500,
      avgTimeSpent: 400,
      newUsers: 300,
      returningUsers: 200,
      engagementRate: 100,
    },
    {
      day: "Tue",
      activeUsers: 900,
      avgTimeSpent: 800,
      newUsers: 700,
      returningUsers: 600,
      engagementRate: 500,
    },
    {
      day: "Wed",
      activeUsers: 850,
      avgTimeSpent: 750,
      newUsers: 650,
      returningUsers: 550,
      engagementRate: 450,
    },
    {
      day: "Thu",
      activeUsers: 800,
      avgTimeSpent: 700,
      newUsers: 600,
      returningUsers: 500,
      engagementRate: 400,
    },
    {
      day: "Fri",
      activeUsers: 700,
      avgTimeSpent: 600,
      newUsers: 500,
      returningUsers: 400,
      engagementRate: 300,
    },
    {
      day: "Sat",
      activeUsers: 600,
      avgTimeSpent: 500,
      newUsers: 400,
      returningUsers: 300,
      engagementRate: 200,
    },
    {
      day: "Sun",
      activeUsers: 500,
      avgTimeSpent: 400,
      newUsers: 300,
      returningUsers: 200,
      engagementRate: 100,
    },
  ];

  const chartConfig = {
    activeUsers: {
      label: "Active Users",
      lightColor: "var(--main-blue-color)",
    },
    avgTimeSpent: {
      label: "Avg. Time (min)",
      lightColor: "var(--main-blue-color)",
    },
    newUsers: {
      label: "New Users",
      lightColor: "var(--main-blue-color)",
    },
    returningUsers: {
      label: "Returning Users",
      lightColor: "var(--main-blue-color)",
    },
    engagementRate: {
      label: "Engagement Rate",
      lightColor: "var(--main-blue-color)",
    },
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const labelMap: { [key: string]: string } = {
      activeUsers: "Active Users",
      avgTimeSpent: "Avg. Time (min)",
      newUsers: "New Users",
      returningUsers: "Returning Users",
      engagementRate: "Engagement Rate",
    };

    return (
      <div className={classes.tooltip}>
        <div className={classes.tooltipLabel}>{label}</div>
        <div className={classes.tooltipContent}>
          {payload.map((entry, index) => {
            const tooltipLabel = labelMap[entry.dataKey] || entry.dataKey;

            return (
              <div key={`item-${index}`} className={classes.tooltipItem}>
                <span className={classes.tooltipName}>{tooltipLabel}</span>
                <span className={classes.tooltipValue}>
                  {entry.value.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <ChartContainer
      title={label || "User Engagement"}
      subtitle={subtitle || "Active users & average time spent"}
      inLineStyles={inLineStyles}
    >
      <div className={classes.chartWrapper}>
        {/* Inject theme variables */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            #chart-${chartId} {
              --color-activeUsers: ${chartConfig.activeUsers.lightColor};
              --color-avgTimeSpent: ${chartConfig.avgTimeSpent.lightColor};
              --color-newUsers: ${chartConfig.newUsers.lightColor};
              --color-returningUsers: ${chartConfig.returningUsers.lightColor};
              --color-engagementRate: ${chartConfig.engagementRate.lightColor};
            }
          `,
          }}
        />

        <ResponsiveContainer width="100%" height="100%" id={`chart-${chartId}`}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`activeUsersGradient-${chartId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id={`avgTimeSpentGradient-${chartId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id={`newUsersGradient-${chartId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id={`returningUsersGradient-${chartId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id={`engagementRateGradient-${chartId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--main-blue-color)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
              className={classes.grid}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular-)",
                fill: "var(--text-grey)",
              }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular-)",
                fill: "var(--text-grey)",
              }}
              width={38}
              className={classes.axis}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular-)",
                fill: "var(--text-grey)",
              }}
              domain={[0, 100]}
              width={38}
              className={classes.axis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="activeUsers"
              stroke="var(--main-blue-color)"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#activeUsersGradient-${chartId})`}
              className={classes.area}
            />
            <Area
              yAxisId="right"
              type="monotone"
              stroke="var(--main-blue-color)"
              dataKey="avgTimeSpent"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#avgTimeSpentGradient-${chartId})`}
              className={classes.area}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="newUsers"
              stroke="var(--main-blue-color)"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#newUsersGradient-${chartId})`}
              className={classes.area}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="returningUsers"
              stroke="var(--main-blue-color)"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#returningUsersGradient-${chartId})`}
              className={classes.area}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="engagementRate"
              stroke="var(--main-blue-color)"
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#engagementRateGradient-${chartId})`}
              className={classes.area}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
