import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import classes from "./dashboard-statsCard.module.css";
import LoadingBox from "@/components/global/loading-box/loading-box";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon?: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
  description?: string;
  iconClassName?: string;
  valueClassName?: string;
  variant?: string;
  compact?: boolean;
  loading?: boolean; // New loading prop
  inlineStyles?: React.CSSProperties;
  inlineLoaderStyles?: React.CSSProperties;
};

const AdminDashboardStatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
  description,
  iconClassName,
  valueClassName,
  variant = "default",
  compact = false,
  loading = false, // Default loading to false
  inlineStyles,
  inlineLoaderStyles,
}: StatsCardProps) => {
  // Combine CSS classes based on props

  // If loading, show a skeleton loader

  return (
    <div className={classes.statsCard} style={{ ...inlineStyles }}>
      <div className={classes.titleContainer}>
        <p className={classes.statsLabel}>{title}</p>
        {Icon && (
          <div className={classes.iconContainer}>
            <Icon
              style={{
                height: "var(--regular18-)",
                width: "var(--regular18-)",
                color: "var(--main-blue-color)",
              }}
            />
          </div>
        )}
      </div>
      {loading ? (
        <LoadingBox
          inlineStyling={{
            justifyContent: "flex-start",
          }}
          loaderStyling={{
            height: "var(--regular16-) !important",
            width: "var(--regular16-) !important",
          }}
        />
      ) : (
        <p className={classes.valueDefault}>{value || "-"}</p>
      )}

      {loading ? (
        <LoadingBox
          inlineStyling={{
            justifyContent: "flex-start",
          }}
          loaderStyling={{
            height: "var(--regular16-) !important",
            width: "var(--regular16-) !important",
          }}
        />
      ) : (
        trend && (
          <div
            className={`${classes.trend} ${
              trend.isPositive ? classes.trendPositive : classes.trendNegative
            }`}
          >
            {trend.isPositive ? (
              <ArrowUp
                size={16}
                color="#22c55e" // Tailwind's emerald-500, a visually attractive green
                style={{ marginBottom: "6px" }}
              />
            ) : (
              <ArrowDown
                size={16}
                color="#ef4444" // Tailwind's red-500
                style={{ marginBottom: "4px" }}
              />
            )}
            <span>
              {trend.value}% {trend.label || "No Show"}
            </span>
          </div>
        )
      )}

      {description && (
        <p className={classes.description}>{description || "No Show"}</p>
      )}
    </div>
  );
};

export default React.memo(AdminDashboardStatsCard);
