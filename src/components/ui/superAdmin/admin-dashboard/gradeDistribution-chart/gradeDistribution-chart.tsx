import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import classes from "./gradeDistribution-chart.module.css";
import ChartContainer from "../chartContainer/chartContainer";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";

// Define types for API data
type GradeData = {
  grade_id: number;
  name: string;
  studentCount: number;
  "grade.name": string;
};

// Define props for the component
interface GradeDistributionChartProps {
  data?: GradeData[] | null;
  loading?: boolean;
  error?: any;
  inLineStyles?: React.CSSProperties;
}

const GradeDistributionChart: React.FC<GradeDistributionChartProps> = ({
  data,
  loading = false,
  error,
  inLineStyles,
}) => {
  // Safely convert data to array
  const safeData: GradeData[] = Array.isArray(data) ? data : [];

  // Transform and sort data for the chart
  const chartData = useMemo(() => {
    if (safeData.length === 0) return [];

    return safeData
      .map((item) => {
        const fullName = item?.name || "Unknown";
        // Slice to get only "Grade X" part
        const shortName = fullName.split("(")[0].trim();

        return {
          grade: shortName,
          count: item?.studentCount || 0,
          grade_id: item?.grade_id,
        };
      })
      .sort((a, b) => (a.grade_id || 0) - (b.grade_id || 0));
  }, [safeData]);

  // Calculate total for percentage
  const totalStudents = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.count, 0);
  }, [chartData]);

  // Check if data is empty
  const hasNoData = chartData.length === 0 || totalStudents === 0;

  // Custom tooltip component
  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const value = payload[0].value || 0;
    const percentage =
      totalStudents > 0
        ? ((Number(value) / totalStudents) * 100).toFixed(1)
        : "0";

    return (
      <div className={classes.tooltip}>
        <div className={classes.tooltipLabel}>{label}</div>
        <div className={classes.tooltipContent}>
          <span className={classes.tooltipName}>Student Count</span>
          <span className={classes.tooltipValue}>
            {value} students ({percentage}%)
          </span>
        </div>
      </div>
    );
  };

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (loading) {
      return (
        <div className={classes.stateContainer}>
          <LoadingBox />
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className={classes.stateContainer}>
          <ErrorBox message={error?.message || "Something went wrong"} />
        </div>
      );
    }
    // Empty data state
    if (hasNoData) {
      return (
        <div className={classes.stateContainer}>
          <ErrorBox message="No grade distribution data available" />
        </div>
      );
    }

    // Chart with data
    return (
      <div className={classes.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ bottom: 30 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--main-white-color)"
            />
            <XAxis
              dataKey="grade"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: "clamp(0.625rem, 0.5712rem + 0.2532vw, 0.875rem)",
                fill: "var(--text-grey)",
              }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={30}
              width={30}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: "clamp(0.625rem, 0.5712rem + 0.2532vw, 0.875rem)",
                fill: "var(--text-grey)",
              }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="var(--main-blue-color)"
              radius={[4, 4, 0, 0]}
              style={{ cursor: "pointer" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <ChartContainer
      title="Students Distribution"
      subtitle="By grade"
      inLineStyles={inLineStyles}
    >
      {renderContent()}
    </ChartContainer>
  );
};

export default GradeDistributionChart;
