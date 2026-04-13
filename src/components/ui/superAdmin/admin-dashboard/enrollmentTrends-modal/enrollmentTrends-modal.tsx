import React, { useState, memo, useId, useMemo, useCallback } from "react";
import Modal from "@mui/material/Modal";
import classes from "./enrollmentTrends-modal.module.css";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import LineChartComponent from "@/components/global/charts/line-chart/line-chart";

type EnrollmentDataPoint = {
  month: string;
  numberOfEnrollmentsCreated: number;
  numberOfChurnCreated: number;
};

interface EnrollmentTrendsModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  chartData?: EnrollmentDataPoint[];
  isLoading?: boolean;
  error?: boolean;
  filterByYear: string;
  onYearChange: (year: string) => void;
}

const EnrollmentTrendsModal: React.FC<EnrollmentTrendsModalProps> = ({
  modalOpen,
  handleClose,
  chartData,
  isLoading,
  error,
  filterByYear,
  onYearChange,
}) => {
  const chartId = useId();

  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);

  const handleFilterByYear = useCallback(
    (value: string) => {
      onYearChange(value);
    },
    [onYearChange],
  );

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  const safeChartData = useMemo(() => {
    if (!chartData || !Array.isArray(chartData)) return [];
    return chartData;
  }, [chartData]);

  const chartConfig = {
    enrollments: {
      label: "New Enrollments",
      color: "var(--main-blue-color)",
    },
    churn: {
      label: "Student Churn",
      color: "var(--blue-color3)",
    },
  };

  const totals = useMemo(() => {
    if (!safeChartData.length) return { enrollments: 0, churn: 0 };
    return safeChartData.reduce(
      (acc, item) => ({
        enrollments: acc.enrollments + (item?.numberOfEnrollmentsCreated ?? 0),
        churn: acc.churn + (item?.numberOfChurnCreated ?? 0),
      }),
      { enrollments: 0, churn: 0 },
    );
  }, [safeChartData]);

  const handleModalClose = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const filterByYearProps = useMemo(
    () => ({
      placeholder: "Filter year",
      data: Array.from({ length: 2034 - 2024 + 1 }, (_, i) =>
        (2024 + i).toString(),
      ),
      handleChange: handleFilterByYear,
      value: filterByYear,
      inlineBoxStyles: {
        background: "var(--main-white-color)",
      },
    }),
    [handleFilterByYear, filterByYear],
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

  const CustomLegend = (
    <div className={classes.legendContainer}>
      <div className={classes.legendItem}>
        <div
          className={classes.legendDot}
          style={{ backgroundColor: chartConfig.enrollments.color }}
        />
        <span className={classes.legendLabel}>
          {chartConfig.enrollments.label} ({totals.enrollments})
        </span>
      </div>
      <div className={classes.legendItem}>
        <div
          className={classes.legendDot}
          style={{ backgroundColor: chartConfig.churn.color }}
        />
        <span className={classes.legendLabel}>
          {chartConfig.churn.label} ({totals.churn})
        </span>
      </div>
      <MobileFilterButton {...mobileFilterButtonProps} />
    </div>
  );

  const renderContent = () => {
    if (isLoading) return <LoadingBox />;
    if (error || safeChartData.length === 0) return <ErrorBox />;

    return (
      <div className={classes.chartWrapper}>
        <LineChartComponent
          data={safeChartData}
          chartId={chartId}
          dataKey1="numberOfEnrollmentsCreated"
          dataKey2="numberOfChurnCreated"
          strokeFillColor1={chartConfig.enrollments.color}
          strokeFillColor2={chartConfig.churn.color}
        />
      </div>
    );
  };

  if (!modalOpen) return null;

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="enrollment-trends-modal-title"
      aria-describedby="enrollment-trends-modal-description"
    >
      <div className={classes.mainBox}>
        <div className={classes.headerContent}>
          <div className={classes.headerTitles}>
            <h2 className={classes.modalTitle}>Enrollment Trends</h2>
            <span className={classes.modalSubtitle}>New students vs churn</span>
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
        <div className={classes.chartSection}>
          {showFullFilters && (
            <div className={classes.filterControls}>
              <FilterDropdown {...filterByYearProps} />
            </div>
          )}
          {CustomLegend}
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default memo(EnrollmentTrendsModal);
