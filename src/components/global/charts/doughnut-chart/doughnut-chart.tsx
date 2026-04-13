import React, { FC, memo, useState, useEffect } from "react";
interface DoughnutChartProps {
  pending: number; // Percentage for pending
  overDue: number; // Percentage for overdue
  paid: number; // Percentage for paid
}

const DoughnutChart: FC<DoughnutChartProps> = ({ pending, overDue, paid }) => {
  const [outerRadius, setOuterRadius] = useState(240);
  const [innerRadius, setInnerRadius] = useState(140);

  // Define constraints
  const MAX_OUTER_RADIUS = 245;
  const MIN_OUTER_RADIUS = 245;

  // Maintain aspect ratio between inner and outer radius
  const RADIUS_RATIO = 140 / 240; // Original innerRadius / outerRadius

  const data = [
    {
      id: 1,
      value: (paid / (paid + pending + overDue)) * 100,
      color: "var(--main-blue-color)",
    },
    {
      id: 2,
      value: (pending / (paid + pending + overDue)) * 100,
      color: "var(--blue-color1)",
    },
    {
      id: 3,
      value: (overDue / (paid + pending + overDue)) * 100,
      color: "var(--blue-color4)",
    },
  ];

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const centerLabel = "Total Invoices";

  // SVG dimensions for viewBox only - actual size will be 100% of container
  const size = 500;
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadiusVh = 20; // Equivalent to 20vh
  const innerRadiusVh = 11;
  const gap = 6; // Gap between segments for rounded effect

  useEffect(() => {
    // Convert vh to pixels based on current viewport height with constraints
    const updateRadii = () => {
      const vh = window.innerHeight / 100;

      // Calculate raw radius based on viewport height
      let calculatedOuterRadius = outerRadiusVh * vh;

      // Apply constraints to outer radius
      calculatedOuterRadius = Math.max(MIN_OUTER_RADIUS, calculatedOuterRadius);
      calculatedOuterRadius = Math.min(MAX_OUTER_RADIUS, calculatedOuterRadius);

      // Calculate inner radius while maintaining the original ratio
      const calculatedInnerRadius = calculatedOuterRadius * RADIUS_RATIO;

      setOuterRadius(calculatedOuterRadius);
      setInnerRadius(calculatedInnerRadius);
    };

    // Initial calculation
    updateRadii();

    // Update when window is resized
    window.addEventListener("resize", updateRadii);

    // Clean up event listener
    return () => window.removeEventListener("resize", updateRadii);
  }, []);

  // Calculate the segments with gaps
  let startAngle = 0;
  const segments = data?.map((item) => {
    const percentage = item.value / totalValue;
    const angle = percentage * 2 * Math.PI;
    // Add a small gap between segments
    const gapAngle = (gap / (2 * Math.PI * outerRadius)) * 2 * Math.PI;

    const segment = {
      startAngle: startAngle + gapAngle / 2,
      endAngle: startAngle + angle - gapAngle / 2,
      color: item.color,
      value: item.value,
      percentage,
    };
    startAngle += angle;
    return segment;
  });

  return (
    <svg
      style={{
        width: "max-content",
        height: "max-content",
      }}
      viewBox={`0 0 ${size} ${size}`}
    >
      <defs>
        {/* Define filters for each segment to create rounded corners */}
        {segments?.map((segment, index) => (
          <filter key={`filter-${index}`} id={`rounded-${index}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="rounded"
            />
            <feComposite in="SourceGraphic" in2="rounded" operator="atop" />
          </filter>
        ))}
      </defs>

      {/* Render segments with rounded corners */}
      {segments.map((segment, index) => {
        const startX =
          centerX + outerRadius * Math.cos(segment.startAngle - Math.PI / 2);
        const startY =
          centerY + outerRadius * Math.sin(segment.startAngle - Math.PI / 2);
        const endX =
          centerX + outerRadius * Math.cos(segment.endAngle - Math.PI / 2);
        const endY =
          centerY + outerRadius * Math.sin(segment.endAngle - Math.PI / 2);

        const innerStartX =
          centerX + innerRadius * Math.cos(segment.startAngle - Math.PI / 2);
        const innerStartY =
          centerY + innerRadius * Math.sin(segment.startAngle - Math.PI / 2);
        const innerEndX =
          centerX + innerRadius * Math.cos(segment.endAngle - Math.PI / 2);
        const innerEndY =
          centerY + innerRadius * Math.sin(segment.endAngle - Math.PI / 2);

        const largeArcFlag =
          segment.endAngle - segment.startAngle > Math.PI ? 1 : 0;

        const path = [
          `M ${startX} ${startY}`,
          `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `L ${innerEndX} ${innerEndY}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
          `Z`,
        ].join(" ");

        return (
          <g key={index} filter={`url(#rounded-${index})`}>
            <path
              d={path}
              fill={segment.color}
              stroke={
                index === 0
                  ? "#006DAD"
                  : index === 1
                    ? "var(--main-blue-color)"
                    : "var(--light-blue)"
              }
              strokeWidth={3}
            />
          </g>
        );
      })}

      {/* White inner circle with blue border */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius - 1}
        fill="white"
        stroke="var(--main-blue-color)"
        strokeWidth="2"
      />

      {/* Center text */}
      <text
        x={centerX}
        y={centerY + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--leagueSpartan-medium-500)"
        fontSize="var(--xxxLarge62-)"
        fill="var(--main-blue-color)"
        style={{ transform: "translateY(1rem)" }}
      >
        {pending + paid + overDue}
      </text>

      {/* Label text */}
      <text
        x={centerX}
        y={centerY - 20}
        textAnchor="middle"
        fontFamily="var(--leagueSpartan-medium-500)"
        fontSize="var(--large38-)"
        fill="var(--text-grey)"
      >
        {centerLabel}
      </text>
    </svg>
  );
};

export default memo(DoughnutChart);
