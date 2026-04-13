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
} from "recharts";
import classes from "./attendance-chart-modal.module.css";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";

// ✅ Matches parent's SubjectData structure
interface SubjectData {
  name: string;
  attendance: number;
  fill: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    name: string;
    color: string;
    payload: SubjectData;
  }>;
  label?: string;
}

interface AttendanceChartModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  chartData?: SubjectData[];
  isLoading?: boolean;
  isError?: boolean;
  dateFilter: [string, string] | null; // ✅ from parent
  onDateChange: (dates: [string, string] | null) => void; // ✅ sends back to parent
}

const AttendanceChartModal: React.FC<AttendanceChartModalProps> = ({
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

  const handleModalClose = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // ✅ filterByDateProps using startDate & endDate from parent
  const filterByDateProps = useMemo(
    () => ({
      changeFn: onDateChange,
      value: dateFilter as [string, string],
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

  // ✅ Custom tooltip matching SubjectData
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
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className={classes.tooltipItem}>
              <span className={classes.tooltipName}>Attendance</span>
              <span className={classes.tooltipValue}>{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ Legend
  const CustomLegend = (
    <div className={classes.legendContainer}>
      <div className={classes.legendItem}>
        <div
          className={classes.legendDot}
          style={{ backgroundColor: "var(--main-blue-color)" }}
        />
        <span className={classes.legendLabel}>Attendance Rate</span>
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
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="var(--grey-color1)"
              className={classes.grid}
            />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular16-)",
                fill: "var(--text-grey)",
              }}
              width={125}
              tickFormatter={(value: string) =>
                value.length > 10 ? `${value.substring(0, 12)}...` : value
              }
              interval={0}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular16-)",
                fill: "var(--text-grey)",
              }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="attendance"
              fill="var(--main-blue-color)"
              radius={[2.5, 10, 10, 2.5]}
            />
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
      aria-labelledby="attendance-chart-modal-title"
      aria-describedby="attendance-chart-modal-description"
    >
      <div className={classes.mainBox}>
        <div className={classes.headerContent}>
          <div className={classes.headerTitles}>
            <h2 className={classes.modalTitle}>Attendance Rate</h2>
            {/* ✅ shows active date range */}
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
              <FilterByDate {...filterByDateProps} />
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

export default memo(AttendanceChartModal);
