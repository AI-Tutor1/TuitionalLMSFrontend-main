import React, { useId, useMemo, useState, useCallback } from "react";
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
import styles from "./sessionHour-chart.module.css";
import ChartContainer from "../chartContainer/chartContainer";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import moment from "moment";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { useQuery } from "@tanstack/react-query";
import { getSessionCountsByHour } from "@/services/dashboard/superAdmin/sessions/sessions";
import SessionHourChartModal from "../sessionHour-chart-modal/sessionHour-chart-modal";

interface HourData {
  hour: string;
  count: number;
  fill: string;
}

const SessionsHourChart: React.FC<{
  label?: string;
  subtitle?: string;
  inLineStyles?: React.CSSProperties;
}> = ({ label, subtitle, inLineStyles }) => {
  const chartId = useId();
  const { token } = useAppSelector((state) => state?.user);

  const [modalOpen, setModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<[string, string] | null>([
    moment().startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);

  const handleModal = useCallback(() => setModalOpen(true), []);
  const handleClose = useCallback(() => {
    setModalOpen(false);
    setDateFilter([
      moment().startOf("month").format("YYYY-MM-DD"),
      moment().endOf("month").format("YYYY-MM-DD"),
    ]);
  }, []);

  // ✅ receives [startDate, endDate] from modal's FilterByDate
  const handleDateChange = useCallback((dates: [string, string] | null) => {
    if (dates && dates.length === 2) {
      setDateFilter(dates);
    } else {
      setDateFilter(null);
    }
  }, []);

  const {
    data: sessionHourData,
    isLoading: sessionHourIsLoading,
    isError: sessionHourIsError,
  } = useQuery({
    queryKey: ["getSessionCountsByHour", token, dateFilter], // ✅ refetches on date change
    queryFn: () =>
      getSessionCountsByHour(
        {
          startDate:
            dateFilter?.[0] || moment().startOf("month").format("YYYY-MM-DD"),
          endDate:
            dateFilter?.[1] || moment().endOf("month").format("YYYY-MM-DD"),
        }, // ✅ correct API params
        { token },
      ),
    enabled: !!token,
  });

  const data: HourData[] = useMemo(() => {
    if (!sessionHourData?.hourlyCounts) return [];
    return sessionHourData.hourlyCounts.map((item: any, index: number) => ({
      hour: `${item.hour}:00`,
      count: item.count,
      fill: index % 2 === 0 ? "var(--main-color)" : "#c7eaff",
    }));
  }, [sessionHourData]);

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
    active,
    payload,
    label,
  }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        <div className={styles.tooltipContent}>
          <span className={styles.tooltipText}>Sessions</span>
          <span className={styles.tooltipValue}>
            {payload[0].value} conducted
          </span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (sessionHourIsLoading) return <LoadingBox />;
    if (sessionHourIsError) return <ErrorBox />;
    if (data.length === 0) return <ErrorBox />;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="var(--grey-color1)"
          />
          <XAxis
            dataKey="hour"
            axisLine={false}
            tickLine={false}
            tick={{
              fontFamily: "var(--leagueSpartan-medium-500)",
              fontSize: "var(--regular16-)",
              fill: "var(--text-color)",
            }}
            width={40}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fontFamily: "var(--leagueSpartan-medium-500)",
              fontSize: "var(--regular16-)",
              fill: "var(--text-color)",
            }}
            tickFormatter={(value) => `${value}`}
            width={20}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <>
      <ChartContainer
        title={label || "Sessions Hour Chart"}
        subtitle={subtitle || "Total sessions conducted by hour"}
        inLineStyles={inLineStyles}
        icon
        handleModal={handleModal}
      >
        <div className={styles.chartWrapper}>{renderContent()}</div>
      </ChartContainer>

      <SessionHourChartModal
        modalOpen={modalOpen}
        handleClose={handleClose}
        chartData={data}
        isLoading={sessionHourIsLoading}
        isError={sessionHourIsError}
        dateFilter={dateFilter}
        onDateChange={handleDateChange} // ✅ modal triggers parent refetch
      />
    </>
  );
};

export default SessionsHourChart;
