"use client";
import classes from "./stacked-bar-chart.module.css";
import { useEffect, useRef, CSSProperties, useState, useCallback } from "react";

interface DataItem {
  month: string;
  month_number: number;
  paid_total: number;
  pending_total: number;
  overdue_total: number;
}

interface StackedBarChartProps {
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
  total: number;
}

interface BarPosition {
  groupIndex: number;
  centerX: number;
  startX: number;
  endX: number;
  y: number;
  height: number;
}

export default function StackedBarChart({
  data,
  inlineStyles,
  heading,
}: StackedBarChartProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [minHeight, setMinHeight] = useState("60px");
  const barPositionsRef = useRef<BarPosition[]>([]);

  // Handle resize
  const updateDimensions = useCallback(() => {
    if (canvasContainerRef.current) {
      const { width, height } =
        canvasContainerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }

    // Update minimum height based on screen width breakpoints
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1440) {
      setMinHeight("100px");
    } else if (screenWidth >= 1280) {
      setMinHeight("80px");
    } else if (screenWidth >= 768) {
      setMinHeight("60px");
    } else if (screenWidth >= 576) {
      setMinHeight("50px");
    } else {
      setMinHeight("40px");
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

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || barPositionsRef.current.length === 0) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const viewportWidth = window.innerWidth;
      const padding = {
        top: viewportWidth < 768 ? 10 : 15,
        bottom: viewportWidth < 768 ? 35 : 35,
      };

      let foundBar = false;

      for (const pos of barPositionsRef.current) {
        if (
          x >= pos.startX &&
          x <= pos.endX &&
          y >= pos.y &&
          y <= pos.y + pos.height
        ) {
          foundBar = true;
          const item = data[pos.groupIndex];

          setTooltip({
            x: rect.left + pos.centerX,
            y: rect.top + pos.y - 10,
            month: item.month,
            paid: item.paid_total,
            pending: item.pending_total,
            overdue: item.overdue_total,
            total: item.paid_total + item.pending_total + item.overdue_total,
          });
          break;
        }
      }

      if (!foundBar) {
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
    drawStackedBars(ctx, data, config, chartDimensions, rect);
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

    // Calculate responsive left padding
    let leftPadding = 60; // Default for large screens
    if (viewportWidth < 768) {
      leftPadding = 40; // Mobile
    } else if (viewportWidth < 1024) {
      leftPadding = 45; // Small tablets
    } else if (viewportWidth < 1440) {
      leftPadding = 50; // Laptops
    }

    const basePadding = {
      top: viewportWidth < 768 ? 10 : 15,
      right: viewportWidth < 768 ? 5 : 5,
      bottom: viewportWidth < 768 ? 35 : 35,
      left: leftPadding,
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

    // Calculate max value based on total stacked values
    const maxValue = Math.max(
      ...data.map(
        (item) => item.paid_total + item.pending_total + item.overdue_total,
      ),
      100,
    );

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

    // First pass: find maximum text width
    let maxTextWidth = 0;
    for (let i = 0; i <= config.yAxisSteps; i++) {
      if (
        availableHeight < minLabelSpacing &&
        i % 2 === 1 &&
        i !== config.yAxisSteps
      ) {
        continue;
      }

      const value = config.yAxisStepSize * i;
      const formattedValue =
        value >= 1000
          ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
          : value.toString();

      const textMetrics = ctx.measureText(formattedValue);
      maxTextWidth = Math.max(maxTextWidth, textMetrics.width);
    }

    // Second pass: draw boxes and labels with consistent width
    const textHeight = config.getResponsiveFontSize(0.75);
    const boxPadding = 4;
    const boxWidth = maxTextWidth + boxPadding * 2;
    const boxHeight = textHeight + boxPadding * 2;

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

      const boxX = padding.left - 10 - maxTextWidth - boxPadding;
      const boxY = y - textHeight / 2 - boxPadding;

      // Draw box without border
      ctx.fillStyle = "transparent";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

      // Draw text
      ctx.fillStyle = "#6d757e";
      ctx.fillText(formattedValue, padding.left - 10, y);
    }
  };

  const drawStackedBars = (
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
    const barWidth = chartWidth / data.length;
    const barSpacing = barWidth * 0.15; // Minimal spacing between bars
    const maxBarWidth = window.innerWidth < 1440 ? 70 : 90; // Adaptive max width
    const actualBarWidth = Math.min(barWidth - barSpacing, maxBarWidth);

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Clear bar positions
    barPositionsRef.current = [];

    data.forEach((item, index) => {
      const centerX = padding.left + index * barWidth + barWidth / 2;
      const barX = centerX - actualBarWidth / 2;

      // Always draw background bar (no shadow/outline)
      const backgroundY = padding.top;
      const backgroundHeight = chartHeight;

      // Draw simple background bar without shadow
      drawRoundedRect(
        ctx,
        barX,
        backgroundY,
        actualBarWidth,
        backgroundHeight,
        config.borderRadius,
        "#f8f8f8ff",
      );

      // Calculate total value
      const totalValue =
        item.paid_total + item.pending_total + item.overdue_total;

      if (totalValue > 0) {
        const totalHeight = (totalValue / config.yAxisMax) * chartHeight;
        const barY = rect.height - padding.bottom - totalHeight;

        // Store bar position for hit detection
        barPositionsRef.current.push({
          groupIndex: index,
          centerX: centerX,
          startX: barX,
          endX: barX + actualBarWidth,
          y: barY,
          height: totalHeight,
        });

        // Define segments (bottom to top: paid, pending, overdue)
        const segments = [
          {
            value: item.paid_total,
            color: "rgb(0, 109, 173)",
            gradientColors: [
              "rgb(0, 109, 173)",
              "rgb(51, 141, 196)",
              "rgb(102, 173, 219)",
            ],
          },
          {
            value: item.pending_total,
            color: "rgb(56, 182, 255)",
            gradientColors: [
              "rgb(56, 182, 255)",
              "rgb(128, 206, 255)",
              "rgb(200, 230, 255)",
            ],
          },
          {
            value: item.overdue_total,
            color: "rgb(227, 242, 253)",
            gradientColors: [
              "rgb(227, 242, 253)",
              "rgb(235, 246, 254)",
              "rgb(243, 250, 255)",
            ],
          },
        ];

        let currentY = barY + totalHeight;

        segments.forEach((segment, segmentIndex) => {
          if (segment.value > 0) {
            const segmentHeight =
              (segment.value / config.yAxisMax) * chartHeight;
            const segmentY = currentY - segmentHeight;

            // Create gradient
            const gradient = ctx.createLinearGradient(
              barX,
              segmentY,
              barX,
              segmentY + segmentHeight,
            );
            gradient.addColorStop(0, segment.gradientColors[0]);
            gradient.addColorStop(0.5, segment.gradientColors[1]);
            gradient.addColorStop(1, segment.gradientColors[2]);

            // Determine which corners to round
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
                actualBarWidth,
                segmentHeight,
                config.borderRadius,
                gradient,
              );
            } else if (isBottom) {
              // Bottom segment - round bottom corners only
              drawRoundedRectPartial(
                ctx,
                barX,
                segmentY,
                actualBarWidth,
                segmentHeight,
                config.borderRadius,
                gradient,
                false,
                true,
              );
            } else if (isTop) {
              // Top segment - round top corners only
              drawRoundedRectPartial(
                ctx,
                barX,
                segmentY,
                actualBarWidth,
                segmentHeight,
                config.borderRadius,
                gradient,
                true,
                false,
              );
            } else {
              // Middle segment - no rounded corners
              ctx.fillStyle = gradient;
              ctx.fillRect(barX, segmentY, actualBarWidth, segmentHeight);
            }

            currentY = segmentY;
          }
        });
      }

      // Draw month label
      drawMonthLabel(ctx, item.month, centerX, rect.height, padding, config);
    });
  };

  const drawShadow = (
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

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient,
  ) => {
    if (height < radius * 2) {
      radius = height / 2;
    }

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

    ctx.fillStyle = fillStyle;
    ctx.fill();
  };

  const drawRoundedRectPartial = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient,
    roundTop: boolean,
    roundBottom: boolean,
  ) => {
    if (height < radius * 2) {
      radius = height / 2;
    }

    ctx.beginPath();

    if (roundTop) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    } else {
      ctx.moveTo(x + width, y);
    }

    if (roundBottom) {
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

    if (roundTop) {
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
      ctx.lineTo(x, y);
    }

    ctx.closePath();

    ctx.fillStyle = fillStyle;
    ctx.fill();
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
        minHeight: minHeight,
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
                backgroundColor: "var(--main-white-color)",
                color: "var(--black-color)",
                padding: "10px",
                borderRadius: "10px",
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular18-)",
                lineHeight: "var(--regular18-)",
                pointerEvents: "none",
                zIndex: 1000,
                boxShadow: "var(--main-box-shadow)",
                border: "1px solid var(--color-dashboard-border)",
                minWidth: "max-content",
              }}
            >
              <div
                style={{
                  marginBottom: "5px",
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
                    gap: "20px",
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
                  <span>{formatValue(tooltip.paid)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
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
                  <span>{formatValue(tooltip.pending)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
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
                  <span>{formatValue(tooltip.overdue)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    marginTop: "5px",
                    paddingTop: "5px",
                    borderTop: "1px solid var(--color-dashboard-border)",
                  }}
                >
                  <span>Total:</span>
                  <span
                    style={{
                      fontFamily: "var(--leagueSpartan-medium-500)",
                    }}
                  >
                    {formatValue(tooltip.total)}
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
