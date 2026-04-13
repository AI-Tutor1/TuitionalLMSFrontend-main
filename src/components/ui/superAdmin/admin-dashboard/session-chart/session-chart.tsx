import React, { useCallback, useId, useMemo, useState } from "react";
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
import classes from "./session-chart.module.css";
import ChartContainer from "../chartContainer/chartContainer";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { getSessionsGroupedByDate } from "@/services/dashboard/superAdmin/sessions/sessions";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import SessionChartModal from "../session-chart-modal/session-chart-modal";

// Define types for new API session data structure
export type ApiSessionData = {
  date: string;
  conducted: number;
  noShow: number;
  cancelled: number;
  TeacherAbsent: number;
  StudentAbsent: number;
};

// Define types for processed chart data
export type ProcessedDayData = {
  date: string;
  day: number;
  totalSessions: number;
  conducted: number;
  noShow: number;
  teacherAbsent: number;
  studentAbsent: number;
};

// Define chart configuration type
export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
    conclusionType: string;
    textColor: string;
  };
};

// Define filter type - null means no filter (show all)
export type FilterType =
  | "conducted"
  | "noShow"
  | "teacherAbsent"
  | "studentAbsent"
  | null;

// Define tooltip props type
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
  chartConfig: ChartConfig;
}

interface SessionsChartProps {
  inLineStyles?: React.CSSProperties;
  teachers?: Array<{ id: number; name: string }>;
  students?: Array<{ id: number; name: string }>;
}

// Function to get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
export const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// Function to process the new API response structure and format for chart
export const processSessionData = (
  sessions: ApiSessionData[] | null | undefined,
  dateFilter?: string[] | null,
): ProcessedDayData[] => {
  // Determine the date range
  let startDate: moment.Moment;
  let endDate: moment.Moment;

  if (dateFilter && Array.isArray(dateFilter) && dateFilter.length === 2) {
    // Custom date range
    startDate = moment(dateFilter[0]).startOf("day");
    endDate = moment(dateFilter[1]).endOf("day");
  } else {
    // Default to current month
    startDate = moment().startOf("month");
    endDate = moment().endOf("month");
  }

  // Create a map from API data for quick lookup
  const apiDataMap: { [key: string]: ApiSessionData } = {};
  if (Array.isArray(sessions) && sessions.length > 0) {
    sessions.forEach((session) => {
      if (session.date) {
        apiDataMap[session.date] = session;
      }
    });
  }

  const result: ProcessedDayData[] = [];

  // Generate data points for the actual date range
  let currentDate = startDate.clone();
  let dayCounter = 1;

  while (currentDate.isSameOrBefore(endDate, "day")) {
    const dateString = currentDate.format("YYYY-MM-DD");
    const apiData = apiDataMap[dateString];

    if (apiData) {
      // Map API data to chart format (handle different casing)
      const conducted = apiData.conducted || 0;
      const noShow = (apiData.noShow || 0) + (apiData.cancelled || 0); // Combine noShow and cancelled
      const teacherAbsent = apiData.TeacherAbsent || 0;
      const studentAbsent = apiData.StudentAbsent || 0;

      result.push({
        date: dateString,
        day: dayCounter,
        totalSessions: conducted + noShow + teacherAbsent + studentAbsent,
        conducted,
        noShow,
        teacherAbsent,
        studentAbsent,
      });
    } else {
      // No data for this date, add empty entry
      result.push({
        date: dateString,
        day: dayCounter,
        totalSessions: 0,
        conducted: 0,
        noShow: 0,
        teacherAbsent: 0,
        studentAbsent: 0,
      });
    }

    currentDate.add(1, "day");
    dayCounter++;
  }

  return result;
};

// Function to calculate nice max value for Y-axis (rounded to nearest 10)
export const calculateYAxisMax = (data: ProcessedDayData[]): number => {
  if (!data || data.length === 0) return 10;

  let maxValue = 0;

  data.forEach((day) => {
    // Show all types, find max among all
    const dayMax = Math.max(
      day.conducted,
      day.noShow,
      day.teacherAbsent,
      day.studentAbsent,
    );

    if (dayMax > maxValue) {
      maxValue = dayMax;
    }
  });

  if (maxValue === 0) return 10;

  // Round up to nearest 10
  return Math.ceil(maxValue / 10) * 10;
};

// Function to generate Y-axis ticks with step of 10
export const generateYAxisTicks = (maxValue: number): number[] => {
  if (maxValue <= 0) return [0, 10];

  const ticks: number[] = [];
  for (let i = 0; i <= maxValue; i += 10) {
    ticks.push(i);
  }

  return ticks;
};

// Exported chart config data for use in other components
export const chartConfigData: ChartConfig = {
  conducted: {
    label: "Conducted",
    color: "var(--green-background-color4)",
    textColor: "var(--green-text-color4)",
    conclusionType: "Conducted",
  },
  noShow: {
    label: "No Show",
    color: "var(--orange-background-color1)",
    conclusionType: "Cancelled",
    textColor: "var(--orange-text-color1)",
  },
  teacherAbsent: {
    label: "Teacher Absent",
    color: "var(--purple-background-color1)",
    conclusionType: "Teacher Absent",
    textColor: "var(--purple-text-color1)",
  },
  studentAbsent: {
    label: "Student Absent",
    color: "var(--blue-background-color1)",
    conclusionType: "Student Absent",
    textColor: "var(--blue-text-color1)",
  },
};

export default function SessionsChart({
  inLineStyles,
}: SessionsChartProps): JSX.Element {
  const chartId = useId();
  const { token } = useAppSelector((state) => state?.user);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // Filter states (no activeFilter - handled in modal)
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedCurriculums, setSelectedCurriculums] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string[] | null>([
    moment().startOf("month").toISOString(),
    moment().endOf("month").add(1, "days").toISOString(),
  ]);
  const [selectedRecording, setSelectedRecording] = useState<string>(""); // ✅ lifted from modal

  const chartConfig = useMemo(() => chartConfigData, []);

  const handleModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setDateFilter([
      moment().startOf("month").toISOString(),
      moment().endOf("month").add(1, "days").toISOString(),
    ]);
    setModalOpen(false);
    setSelectedBoards([]);
    setSelectedGrades([]);
    setSelectedCurriculums([]);
    setSelectedSubjects([]);
    setSelectedStudents([]);
    setSelectedTeachers([]);
    setSelectedRecording("");
  }, []);

  // Callbacks for multi-select filters
  const handleBoardsChange = useCallback((boards: string[]) => {
    setSelectedBoards(boards);
  }, []);

  const handleGradesChange = useCallback((grades: string[]) => {
    setSelectedGrades(grades);
  }, []);

  const handleCurriculumsChange = useCallback((curriculums: string[]) => {
    setSelectedCurriculums(curriculums);
  }, []);

  const handleSubjectsChange = useCallback((subjects: string[]) => {
    setSelectedSubjects(subjects);
  }, []);

  const handleStudentsChange = useCallback((students: string[]) => {
    setSelectedStudents(students);
  }, []);

  const handleTeachersChange = useCallback((teachers: string[]) => {
    setSelectedTeachers(teachers);
  }, []);

  const handleDateFilterChange = useCallback((value: any) => {
    if (value === null) {
      setDateFilter(null);
    } else if (Array.isArray(value)) {
      setDateFilter(
        value.map((i: any) => moment(i).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
      );
    }
  }, []);

  const handleRecordingChange = useCallback((recording: string) => {
    setSelectedRecording(recording);
  }, []);

  // Build API params
  const apiParams = useMemo(() => {
    const params: any = {
      page: String(1),
      limit: String(1800),
    };
    // Add date filters
    if (dateFilter && Array.isArray(dateFilter) && dateFilter.length === 2) {
      params.start_time = dateFilter[0];
      params.end_time = moment(dateFilter[1]).add(1, "days").toISOString();
    } else {
      params.start_time = moment().startOf("month").toISOString();
      params.end_time = moment().endOf("month").add(1, "days").toISOString();
    }

    // Add board filter
    if (selectedBoards.length > 0) {
      params.board_id = selectedBoards.join(",");
    }

    // Add grade filter
    if (selectedGrades.length > 0) {
      params.grade_id = selectedGrades.join(",");
    }

    // Add curriculum filter
    if (selectedCurriculums.length > 0) {
      params.curriculum_id = selectedCurriculums.join(",");
    }

    // Add subject filter
    if (selectedSubjects.length > 0) {
      params.subject_id = selectedSubjects.join(",");
    }

    // Add student filter
    if (selectedStudents.length > 0) {
      params.student_ids = selectedStudents.join(",");
    }

    // Add teacher filter
    if (selectedTeachers.length > 0) {
      params.tutor_id = selectedTeachers.join(",");
    }
    // ✅ Add recording filter
    if (selectedRecording) {
      params.include_recording =
        selectedRecording === "Available"
          ? "true"
          : selectedRecording === "Not Available"
            ? "false"
            : "";
    }

    return params;
  }, [
    selectedBoards,
    selectedGrades,
    selectedCurriculums,
    selectedSubjects,
    selectedStudents,
    selectedTeachers,
    dateFilter,
    selectedRecording,
  ]);

  // Fetch sessions with filters applied
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ["sessionsGroupedByDate", apiParams],
    queryFn: () => getSessionsGroupedByDate({ token }, apiParams),
    enabled: Boolean(token),
    refetchOnWindowFocus: false,
  });

  // Process the session data with date filter
  const chartData = useMemo(() => {
    if (!sessionsData?.data || sessionsData?.data.length === 0) return [];
    return processSessionData(
      sessionsData?.data as ApiSessionData[],
      dateFilter,
    );
  }, [sessionsData?.data, dateFilter]);

  // Get current month name for subtitle
  const currentMonthName = useMemo(() => {
    if (dateFilter && Array.isArray(dateFilter) && dateFilter.length === 2) {
      const startDate = moment(dateFilter[0]);
      const endDate = moment(dateFilter[1]);

      const isFullMonth =
        startDate.date() === 1 &&
        endDate.date() === endDate.daysInMonth() &&
        startDate.isSame(endDate, "month") &&
        startDate.isSame(endDate, "year");

      if (isFullMonth) {
        return startDate.format("MMMM YYYY");
      }

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

  // Calculate Y-axis max - always show all types in main chart
  const yAxisMax = useMemo(() => {
    return calculateYAxisMax(chartData);
  }, [chartData]);

  // Generate Y-axis ticks with step of 10
  const yAxisTicks = useMemo(() => {
    return generateYAxisTicks(yAxisMax);
  }, [yAxisMax]);

  // X-axis ticks
  const xAxisTicks = useMemo(() => {
    const daysInRange = chartData.length;

    if (daysInRange <= 7) {
      return chartData.map((d) => d.day);
    } else if (daysInRange <= 14) {
      return chartData.filter((_, index) => index % 2 === 0).map((d) => d.day);
    } else {
      const ticks = [1, 5, 10, 15, 20, 25];
      if (daysInRange >= 30) ticks.push(30);
      if (daysInRange === 31) ticks.push(31);
      return ticks.filter((tick) => tick <= daysInRange);
    }
  }, [chartData]);

  // Format X-axis tick with ordinal suffix
  const formatXAxis = useCallback((day: number): string => {
    return getOrdinalSuffix(day);
  }, []);

  // Custom tooltip component
  const CustomTooltip = useCallback<React.FC<CustomTooltipProps>>(
    ({ active, payload, chartConfig }) => {
      if (!active || !payload?.length) return null;

      const dataPoint = payload[0]?.payload;
      const formattedDate = moment(dataPoint.date).format("ddd, MMM D");

      return (
        <div className={classes.tooltip}>
          <div className={classes.tooltipLabel}>{formattedDate}</div>
          <div className={classes.tooltipContent}>
            <div className={classes.tooltipItem}>
              <span className={classes.tooltipName}>Total Sessions</span>
              <span className={classes.tooltipValue}>
                {dataPoint.totalSessions}
              </span>
            </div>
            {payload?.map((item, index) => (
              <div key={index} className={classes.tooltipItem}>
                <div
                  className={classes.tooltipIndicator}
                  style={{ backgroundColor: item.color }}
                />
                <span className={classes.tooltipName}>
                  {chartConfig[item.dataKey]?.label || item.name}
                </span>
                <span className={classes.tooltipValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
    [],
  );

  // Render content based on state
  const renderContent = useCallback(() => {
    if (sessionsLoading) {
      return <LoadingBox />;
    }

    if (sessionsData?.data?.length === 0 || sessionsError) {
      return <ErrorBox />;
    }

    return (
      <div className={classes.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 0, right: 5, left: -10, bottom: 0 }}
          >
            <defs>
              {Object.entries(chartConfig).map(([key, config]) => (
                <linearGradient
                  key={key}
                  id={`gradient-${key}-${chartId}`}
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
              stroke="var(--grey-color1)"
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
                fontSize: "var(--regular16-)",
                fill: "var(--text-grey)",
              }}
              className={classes.axis}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontFamily: "var(--leagueSpartan-medium-500)",
                fontSize: "var(--regular16-)",
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
            {/* Always show all areas in main chart */}
            <Area
              type="monotone"
              dataKey="conducted"
              stroke={chartConfig.conducted.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-conducted-${chartId})`}
              style={{ cursor: "pointer" }}
            />
            <Area
              type="monotone"
              dataKey="noShow"
              stroke={chartConfig.noShow.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-noShow-${chartId})`}
              style={{ cursor: "pointer" }}
            />
            <Area
              type="monotone"
              dataKey="teacherAbsent"
              stroke={chartConfig.teacherAbsent.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-teacherAbsent-${chartId})`}
              style={{ cursor: "pointer" }}
            />
            <Area
              type="monotone"
              dataKey="studentAbsent"
              stroke={chartConfig.studentAbsent.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-studentAbsent-${chartId})`}
              style={{ cursor: "pointer" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }, [
    sessionsData?.data,
    sessionsLoading,
    sessionsError,
    chartData,
    chartConfig,
    chartId,
    xAxisTicks,
    formatXAxis,
    yAxisMax,
    yAxisTicks,
    CustomTooltip,
  ]);

  return (
    <>
      <ChartContainer
        title="Sessions"
        subtitle={currentMonthName}
        inLineStyles={inLineStyles}
        icon={true}
        handleModal={handleModal}
      >
        {renderContent()}
      </ChartContainer>
      <SessionChartModal
        modalOpen={modalOpen}
        handleClose={handleClose}
        chartData={chartData}
        isLoading={sessionsLoading}
        error={sessionsError}
        selectedBoards={selectedBoards}
        selectedGrades={selectedGrades}
        selectedCurriculums={selectedCurriculums}
        selectedSubjects={selectedSubjects}
        selectedStudents={selectedStudents}
        selectedTeachers={selectedTeachers}
        onBoardsChange={handleBoardsChange}
        onGradesChange={handleGradesChange}
        onCurriculumsChange={handleCurriculumsChange}
        onSubjectsChange={handleSubjectsChange}
        onStudentsChange={handleStudentsChange}
        onTeachersChange={handleTeachersChange}
        dateFilter={dateFilter}
        onDateFilterChange={handleDateFilterChange}
        selectedRecording={selectedRecording} // ✅ passed to modal
        onRecordingChange={handleRecordingChange} // ✅ passed to modal
      />
    </>
  );
}
