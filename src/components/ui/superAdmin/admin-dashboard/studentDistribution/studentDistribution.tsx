import React, { useId, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import classes from "./studentDistribution.module.css";
import ChartContainer from "../chartContainer/chartContainer";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";

// Define types for chart data
type CurriculumData = {
  curriculum_id: number;
  name: string;
  studentCount: number;
  "curriculum.name": string;
};
type GradeData = {
  grade_id: number;
  name: string;
  studentCount: number;
  "grade.name": string;
};

// Define props for custom tooltip
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: CurriculumData & { color: string };
    color: string;
  }>;
  label?: string;
}

// Color palette from CSS variables
const COLORS = [
  "var(--blue-background-color1)",
  "var(--blue-color2)",
  "var(--blue-color3)",
  "var(--main-blue-color)",
  "var(--blue-color1)",
  "var(--orange-color)",
  "var(--orange-text-color1)",
  "var(--text-grey)",
  "var(--purple-text-color1)",
  "var(--orange-text-color1)",
  "var(--darkGrey-color)",
  "var(--red-text-color1)",
];

interface StudentDistributionChartProps {
  data?: CurriculumData[] | GradeData[] | null;
  loading?: boolean;
  error?: any;
  inLineStyles?: React.CSSProperties;
  title?: string;
  subtitle?: string;
}

export default function StudentDistributionChart({
  inLineStyles,
  data,
  loading = false,
  error,
  title,
  subtitle,
}: StudentDistributionChartProps) {
  const chartId = useId();

  // Safely convert data to array
  const safeData: CurriculumData[] | GradeData[] = Array.isArray(data)
    ? data
    : [];

  // Transform data for the pie chart
  const chartData = useMemo(() => {
    if (safeData.length === 0) return [];
    return safeData.map((item, index) => ({
      ...item,
      value: item?.studentCount || 0,
      color: COLORS[index % COLORS.length],
    }));
  }, [safeData]);

  // Calculate the total value for percentage calculation
  const totalValue = useMemo(() => {
    if (safeData.length === 0) return 0;
    return safeData.reduce((sum, item) => sum + (item?.studentCount || 0), 0);
  }, [safeData]);

  // Check if data is empty or has no students
  const hasNoData = safeData.length === 0 || totalValue === 0;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const item = payload[0];
    const percentage =
      totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : "0";

    return (
      <div className={classes.tooltip}>
        <div className={classes.tooltipLabel}>{item.name}</div>
        <div className={classes.tooltipContent}>
          <div className={classes.tooltipItem}>
            <div
              className={classes.tooltipIndicator}
              style={{ backgroundColor: item.color }}
            />
            <span className={classes.tooltipName}>Count</span>
            <span className={classes.tooltipValue}>
              {item.value} ({percentage}%)
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (loading) {
      return <LoadingBox inlineStyling={{ flex: 1 }} />;
    }

    // Error state
    if (error) {
      return <ErrorBox />;
    }

    // Empty data state
    if (hasNoData) {
      return <ErrorBox />;
    }

    // Chart with data
    return (
      <div className={classes.chartWrapper}>
        {/* Pie Chart - Left Side */}
        <div className={classes.chartSection}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            id={`chart-${chartId}`}
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry: any) => (
                  <Cell
                    key={`cell-${entry.curriculum_id || entry.grade_id}`}
                    fill={entry.color}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - Right Side */}
        <div className={classes.legendSection}>
          <div className={classes.legendList}>
            {chartData.map((entry: any) => {
              const percentage =
                totalValue > 0
                  ? ((entry.value / totalValue) * 100).toFixed(1)
                  : "0";
              return (
                <div
                  key={`legend-${entry.curriculum_id || entry.grade_id}`}
                  className={classes.legendItem}
                >
                  <div
                    className={classes.legendIndicator}
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className={classes.legendContent}>
                    <span className={classes.legendLabel}>{entry.name}</span>
                    <span className={classes.legendValue}>
                      {entry.value} ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ChartContainer
      title={title || ""}
      subtitle={subtitle}
      inLineStyles={inLineStyles}
    >
      {renderContent()}
    </ChartContainer>
  );
}
