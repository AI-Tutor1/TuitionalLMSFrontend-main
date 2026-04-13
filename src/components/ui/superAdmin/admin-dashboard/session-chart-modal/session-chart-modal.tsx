import React, { useState, memo, useId, useMemo, useCallback } from "react";
import Modal from "@mui/material/Modal";
import moment from "moment";
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
import classes from "./session-chart-modal.module.css";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import {
  ProcessedDayData,
  ChartConfig,
  FilterType,
  getOrdinalSuffix,
  chartConfigData,
} from "../session-chart/session-chart";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
    payload: ProcessedDayData;
  }>;
  label?: string;
  chartConfig?: ChartConfig;
}

interface SessionChartModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  chartData?: ProcessedDayData[];
  isLoading?: boolean;
  error?: Error | null;
  selectedBoards?: string[];
  selectedGrades?: string[];
  selectedCurriculums?: string[];
  selectedSubjects?: string[];
  selectedStudents?: string[];
  selectedTeachers?: string[];
  onBoardsChange?: (boards: string[]) => void;
  onGradesChange?: (grades: string[]) => void;
  onCurriculumsChange?: (curriculums: string[]) => void;
  onSubjectsChange?: (subjects: string[]) => void;
  onStudentsChange?: (students: string[]) => void;
  onTeachersChange?: (teachers: string[]) => void;
  dateFilter?: string[] | null;
  onDateFilterChange?: (dates: any) => void;
  selectedRecording?: string; // ✅ received from parent
  onRecordingChange?: (recording: string) => void; // ✅ received from parent
}

const generateDynamicYAxisTicks = (maxValue: number): number[] => {
  if (maxValue === 0) return [0, 1, 2];
  let step: number;
  let minTicks = 3;

  if (maxValue <= 5) step = 1;
  else if (maxValue <= 10) step = 2;
  else if (maxValue <= 20) step = 5;
  else if (maxValue <= 50) step = 10;
  else if (maxValue <= 100) step = 20;
  else if (maxValue <= 500) step = 50;
  else if (maxValue <= 1000) step = 100;
  else if (maxValue <= 5000) step = 500;
  else if (maxValue <= 10000) step = 1000;
  else step = Math.ceil(maxValue / 10 / 1000) * 1000;

  const ticks: number[] = [];
  let currentTick = 0;
  while (currentTick <= maxValue || ticks.length < minTicks) {
    ticks.push(currentTick);
    currentTick += step;
  }
  return ticks;
};

const calculateDynamicYAxisMax = (
  data: ProcessedDayData[],
  activeFilter: FilterType,
): number => {
  if (!data || data.length === 0) return 2;
  let maxValue = 0;

  data.forEach((day) => {
    let dayMax = 0;
    if (activeFilter === null) {
      dayMax = Math.max(
        day.conducted,
        day.noShow,
        day.teacherAbsent,
        day.studentAbsent,
      );
    } else {
      dayMax = day[activeFilter] || 0;
    }
    if (dayMax > maxValue) maxValue = dayMax;
  });

  if (maxValue === 0) return 2;
  if (maxValue <= 5) return maxValue + 1;
  if (maxValue <= 10) return Math.ceil(maxValue / 2) * 2;
  else if (maxValue <= 20) return Math.ceil(maxValue / 5) * 5;
  else if (maxValue <= 50) return Math.ceil(maxValue / 10) * 10;
  else if (maxValue <= 100) return Math.ceil(maxValue / 20) * 20;
  else if (maxValue <= 500) return Math.ceil(maxValue / 50) * 50;
  else if (maxValue <= 1000) return Math.ceil(maxValue / 100) * 100;
  else if (maxValue <= 5000) return Math.ceil(maxValue / 500) * 500;
  else if (maxValue <= 10000) return Math.ceil(maxValue / 1000) * 1000;
  else {
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    return Math.ceil(maxValue / magnitude) * magnitude;
  }
};

const SessionChartModal: React.FC<SessionChartModalProps> = ({
  modalOpen,
  handleClose,
  chartData,
  isLoading,
  error,
  selectedBoards = [],
  selectedGrades = [],
  selectedCurriculums = [],
  selectedSubjects = [],
  selectedStudents = [],
  selectedTeachers = [],
  onBoardsChange,
  onGradesChange,
  onCurriculumsChange,
  onSubjectsChange,
  onStudentsChange,
  onTeachersChange,
  dateFilter,
  onDateFilterChange,
  selectedRecording = "", // ✅ from parent
  onRecordingChange, // ✅ from parent
}) => {
  const chartId = useId();
  const {
    subject: subjects,
    board: boards,
    grades,
    curriculum: curriculums,
  } = useAppSelector((state) => state?.resources);
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);

  const adminFilteredStudents = useMemo(
    () => students?.users || [],
    [students?.users],
  );
  const adminFilteredTeachers = useMemo(
    () => teachers?.users || [],
    [teachers?.users],
  );

  const chartConfig = chartConfigData;

  const currentMonthName = useMemo(() => {
    if (dateFilter && Array.isArray(dateFilter) && dateFilter.length === 2) {
      const startDate = moment(dateFilter[0]);
      const endDate = moment(dateFilter[1]);

      const isFullMonth =
        startDate.date() === 1 &&
        endDate.date() === endDate.daysInMonth() &&
        startDate.isSame(endDate, "month") &&
        startDate.isSame(endDate, "year");

      if (isFullMonth) return startDate.format("MMMM YYYY");
      if (
        startDate.isSame(endDate, "month") &&
        startDate.isSame(endDate, "year")
      ) {
        return `${startDate.format("Do MMM YYYY")} - ${endDate.format(
          "Do MMM YYYY",
        )}`;
      }
      if (startDate.isSame(endDate, "year")) {
        return `${startDate.format("Do MMM YYYY")} - ${endDate.format(
          "Do MMM YYYY",
        )}`;
      }
      return `${startDate.format("Do MMM YYYY")} - ${endDate.format(
        "Do MMM YYYY",
      )}`;
    }
    return moment().format("MMMM YYYY");
  }, [dateFilter]);

  const safeChartData = useMemo(() => {
    if (!chartData || !Array.isArray(chartData)) return [];
    console.log(chartData);
    return chartData;
  }, [chartData]);

  const yAxisMax = useMemo(
    () => calculateDynamicYAxisMax(safeChartData, activeFilter),
    [safeChartData, activeFilter],
  );

  const yAxisTicks = useMemo(
    () => generateDynamicYAxisTicks(yAxisMax),
    [yAxisMax],
  );

  const totals = useMemo(() => {
    const defaultTotals = {
      totalSessions: 0,
      conducted: 0,
      noShow: 0,
      teacherAbsent: 0,
      studentAbsent: 0,
    };
    if (!safeChartData.length) return defaultTotals;
    return safeChartData.reduce(
      (acc, item) => ({
        totalSessions: acc.totalSessions + (item?.totalSessions ?? 0),
        conducted: acc.conducted + (item?.conducted ?? 0),
        noShow: acc.noShow + (item?.noShow ?? 0),
        teacherAbsent: acc.teacherAbsent + (item?.teacherAbsent ?? 0),
        studentAbsent: acc.studentAbsent + (item?.studentAbsent ?? 0),
      }),
      defaultTotals,
    );
  }, [safeChartData]);

  const xAxisTicks = useMemo(() => {
    const daysInRange = safeChartData.length || 31;
    if (daysInRange <= 7) {
      return safeChartData.map((d) => d.day);
    } else if (daysInRange <= 14) {
      return safeChartData
        .filter((_, index) => index % 2 === 0)
        .map((d) => d.day);
    } else {
      const ticks = [1, 5, 10, 15, 20, 25];
      if (daysInRange >= 30) ticks.push(30);
      if (daysInRange === 31) ticks.push(31);
      return ticks.filter((tick) => tick <= daysInRange);
    }
  }, [safeChartData]);

  const formatXAxis = useCallback((day: number) => getOrdinalSuffix(day), []);

  const handleFilterToggle = useCallback((filterKey: FilterType) => {
    setActiveFilter((prevFilter) =>
      prevFilter === filterKey ? null : filterKey,
    );
  }, []);

  const showArea = useCallback(
    (key: string) => {
      if (activeFilter === null) return true;
      return activeFilter === key;
    },
    [activeFilter],
  );

  const handleCalendar = useCallback(
    (dates: any) => {
      onDateFilterChange?.(dates);
    },
    [onDateFilterChange],
  );

  const handleBoardFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      onBoardsChange?.(selectedIds);
    },
    [onBoardsChange],
  );

  const handleGradeFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      onGradesChange?.(selectedIds);
    },
    [onGradesChange],
  );

  const handleCurriculumFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      onCurriculumsChange?.(selectedIds);
    },
    [onCurriculumsChange],
  );

  const handleSubjectFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      onSubjectsChange?.(selectedIds);
    },
    [onSubjectsChange],
  );

  const handleStudentFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      onStudentsChange?.(selectedIds);
    },
    [onStudentsChange],
  );

  const handleTeacherFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      onTeachersChange?.(selectedIds);
    },
    [onTeachersChange],
  );

  const handleRecordingFilter = useCallback(
    (value: string) => {
      onRecordingChange?.(value); // ✅ calls parent handler
    },
    [onRecordingChange],
  );

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveFilter(null);
    handleClose();
  }, [handleClose]);

  const dropDownStyles = useMemo(
    () => ({
      minWidth: "280px",
      background: "var(--main-white-color)",
    }),
    [],
  );

  const filterByDateProps = useMemo(
    () => ({
      changeFn: handleCalendar,
      value: dateFilter,
      inlineStyles: dropDownStyles,
      background: "var(--main-white-color)",
    }),
    [handleCalendar, dateFilter, dropDownStyles],
  );

  const multiSelectBoardProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: dropDownStyles,
      placeholder: "Filter board",
      data: boards || [],
      handleChange: handleBoardFilter,
      value:
        boards?.filter((board) => selectedBoards.includes(String(board.id))) ||
        [],
    }),
    [boards, handleBoardFilter, selectedBoards, dropDownStyles],
  );

  const multiSelectGradeProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: dropDownStyles,
      placeholder: "Filter grade",
      data: grades || [],
      handleChange: handleGradeFilter,
      value:
        grades?.filter((grade) => selectedGrades.includes(String(grade.id))) ||
        [],
    }),
    [grades, handleGradeFilter, selectedGrades, dropDownStyles],
  );

  const multiSelectCurriculumProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: dropDownStyles,
      placeholder: "Filter curriculum",
      data: curriculums || [],
      handleChange: handleCurriculumFilter,
      value:
        curriculums?.filter((curriculum) =>
          selectedCurriculums.includes(String(curriculum.id)),
        ) || [],
    }),
    [curriculums, handleCurriculumFilter, selectedCurriculums, dropDownStyles],
  );

  const multiSelectSubjectProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: dropDownStyles,
      placeholder: "Filter subject",
      data: subjects || [],
      handleChange: handleSubjectFilter,
      value:
        subjects?.filter((subject) =>
          selectedSubjects.includes(String(subject.id)),
        ) || [],
    }),
    [subjects, handleSubjectFilter, selectedSubjects, dropDownStyles],
  );

  const multiSelectStudentProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: dropDownStyles,
      placeholder: "Filter student",
      data: adminFilteredStudents || [],
      handleChange: handleStudentFilter,
      value:
        adminFilteredStudents?.filter((student) =>
          selectedStudents.includes(String(student.id)),
        ) || [],
    }),
    [
      adminFilteredStudents,
      handleStudentFilter,
      selectedStudents,
      dropDownStyles,
    ],
  );

  const multiSelectTeacherProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: dropDownStyles,
      placeholder: "Filter teacher",
      data: adminFilteredTeachers || [],
      handleChange: handleTeacherFilter,
      value:
        adminFilteredTeachers?.filter((teacher) =>
          selectedTeachers.includes(String(teacher.id)),
        ) || [],
    }),
    [
      adminFilteredTeachers,
      handleTeacherFilter,
      selectedTeachers,
      dropDownStyles,
    ],
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

  const recordingFilterDropdownProps = useMemo(
    () => ({
      inlineBoxStyles: dropDownStyles,
      placeholder: "Recording",
      data: ["Available", "Not Available"],
      handleChange: handleRecordingFilter,
      value: selectedRecording, // ✅ controlled by parent
    }),
    [handleRecordingFilter, selectedRecording, dropDownStyles],
  ); // ✅ added dropDownStyles dependency

  const CustomTooltip: React.FC<CustomTooltipProps> = useCallback(
    ({ active, payload }) => {
      if (!active || !payload?.length) return null;
      const dataPoint = payload[0]?.payload;
      if (!dataPoint) return null;
      const formattedDate = moment(dataPoint.date).format("ddd, MMM D");

      return (
        <div className={classes.tooltip}>
          <div className={classes.tooltipLabel}>{formattedDate}</div>
          <div className={classes.tooltipContent}>
            <div className={classes.tooltipItem}>
              <span className={classes.tooltipName}>Total Sessions</span>
              <span className={classes.tooltipValue}>
                {dataPoint.totalSessions ?? 0}
              </span>
            </div>
            {payload.map((item, index) => (
              <div key={index} className={classes.tooltipItem}>
                <div
                  className={classes.tooltipIndicator}
                  style={{ backgroundColor: item.color }}
                />
                <span className={classes.tooltipName}>
                  {chartConfig[item.dataKey]?.label || item.name}
                </span>
                <span className={classes.tooltipValue}>{item.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
    [chartConfig],
  );

  const CustomLegend = useMemo(() => {
    if (!chartConfig || !Object.keys(chartConfig).length) return null;

    return (
      <div className={classes.legendContainer}>
        <div className={classes.legendItem}>
          <span className={classes.legendLabel}>
            Total: {totals.totalSessions}
          </span>
        </div>
        {Object.entries(chartConfig).map(([key, config]) => {
          const filterKey = key as FilterType;
          const totalKey = key as keyof typeof totals;
          const isChecked = activeFilter === filterKey;

          return (
            <label key={key} className={classes.legendCheckboxItem}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleFilterToggle(filterKey)}
                className={classes.legendCheckbox}
              />
              <span
                className={classes.customCheckbox}
                style={{
                  backgroundColor: isChecked ? config.color : "transparent",
                  borderColor: config.color,
                }}
              >
                {isChecked && (
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke={config.textColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span
                className={classes.legendLabel}
                style={{
                  opacity: isChecked || activeFilter === null ? 1 : 0.5,
                }}
              >
                {config.label} ({totals[totalKey]})
              </span>
            </label>
          );
        })}
        <MobileFilterButton {...mobileFilterButtonProps} />
      </div>
    );
  }, [
    chartConfig,
    totals,
    activeFilter,
    handleFilterToggle,
    mobileFilterButtonProps,
  ]);

  const renderContent = () => {
    if (isLoading) return <LoadingBox />;
    console.log("safeChartData.length === 0", safeChartData.length === 0);
    if (safeChartData.length === 0) {
      return <ErrorBox />;
    }

    return (
      <div className={classes.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={safeChartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              {Object.entries(chartConfig).map(([key, config]) => (
                <linearGradient
                  key={key}
                  id={`gradient-modal-${key}-${chartId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={config.color}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={config.color}
                    stopOpacity={0.05}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--main-white-color)"
              className={classes.grid}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              ticks={xAxisTicks}
              tickFormatter={formatXAxis}
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
              width={40}
              allowDecimals={false}
              domain={[0, yAxisMax]}
              ticks={yAxisTicks}
              type="number"
              className={classes.axis}
            />
            <Tooltip
              content={<CustomTooltip chartConfig={chartConfig} />}
              cursor={{
                stroke: "var(--text-grey)",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
            />
            {showArea("conducted") && chartConfig.conducted && (
              <Area
                type="monotone"
                dataKey="conducted"
                stroke={chartConfig.conducted.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-modal-conducted-${chartId})`}
                style={{ cursor: "pointer" }}
              />
            )}
            {showArea("noShow") && chartConfig.noShow && (
              <Area
                type="monotone"
                dataKey="noShow"
                stroke={chartConfig.noShow.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-modal-noShow-${chartId})`}
                style={{ cursor: "pointer" }}
              />
            )}
            {showArea("teacherAbsent") && chartConfig.teacherAbsent && (
              <Area
                type="monotone"
                dataKey="teacherAbsent"
                stroke={chartConfig.teacherAbsent.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-modal-teacherAbsent-${chartId})`}
                style={{ cursor: "pointer" }}
              />
            )}
            {showArea("studentAbsent") && chartConfig.studentAbsent && (
              <Area
                type="monotone"
                dataKey="studentAbsent"
                stroke={chartConfig.studentAbsent.color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#gradient-modal-studentAbsent-${chartId})`}
                style={{ cursor: "pointer" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (!modalOpen) return null;

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="session-chart-modal-title"
      aria-describedby="session-chart-modal-description"
    >
      <div className={classes.mainBox}>
        <div className={classes.headerContent}>
          <div className={classes.headerTitles}>
            <h2 className={classes.modalTitle}>Sessions Booked</h2>
            <span className={classes.modalSubtitle}>{currentMonthName}</span>
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
              {onDateFilterChange && <FilterByDate {...filterByDateProps} />}
              {onStudentsChange && (
                <MultiSelectDropDown {...multiSelectStudentProps} />
              )}
              {onTeachersChange && (
                <MultiSelectDropDown {...multiSelectTeacherProps} />
              )}
              {onSubjectsChange && (
                <MultiSelectDropDown {...multiSelectSubjectProps} />
              )}
              {onBoardsChange && (
                <MultiSelectDropDown {...multiSelectBoardProps} />
              )}
              {onGradesChange && (
                <MultiSelectDropDown {...multiSelectGradeProps} />
              )}
              {onCurriculumsChange && (
                <MultiSelectDropDown {...multiSelectCurriculumProps} />
              )}
              <FilterDropdown {...recordingFilterDropdownProps} />
            </div>
          )}
          {CustomLegend}
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default memo(SessionChartModal);
