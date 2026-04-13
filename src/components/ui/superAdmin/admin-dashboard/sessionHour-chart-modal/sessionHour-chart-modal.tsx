import React, { useState, memo, useId, useMemo, useCallback } from "react";
import Modal from "@mui/material/Modal";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from "recharts";
import classes from "./sessionHour-chart-modal.module.css";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";

interface HourData {
  hour: string;
  count: number;
  fill: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
    payload: HourData;
  }>;
  label?: string;
}

interface SessionHourChartModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  chartData?: HourData[];
  isLoading?: boolean;
  isError?: boolean;
  dateFilter: [string, string] | null;
  onDateChange: (dates: [string, string] | null) => void; // ✅ sends back to parent
}

const SessionHourChartModal: React.FC<SessionHourChartModalProps> = ({
  modalOpen,
  handleClose,
  chartData,
  isLoading,
  isError,
  dateFilter,
  onDateChange,
}) => {
  const chartId = useId();
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  const safeChartData = useMemo(() => {
    if (!chartData || !Array.isArray(chartData)) return [];
    return chartData;
  }, [chartData]);

  const totalSessions = useMemo(() => {
    return safeChartData.reduce((acc, item) => acc + (item?.count ?? 0), 0);
  }, [safeChartData]);

  const handleModalClose = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // ✅ filterByDateProps using startDate & endDate from parent
  const filterByDateProps = useMemo(
    () => ({
      changeFn: onDateChange, // ✅ calls parent's handleDateChange
      value: dateFilter,
      inlineStyles: {
        background: "var(--main-white-color)",
      },
    }),
    [onDateChange, dateFilter],
  );

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: {
        width: "max-content",
        alignSelf: "flex-end",
        maxHeight: "35px",
        minHeight: "30px",
      },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className={classes.tooltip}>
        <div className={classes.tooltipLabel}>{label}</div>
        <div className={classes.tooltipContent}>
          <div className={classes.tooltipItem}>
            <span className={classes.tooltipName}>Sessions</span>
            <span className={classes.tooltipValue}>
              {payload[0].value} conducted
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CustomLegend = (
    <div className={classes.legendContainer}>
      <div className={classes.legendItem}>
        <span className={classes.legendLabel}>
          Total Sessions: {totalSessions}
        </span>
      </div>
      <MobileFilterButton {...mobileFilterButtonProps} />
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingBox />;
    if (isError || safeChartData.length === 0) return <ErrorBox />;

    return (
      <div className={classes.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%" id={`chart-${chartId}`}>
          <BarChart
            data={safeChartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="var(--grey-color1)"
              className={classes.grid}
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "clamp(0.625rem, 0.6rem + 0.125vw, 0.75rem)",
                fill: "var(--text-grey)",
              }}
              className={classes.axis}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "clamp(0.625rem, 0.6rem + 0.125vw, 0.75rem)",
                fill: "var(--text-grey)",
              }}
              width={30}
              allowDecimals={false}
              className={classes.axis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {safeChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (!modalOpen) return null;

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="session-hour-chart-modal-title"
      aria-describedby="session-hour-chart-modal-description"
    >
      <div className={classes.mainBox}>
        <div className={classes.headerContent}>
          <div className={classes.headerTitles}>
            <h2 className={classes.modalTitle}>Sessions by Hour</h2>
            {/* ✅ shows the active date range in subtitle */}
            <span className={classes.modalSubtitle}>
              {moment(dateFilter?.[0]).format("MMM DD, YYYY")} -{" "}
              {moment(dateFilter?.[1]).format("MMM DD, YYYY")}
            </span>
          </div>
          <button className={classes.closeButton} onClick={handleModalClose}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className={classes.mainContentBox}>
          {showFullFilters && (
            <div className={classes.filterControls}>
              <FilterByDate {...filterByDateProps} /> {/* ✅ now defined */}
            </div>
          )}
          <div className={classes.chartSection}>
            {CustomLegend}
            {renderContent()}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default memo(SessionHourChartModal);
