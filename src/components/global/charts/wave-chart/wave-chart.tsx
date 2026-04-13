import React from "react";
import classes from "./wave-chart.module.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";

// Extend the recharts tooltip props type
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
}

const WavyChart: React.FC<any> = ({ data: initialData }) => {
  // Custom tooltip to show the value of the highlighted data point
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0].payload.highlight) {
      // Get the value from the highlighted data point
      const value = payload[0].payload.value;
      return (
        <div
          className="bg-white p-2 rounded shadow-md text-center"
          style={{ fontFamily: "'League Spartan', sans-serif" }}
        >
          <p className={classes.statsHover}>{value} Hours</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={classes.chartContainer}>
      {/* Adding League Spartan font from Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700&display=swap');
        `}
      </style>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={initialData}
          //   margin={{ top: 30, right: 30, left: 20, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--main-blue-color)"
                stopOpacity={0.5}
              />
              <stop
                offset="100%"
                stopColor="var(--main-white-color)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: string) => value.slice(0, 3)}
            tick={{
              fontSize: "var(--regular16-)",
              fill: "var(--text-grey)",
              fontFamily: "var(--leagueSpartan-medium-500)",
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            width={30}
            tick={{
              fontSize: "var(--regular16-)",
              fill: "var(--text-grey)",
              fontFamily: "var(--leagueSpartan-medium-500)",
            }}
            domain={[0, 40]}
            ticks={[5, 10, 20, 30, 40]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--main-blue-color)"
            strokeWidth={2}
            fill="url(#colorGradient)"
            activeDot={{
              r: 8,
              fill: "var(--main-blue-color)",
              stroke: "var(--main-white-color)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WavyChart;
