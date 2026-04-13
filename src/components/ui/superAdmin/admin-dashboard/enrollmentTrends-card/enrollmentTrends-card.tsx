import React, { useCallback, useId, useState } from "react";
import styles from "./enrollmentTrends-card.module.css";
import ChartContainer from "../chartContainer/chartContainer";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import EnrollmentTrendsModal from "../enrollmentTrends-modal/enrollmentTrends-modal";
import { useQuery } from "@tanstack/react-query";
import { getEnrollmentChurnStats } from "@/services/dashboard/superAdmin/analytics/analytics";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import moment from "moment";
import LineChartComponent from "@/components/global/charts/line-chart/line-chart";

export default function EnrollmentTrendsChart({
  inLineStyles,
  title,
  subtitle,
}: {
  inLineStyles: React.CSSProperties;
  title: string;
  subtitle: string;
}): JSX.Element {
  const chartId = useId();
  const token = useAppSelector((state) => state.user.token);

  const [modalOpen, setModalOpen] = useState(false);
  const [filterByYear, setFilterByYear] = useState<string>(
    String(moment().year()),
  );

  const handleModal = useCallback(() => setModalOpen(true), []);
  const handleClose = useCallback(() => {
    setFilterByYear(String(moment().year()));
    setModalOpen(false);
  }, []);

  const handleYearChange = useCallback((year: string) => {
    setFilterByYear(year);
  }, []);

  const {
    data: enrollmentChurnStatsData,
    isLoading: enrollmentChurnStatsIsLoading,
    isError: enrollmentChurnStatsIsError,
  } = useQuery({
    queryKey: ["getEnrollmentChurnStats", token, filterByYear],
    queryFn: () => getEnrollmentChurnStats(Number(filterByYear), { token }),
    enabled: !!token,
  });

  const renderContent = useCallback(() => {
    if (enrollmentChurnStatsIsLoading) return <LoadingBox />;
    if (enrollmentChurnStatsIsError) return <ErrorBox />;
    if (!enrollmentChurnStatsData?.length) return <ErrorBox />;

    return (
      <LineChartComponent
        data={enrollmentChurnStatsData}
        chartId={chartId}
        dataKey1="numberOfEnrollmentsCreated"
        dataKey2="numberOfChurnCreated"
      />
    );
  }, [
    enrollmentChurnStatsIsLoading,
    enrollmentChurnStatsIsError,
    enrollmentChurnStatsData,
    chartId,
  ]);

  return (
    <ChartContainer
      title={title}
      subtitle={subtitle}
      inLineStyles={inLineStyles}
      icon={true}
      handleModal={handleModal}
    >
      <div className={styles.chartWrapper}>{renderContent()}</div>
      <EnrollmentTrendsModal
        modalOpen={modalOpen}
        handleClose={handleClose}
        chartData={enrollmentChurnStatsData || []}
        isLoading={enrollmentChurnStatsIsLoading}
        error={enrollmentChurnStatsIsError}
        filterByYear={filterByYear}
        onYearChange={handleYearChange}
      />
    </ChartContainer>
  );
}
