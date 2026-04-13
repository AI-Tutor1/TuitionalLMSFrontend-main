"use client";
import React, { useId, useCallback, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import HorizontalBarChart from "@/components/global/charts/horizontalBar-chart/horizontalBar-chart";
import ChartContainer from "@/components/ui/superAdmin/admin-dashboard/chartContainer/chartContainer";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import LineChartComponent from "@/components/global/charts/line-chart/line-chart";
import TeacherDashboardCard from "@/components/ui/teacher/dashboard-card/dashboard-card";
import {
  getFeedbackAnalyticsForTeacher,
  getAverageRatingByMonthForTeacher,
  getAverageRatingByEnrollmentForTeacher,
  getAverageRatingBySubjectForTeacher,
  getSessionWiseRatingForTeacher,
} from "@/services/dashboard/superAdmin/session-feedbacks/session-feedbacks";
import classes from "./teacherFeedback-analytics.module.css";
import moment from "moment";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import { Height } from "@mui/icons-material";

interface AxisConfig {
  domain?: [number, number];
  ticks?: number[];
  tickFormatter?: (value: any) => string;
  width?: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const yAxisValues: AxisConfig = {
  domain: [0, 5],
  ticks: [0, 1, 2, 3, 4, 5],
  tickFormatter: (value: number) => `${value}`,
};

const CARD_STYLE = {
  padding: "clamp(0.625rem, 0.4905rem + 0.6329vw, 1.25rem)",
  flex: 1,
  minWidth: "160px",
} as const;

const CHART_STYLE = {
  Height: "max-content",
  maxHeight: "400px",
} as const;

const MOBILE_FILTER_STYLE = {
  width: "max-content",
  alignSelf: "flex-end",
} as const;

const TEACHER_BOX_STYLE = {
  minWidth: "320px",
  flex: "1",
  background: "var(--main-white-color)",
} as const;

const NOOP = () => {};

const FeedbackAnalytics: React.FC = () => {
  const chartId = useId();
  const lineChartId = useId();
  const lineChartId2 = useId();
  const { token } = useAppSelector((state) => state.user);
  const { teachers } = useAppSelector((state) => state?.usersByGroup);
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<null | string[]>(() => [
    moment().startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  const teachersData = useMemo(() => {
    return teachers?.users?.map((teacher) => JSON.stringify(teacher));
  }, [teachers?.users]);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  const handleCalendar = useCallback((value: any) => {
    if (value === null) {
      setDateFilter(null);
    } else {
      setDateFilter(
        value.map((i: any) => moment(i).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
      );
    }
  }, []);

  const handleTeacherFilter = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedTeacher(e.target.value);
    },
    [],
  );

  const queryParams = useMemo(
    () => ({
      teacherId: selectedTeacher ? JSON.parse(selectedTeacher)?.id : null,
      startDate:
        dateFilter?.[0] ?? moment().startOf("month").format("YYYY-MM-DD"),
      endDate: dateFilter?.[1] ?? moment().endOf("month").format("YYYY-MM-DD"),
    }),
    [dateFilter, selectedTeacher],
  );

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isSuccess: analyticsSuccess,
  } = useQuery({
    queryKey: ["feedbackAnalytics", queryParams],
    queryFn: () => getFeedbackAnalyticsForTeacher(queryParams, { token }),
    enabled: !!token && selectedTeacher !== null,
    staleTime: 300_000,
  });

  const {
    data: monthlyData,
    isLoading: monthlyLoading,
    isError: monthlyError,
  } = useQuery({
    queryKey: ["monthlyRatings", queryParams],
    queryFn: () => getAverageRatingByMonthForTeacher(queryParams, { token }),
    enabled: !!token && selectedTeacher !== null,
    staleTime: 300_000,
  });

  const {
    data: enrollmentData,
    isLoading: enrollmentLoading,
    isError: enrollmentError,
  } = useQuery({
    queryKey: ["enrollmentRatings", queryParams],
    queryFn: () =>
      getAverageRatingByEnrollmentForTeacher(queryParams, { token }),
    enabled: !!token && selectedTeacher !== null,
    staleTime: 300_000,
  });

  const {
    data: subjectData,
    isLoading: subjectLoading,
    isError: subjectError,
  } = useQuery({
    queryKey: ["subjectRatings", queryParams],
    queryFn: () => getAverageRatingBySubjectForTeacher(queryParams, { token }),
    enabled: !!token && selectedTeacher !== null,
    staleTime: 300_000,
  });

  const {
    data: sessionData,
    isLoading: sessionLoading,
    isError: sessionError,
  } = useQuery({
    queryKey: ["sessionWiseRatings", queryParams],
    queryFn: () => getSessionWiseRatingForTeacher(queryParams, { token }),
    enabled: !!token && selectedTeacher !== null,
    staleTime: 300_000,
  });

  const normalizedMonthlyData = useMemo(() => {
    const apiData = monthlyData?.data?.averageRatingByMonth;
    if (!apiData) return undefined;
    if (apiData.length === 0) return [];
    const year = new Date().getFullYear();
    const ratingMap = new Map(
      apiData.map((item: { month: string; averageRating: string }) => [
        item.month,
        parseFloat(item.averageRating),
      ]),
    );
    return MONTH_NAMES.map((name, index) => {
      const key = `${year}-${String(index + 1).padStart(2, "0")}`;
      return {
        month: name,
        averageRating: ratingMap.get(key) ?? 0,
      };
    });
  }, [monthlyData]);

  const enrollmentDataRefactor = useMemo(() => {
    return enrollmentData?.data?.averageRatingByEnrollment?.map((item: any) => {
      const stuentName = item["session.sessionEnrollment.name"]
        ?.split(" - ")[0]
        ?.trim()
        .split("/")[0]
        .split(" ")[0];

      const teacherName = item["session.sessionEnrollment.name"]
        ?.split(" - ")[0]
        ?.trim()
        .split("/")[1]
        .split(" ")[0];
      return {
        averageRating: item.averageRating,
        "session.sessionEnrollment.name": stuentName + "-" + teacherName,
      };
    });
  }, [enrollmentData]);

  const cardData = useMemo(() => {
    const d = analyticsData?.data;
    return [
      { id: 1, text: "Average Rating", number: d?.averageRating ?? 0 },
      { id: 2, text: "Total Sessions", number: d?.totalSessions ?? 0 },
      { id: 3, text: "Enrollments", number: d?.enrollmentCount ?? 0 },
      { id: 4, text: "Total Feedbacks", number: d?.allFeedbackCount ?? 0 },
    ];
  }, [analyticsData]);

  const renderChartContent = useCallback(
    (
      data: any[] | undefined,
      isLoading: boolean,
      isError: boolean,
      barFillColor?: string,
      categoryDataKey?: string,
      barDataKey?: string,
      yAxisConfigParam?: AxisConfig,
    ) => {
      if (!analyticsSuccess || isLoading) return <LoadingBox />;
      if (isError || !data?.length) return <ErrorBox />;

      return (
        <HorizontalBarChart
          barFillColor={barFillColor}
          data={data}
          chartId={chartId}
          barDataKey={barDataKey}
          categoryDataKey={categoryDataKey}
          vertical={true}
          yAxisConfig={yAxisConfigParam}
        />
      );
    },
    [chartId, analyticsSuccess],
  );

  const renderLineChartContent = useCallback(
    (
      data: any[] | undefined,
      isLoading: boolean,
      isError: boolean,
      chartIdParam: string,
      strokeColor1?: string,
      strokeColor2?: string,
      yAxisConfigParam?: AxisConfig,
    ) => {
      if (!analyticsSuccess || isLoading) return <LoadingBox />;
      if (isError || !data?.length) return <ErrorBox />;

      return (
        <LineChartComponent
          data={data}
          chartId={chartIdParam}
          strokeFillColor1={strokeColor1}
          strokeFillColor2={strokeColor2}
          dataKey1="averageRating"
          yAxisConfig={yAxisConfigParam}
        />
      );
    },
    [analyticsSuccess],
  );

  const chartConfigs = useMemo(
    () => [
      {
        title: "Overall Rating Trend",
        subtitle: "Monthly average ratings",
        content: renderLineChartContent(
          normalizedMonthlyData,
          monthlyLoading,
          monthlyError,
          lineChartId2,
          "var(--green-color)",
          "var(--green-text-color3)",
          yAxisValues,
        ),
      },
      {
        title: "Enrollment-wise Ratings",
        subtitle: "Average rating per enrollment course",
        content: renderChartContent(
          enrollmentDataRefactor,
          enrollmentLoading,
          enrollmentError,
          "var(--green-color)",
          "session.sessionEnrollment.name",
          "averageRating",
          yAxisValues,
        ),
      },
      {
        title: "Rating Distribution by Session",
        subtitle: "Star rating breakdown across individual sessions",
        content: renderLineChartContent(
          sessionData?.data?.sessionWiseRating,
          sessionLoading,
          sessionError,
          lineChartId,
          undefined,
          undefined,
          yAxisValues,
        ),
      },
      {
        title: "Subject-wise Performance",
        subtitle: "Average rating per subject area",
        content: renderChartContent(
          subjectData?.data?.averageRatingBySubject,
          subjectLoading,
          subjectError,
          "var(--main-blue-color)",
          "session.subject.name",
          "averageRating",
          yAxisValues,
        ),
      },
    ],
    [
      normalizedMonthlyData,
      monthlyLoading,
      monthlyError,
      enrollmentDataRefactor,
      enrollmentLoading,
      enrollmentError,
      sessionData,
      sessionLoading,
      sessionError,
      subjectData,
      subjectLoading,
      subjectError,
      lineChartId,
      lineChartId2,
      renderChartContent,
      renderLineChartContent,
    ],
  );

  useEffect(() => {
    if (teachers?.users?.length) {
      setSelectedTeacher(JSON.stringify(teachers.users[0]));
    } else {
      setSelectedTeacher(null);
    }
  }, [teachers?.users]);

  return (
    <div className={classes.container}>
      <MobileFilterButton
        isOpen={showFullFilters}
        onClick={handleMobileFilterToggle}
        inlineStyles={MOBILE_FILTER_STYLE}
      />
      {showFullFilters && (
        <div className={classes.filterBox}>
          <FilterByDate
            changeFn={handleCalendar}
            value={dateFilter}
            minWidth="320px"
            flex={1}
          />
          <FilterDropdown
            dropDownObject
            inlineBoxStyles={TEACHER_BOX_STYLE}
            placeholder="Filter teacher"
            data={teachersData || []}
            value={selectedTeacher ? selectedTeacher : ""}
            handleChange={handleTeacherFilter}
          />
        </div>
      )}
      <div className={classes.cardsBox}>
        {cardData.map((card) => (
          <TeacherDashboardCard
            key={card.id}
            text={card.text}
            number={card.number}
            inlineStyling={CARD_STYLE}
            loading={analyticsLoading}
          />
        ))}
      </div>
      <div className={classes.chartsBox}>
        {chartConfigs.map((chart, index) => (
          <ChartContainer
            key={index}
            title={chart.title}
            subtitle={chart.subtitle}
            inLineStyles={CHART_STYLE}
            // icon
            handleModal={NOOP}
          >
            {chart.content}
          </ChartContainer>
        ))}
      </div>
    </div>
  );
};

export default React.memo(FeedbackAnalytics);
