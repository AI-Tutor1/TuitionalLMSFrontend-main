"use client";
import classes from "./bar-chart.module.css";
import { useEffect, useRef, CSSProperties, useState, useCallback } from "react";

interface DataItem {
  month: string;
  month_number: number;
  paid_total: number;
  pending_total: number;
  overdue_total: number;
}

interface BarChartProps {
  data: DataItem[];
  inlineStyles?: CSSProperties;
  heading?: string;
}

interface TooltipData {
  x: number;
  y: number;
  month: string;
  paid: number;
  pending: number;
  overdue: number;
}

interface BarPosition {
  groupIndex: number;
  centerX: number;
  startX: number;
  endX: number;
}

export default function BarCharts({
  data,
  inlineStyles,
  heading,
}: BarChartProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const barPositionsRef = useRef<BarPosition[]>([]);

  // Handle resize
  const updateDimensions = useCallback(() => {
    if (canvasContainerRef.current) {
      const { width, height } =
        canvasContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);

    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    window.addEventListener("resize", updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, [updateDimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawChart(ctx, canvas, data);
  }, [data, dimensions]);

  // Handle mouse move for tooltip - WITHOUT redrawing the canvas
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || barPositionsRef.current.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Get padding for bounds check
      const viewportWidth = window.innerWidth;
      const padding = {
        top: viewportWidth < 768 ? 30 : 40,
        bottom: viewportWidth < 768 ? 40 : 50,
      };

      let foundGroup = false;

      for (const pos of barPositionsRef.current) {
        if (
          x >= pos.startX &&
          x <= pos.endX &&
          y >= padding.top &&
          y <= rect.height - padding.bottom
        ) {
          foundGroup = true;
          const item = data[pos.groupIndex];

          // Position tooltip above the group, centered on the bars
          setTooltip({
            x: rect.left + pos.centerX,
            y: rect.top + padding.top - 10,
            month: item.month,
            paid: item.paid_total,
            pending: item.pending_total,
            overdue: item.overdue_total,
          });
          break;
        }
      }

      if (!foundGroup) {
        setTooltip(null);
      }
    },
    [data],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const drawChart = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    data: DataItem[],
  ) => {
    const { rect, chartDimensions } = setupCanvas(ctx, canvas);
    const config = getChartConfig(data, rect);

    ctx.clearRect(0, 0, rect.width, rect.height);

    drawYAxisLabels(ctx, config, chartDimensions);
    drawGroupedBars(ctx, data, config, chartDimensions, rect);
  };

  const setupCanvas = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const viewportWidth = window.innerWidth;
    const basePadding = {
      top: viewportWidth < 768 ? 30 : 40,
      right: viewportWidth < 768 ? 10 : 20,
      bottom: viewportWidth < 768 ? 40 : 50,
      left: viewportWidth < 768 ? 40 : 60,
    };

    const chartWidth = rect.width - basePadding.left - basePadding.right;
    const chartHeight = rect.height - basePadding.top - basePadding.bottom;

    return {
      rect,
      chartDimensions: { chartWidth, chartHeight, padding: basePadding },
    };
  };

  const getChartConfig = (data: DataItem[], rect: DOMRect) => {
    const computedFont =
      getComputedStyle(document.documentElement).getPropertyValue(
        "--leagueSpartan-medium-500",
      ) || "var(--leagueSpartan-medium-500)";

    const getResponsiveFontSize = (baseMultiplier = 1) => {
      const viewportWidth = window.innerWidth;

      const minSize = 10;
      const maxSize = 18;
      const preferredSize = 8.4 + viewportWidth * 0.005;

      const clampedSize = Math.max(minSize, Math.min(preferredSize, maxSize));

      const chartScale = Math.min(rect.width / 800, 1.2);
      const scaledSize = clampedSize * Math.max(chartScale, 0.8);

      const finalSize = scaledSize * baseMultiplier;

      return Math.max(finalSize, 10);
    };

    const allValues = data.flatMap((item) => [
      item.paid_total,
      item.pending_total,
      item.overdue_total,
    ]);
    const maxValue = Math.max(...allValues, 100);

    const chartHeight = rect.height;
    let yAxisStepSize = 1000;
    let targetSteps = 5;

    if (chartHeight < 200) {
      targetSteps = 3;
    } else if (chartHeight < 300) {
      targetSteps = 4;
    } else if (chartHeight < 400) {
      targetSteps = 5;
    } else {
      targetSteps = 6;
    }

    yAxisStepSize = Math.ceil(maxValue / targetSteps / 500) * 500;
    if (yAxisStepSize === 0) yAxisStepSize = 500;

    const yAxisMax = Math.ceil(maxValue / yAxisStepSize) * yAxisStepSize;
    const yAxisSteps = yAxisMax / yAxisStepSize;

    const borderRadius = Math.min(10, rect.width * 0.01);

    return {
      fontFamily: computedFont,
      getResponsiveFontSize,
      maxValue,
      yAxisStepSize,
      yAxisMax,
      yAxisSteps,
      borderRadius,
    };
  };

  const drawYAxisLabels = (
    ctx: CanvasRenderingContext2D,
    config: ReturnType<typeof getChartConfig>,
    { chartHeight, padding }: { chartHeight: number; padding: any },
  ) => {
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = `${config.getResponsiveFontSize(0.75)}px ${config.fontFamily}`;
    ctx.fillStyle = "#6d757e";

    const minLabelSpacing = config.getResponsiveFontSize(1.5);
    const availableHeight = chartHeight / config.yAxisSteps;

    for (let i = 0; i <= config.yAxisSteps; i++) {
      if (
        availableHeight < minLabelSpacing &&
        i % 2 === 1 &&
        i !== config.yAxisSteps
      ) {
        continue;
      }

      const y =
        padding.top +
        (chartHeight / config.yAxisSteps) * (config.yAxisSteps - i);
      const value = config.yAxisStepSize * i;

      const formattedValue =
        value >= 1000
          ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
          : value.toString();

      ctx.fillText(formattedValue, padding.left - 10, y);
    }
  };

  const drawGroupedBars = (
    ctx: CanvasRenderingContext2D,
    data: DataItem[],
    config: ReturnType<typeof getChartConfig>,
    {
      chartWidth,
      chartHeight,
      padding,
    }: { chartWidth: number; chartHeight: number; padding: any },
    rect: DOMRect,
  ) => {
    const groupWidth = chartWidth / data.length;
    const groupSpacing = groupWidth * 0.3; // Increased spacing for better visual separation
    const availableGroupWidth = groupWidth - groupSpacing;

    const maxBarWidth = 80; // Increased max width for single bars
    const finalBarWidth = Math.min(availableGroupWidth, maxBarWidth);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Clear and rebuild bar positions for hit detection
    barPositionsRef.current = [];

    data.forEach((item, index) => {
      const groupCenterX = padding.left + index * groupWidth + groupWidth / 2;
      const barX = groupCenterX - finalBarWidth / 2;

      // Store bar positions for hit detection
      barPositionsRef.current.push({
        groupIndex: index,
        centerX: groupCenterX,
        startX: barX,
        endX: barX + finalBarWidth,
      });

      // Draw shadow background for the stacked bar
      const shadowPadding = 4;
      drawGroupShadow(
        ctx,
        barX - shadowPadding,
        padding.top - shadowPadding,
        finalBarWidth + shadowPadding * 2,
        chartHeight + shadowPadding * 2,
        config.borderRadius + 2,
      );

      // Draw background bar
      drawRoundedRect(
        ctx,
        barX,
        padding.top,
        finalBarWidth,
        chartHeight,
        config.borderRadius,
        "#f5f5f5",
        "transparent",
        true,
      );

      // Calculate total height and individual segment heights
      const totalValue =
        item.paid_total + item.pending_total + item.overdue_total;

      if (totalValue > 0) {
        const totalHeight = (totalValue / config.yAxisMax) * chartHeight;

        // Stack segments from bottom to top: paid -> pending -> overdue
        const segments = [
          {
            value: item.paid_total,
            color: "rgb(0, 109, 173)",
            label: "Paid",
            gradientStops: [
              { stop: 0, color: "rgb(0, 109, 173)" },
              { stop: 0.45, color: "rgb(0, 109, 173)" },
              { stop: 0.48, color: "rgb(51, 141, 196)" },
              { stop: 0.5, color: "rgb(102, 173, 219)" },
              { stop: 0.52, color: "rgb(153, 205, 237)" },
              { stop: 0.55, color: "rgb(204, 230, 246)" },
              { stop: 1, color: "rgb(255, 255, 255)" },
            ],
          },
          {
            value: item.pending_total,
            color: "var(--light-blue)",
            label: "Pending",
            gradientStops: [
              { stop: 0, color: "rgb(56, 182, 255)" },
              { stop: 0.5, color: "rgb(128, 206, 255)" },
              { stop: 1, color: "rgb(200, 230, 255)" },
            ],
          },
          {
            value: item.overdue_total,
            color: "rgb(227, 242, 253)",
            label: "Overdue",
            gradientStops: [
              { stop: 0, color: "rgb(227, 242, 253)" },
              { stop: 0.5, color: "rgb(235, 246, 254)" },
              { stop: 1, color: "rgb(243, 250, 255)" },
            ],
          },
        ];

        let currentY = rect.height - padding.bottom;

        segments.forEach((segment, segmentIndex) => {
          if (segment.value > 0) {
            const segmentHeight =
              (segment.value / config.yAxisMax) * chartHeight;
            const segmentY = currentY - segmentHeight;

            const gradient = createGradient(
              ctx,
              barX,
              segmentY,
              segmentHeight,
              segment.gradientStops,
            );

            // Only round top corners for the top segment, bottom corners for bottom segment
            const isBottom = segmentIndex === 0;
            const isTop =
              segmentIndex === segments.length - 1 ||
              segments.slice(segmentIndex + 1).every((s) => s.value === 0);

            if (isBottom && isTop) {
              // Single segment - round all corners
              drawRoundedRect(
                ctx,
                barX,
                segmentY,
                finalBarWidth,
                segmentHeight,
                config.borderRadius,
                gradient,
                segment.color,
                true,
              );
            } else if (isBottom) {
              // Bottom segment - round bottom corners only
              drawStackedSegment(
                ctx,
                barX,
                segmentY,
                finalBarWidth,
                segmentHeight,
                config.borderRadius,
                gradient,
                segment.color,
                false,
                true,
              );
            } else if (isTop) {
              // Top segment - round top corners only
              drawStackedSegment(
                ctx,
                barX,
                segmentY,
                finalBarWidth,
                segmentHeight,
                config.borderRadius,
                gradient,
                segment.color,
                true,
                false,
              );
            } else {
              // Middle segment - no rounded corners
              ctx.fillStyle = gradient;
              ctx.fillRect(barX, segmentY, finalBarWidth, segmentHeight);
            }

            currentY = segmentY;
          }
        });
      }

      drawMonthLabel(
        ctx,
        item.month,
        groupCenterX,
        rect.height,
        padding,
        config,
      );
    });
  };

  const createGradient = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    barHeight: number,
    stops: { stop: number; color: string }[],
  ) => {
    const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
    stops.forEach(({ stop, color }) => {
      gradient.addColorStop(stop, color);
    });
    return gradient;
  };

  const drawGroupShadow = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.save();

    ctx.shadowColor = "rgba(0, 0, 0, 0.08)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fill();

    ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  };

  const drawMonthLabel = (
    ctx: CanvasRenderingContext2D,
    month: string,
    centerX: number,
    rectHeight: number,
    padding: any,
    config: ReturnType<typeof getChartConfig>,
  ) => {
    ctx.fillStyle = "#6d757e";
    ctx.font = `${config.getResponsiveFontSize(0.7)}px ${config.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const viewportWidth = window.innerWidth;
    const displayMonth = viewportWidth > 1700 ? month : month.slice(0, 3);

    ctx.fillText(displayMonth, centerX, rectHeight - padding.bottom + 10);
  };

  const drawStackedSegment = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient,
    strokeStyle: string,
    roundTop: boolean,
    roundBottom: boolean,
  ) => {
    if (height < radius * 2) {
      radius = height / 2;
    }

    ctx.beginPath();

    if (roundTop) {
      // Start with top-left corner
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    } else {
      // Start at top-right, no rounding
      ctx.moveTo(x + width, y);
    }

    if (roundBottom) {
      // Right side to bottom-right corner
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height,
      );
      // Bottom edge to bottom-left corner
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    } else {
      // Right side to bottom (no rounding)
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
    }

    if (roundTop) {
      // Left side to top-left corner
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
      // Left side to top (no rounding)
      ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.fillStyle = fillStyle;
    ctx.fill();

    if (strokeStyle !== "transparent") {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient,
    strokeStyle: string,
    forceAllCorners: boolean = false,
  ) => {
    const padding =
      ctx.canvas.getBoundingClientRect().width < 768
        ? { top: 30 }
        : { top: 40 };
    const roundAllCorners = forceAllCorners || y !== padding.top;

    if (height < radius * 2) {
      radius = height / 2;
    }

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

    if (roundAllCorners) {
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height,
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    } else {
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
    }

    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fillStyle = fillStyle;
    ctx.fill();

    if (strokeStyle !== "transparent") {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const formatValue = (value: number): string => {
    if (value >= 1000) {
      const kValue = value / 1000;
      return kValue % 1 === 0 ? `${kValue}k` : `${kValue.toFixed(1)}k`;
    }
    return Math.round(value).toString();
  };

  return (
    <div
      className={classes.container}
      ref={containerRef}
      style={{
        ...inlineStyles,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        minHeight: "200px",
        position: "relative",
      }}
    >
      {heading && <p className={classes.heading}>{heading}</p>}
      {data?.length > 0 && (
        <div
          ref={canvasContainerRef}
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            position: "relative",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: "pointer",
            }}
          />
          {tooltip && (
            <div
              style={{
                position: "fixed",
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: "translate(-50%, -100%)",
                backgroundColor: "#ffffff",
                color: "var(--black-color)",
                padding: "10px",
                borderRadius: "10px",
                fontSize: "clamp(0.625rem, 0.4716rem + 0.6818vw, 1rem)",
                fontFamily: "var(--leagueSpartan-medium-500)",
                pointerEvents: "none",
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                border: "1px solid #e0e0e0",
                minWidth: "max-content",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--leagueSpartan-semiBold-600)",
                  marginBottom: "5px",
                  fontSize: "15px",
                  color: "var(--black-color)",
                }}
              >
                {tooltip.month}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "rgb(0, 109, 173)",
                        borderRadius: "100%",
                        display: "inline-block",
                      }}
                    ></span>
                    Paid:
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatValue(tooltip.paid)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "rgb(56, 182, 255)",
                        borderRadius: "100%",
                        display: "inline-block",
                      }}
                    ></span>
                    Pending:
                  </span>
                  <span style={{ fontWeight: 600 }}>
                    {formatValue(tooltip.pending)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: "rgb(227, 242, 253)",
                        borderRadius: "100%",
                        display: "inline-block",
                        border: "1px solid #ccc",
                      }}
                    ></span>
                    Overdue:
                  </span>
                  <span
                    style={{ fontFamily: "var(--leagueSpartan-semiBold-600)" }}
                  >
                    {formatValue(tooltip.overdue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
