import React, { useId, useMemo, useState, useCallback } from "react";
import classes from "./attendance-chart.module.css";
import ChartContainer from "../chartContainer/chartContainer";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { useQuery } from "@tanstack/react-query";
import { getAttendanceRateBySubject } from "@/services/dashboard/superAdmin/sessions/sessions";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import moment from "moment";
import AttendanceChartModal from "../attendance-chart-modal/attendance-chart-modal"; // ✅ added modal import
import HorizontalBarChart from "@/components/global/charts/horizontalBar-chart/horizontalBar-chart";

// Define data type
type SubjectData = {
  name: string;
  attendance: number;
  fill: string;
};

type IProps = {
  label?: string;
  subtitle?: string;
  inLineStyles?: React.CSSProperties;
};

const AttendanceChart: React.FunctionComponent<IProps> = ({
  label,
  subtitle,
  inLineStyles,
}: IProps) => {
  const chartId = useId();
  const token = useAppSelector((state) => state.user.token);
  const user = useAppSelector((state) => state.user.user);
  const [modalOpen, setModalOpen] = useState(false); // ✅ added
  const [dateFilter, setDateFilter] = useState<[string, string] | null>([
    moment().startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);
  const handleModal = useCallback(() => setModalOpen(true), []); // ✅ added
  const handleClose = useCallback(() => {
    setDateFilter([
      moment().startOf("month").format("YYYY-MM-DD"),
      moment().endOf("month").format("YYYY-MM-DD"),
    ]);
    setModalOpen(false);
  }, []); // ✅ added

  const handleDateChange = useCallback((dates: [string, string] | null) => {
    if (dates && dates.length === 2) {
      setDateFilter(dates);
    } else {
      setDateFilter(null);
    }
  }, []);

  const {
    data: attendanceData,
    isLoading: attendanceIsLoading,
    isError: attendanceIsError,
  } = useQuery({
    queryKey: ["attendanceData", token, user?.id, dateFilter], // ✅ refetches on date change
    queryFn: () =>
      getAttendanceRateBySubject(
        {
          start_date: dateFilter?.[0], // ✅ uses state instead of hardcoded moment()
          end_date: dateFilter?.[1],
        },
        { token },
      ),
    enabled: Boolean(token && user?.id),
  });

  const data: any = useMemo(() => {
    if (!attendanceData) return [];
    return attendanceData.map((item: any) => ({
      name: item.subject_name,
      attendance:
        item.total_sessions > 0
          ? Math.min(
              100,
              Math.round(
                (Number(item.total_present_students) /
                  item.total_student_attendances) *
                  100,
              ),
            )
          : 0,
      fill: "var(--main-blue-color)",
    }));
  }, [attendanceData]);

  const chartConfig = {
    attendance: {
      label: label || "Attendance Rate",
      lightColor: "#3B82F6",
    },
  };

  const renderContent = useCallback(() => {
    if (attendanceIsLoading) return <LoadingBox />;
    if (attendanceIsError) return <ErrorBox />;
    if (data.length === 0) return <ErrorBox />;

    return (
      <HorizontalBarChart
        data={data}
        chartId={chartId}
        barDataKey="attendance"
        categoryDataKey="name"
      />
    );
  }, [attendanceIsLoading, attendanceIsError, data, chartId]);

  return (
    <>
      <ChartContainer
        title={label || "Attendance Rate"}
        subtitle={subtitle || "By subject (last 30 days)"}
        inLineStyles={inLineStyles}
        icon
        handleModal={handleModal} // ✅ added
      >
        <div className={classes.chartWrapper}>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              #chart-${chartId} {
                --color-attendance: ${chartConfig.attendance.lightColor};
              }
            `,
            }}
          />
          {renderContent()}
        </div>
      </ChartContainer>
      <AttendanceChartModal
        modalOpen={modalOpen}
        handleClose={handleClose}
        chartData={data} // ✅ passes mapped data
        isLoading={attendanceIsLoading}
        isError={attendanceIsError}
        dateFilter={dateFilter} // ✅ passes shared date
        onDateChange={handleDateChange} // ✅ modal triggers parent refetch
      />
    </>
  );
};

export default AttendanceChart;
