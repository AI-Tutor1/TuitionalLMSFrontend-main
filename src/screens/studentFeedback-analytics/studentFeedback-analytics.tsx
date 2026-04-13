"use client";
import React, { useId, useCallback } from "react";
import HorizontalBarChart from "@/components/global/charts/horizontalBar-chart/horizontalBar-chart";
import ChartContainer from "@/components/ui/superAdmin/admin-dashboard/chartContainer/chartContainer";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import classes from "./studentFeedback-analytics.module.css";
import LineChartComponent from "@/components/global/charts/line-chart/line-chart";
import TeacherDashboardCard from "@/components/ui/teacher/dashboard-card/dashboard-card";

const dataArr = [
  { name: "Teacher 1", attendance: 85 },
  { name: "Teacher 2", attendance: 92 },
  { name: "Teacher 3", attendance: 78 },
  { name: "Teacher 4", attendance: 95 },
  { name: "Teacher 5", attendance: 88 },
  { name: "Teacher 6", attendance: 72 },
];

const lineChartData = [
  { month: "Jan", newStudents: 45, churn: 12 },
  { month: "Feb", newStudents: 52, churn: 8 },
  { month: "Mar", newStudents: 38, churn: 15 },
  { month: "Apr", newStudents: 65, churn: 10 },
  { month: "May", newStudents: 48, churn: 14 },
  { month: "Jun", newStudents: 55, churn: 9 },
];

const cardData = [
  { id: 1, text: "Student Name", number: 1250 },
  { id: 2, text: "Sessions Rated", number: 4.5 },
  { id: 3, text: "Avg Rating Given", number: 892 },
  { id: 4, text: "Teachers Rated", number: 45 },
];

const cardStyle = {
  padding: "clamp(0.625rem, 0.4905rem + 0.6329vw, 1.25rem)",
  flex: 1,
  // justifyContent: "space-between",
};

const StudentFeedbackAnalytics = () => {
  const chartId = useId();
  const lineChartId = useId();
  const lineChartId2 = useId();

  const renderContent = useCallback(
    (barFillColor?: string) => {
      if (false) return <LoadingBox />;
      if (false) return <ErrorBox />;
      if (false) return <ErrorBox />;

      return (
        <HorizontalBarChart
          barFillColor={barFillColor}
          data={dataArr}
          chartId={chartId}
        />
      );
    },
    [chartId],
  );

  return (
    <div className={classes.container}>
      <div className={classes.cardsBox}>
        {cardData.map((card) => (
          <TeacherDashboardCard
            key={card.id}
            text={card.text}
            number={card.number}
            inlineStyling={cardStyle}
            loading={false}
          />
        ))}
      </div>
      <div className={classes.chartsBox}>
        <ChartContainer
          title="Teacher-wise Rating"
          subtitle="Average rating given to each teacher"
          inLineStyles={{ height: "320px" }}
          icon
          handleModal={() => {}}
        >
          {renderContent("var(--green-color)")}
        </ChartContainer>
        <ChartContainer
          title="Subject-wise Rating"
          subtitle="Average rating per subject area"
          inLineStyles={{ height: "320px" }}
          icon
          handleModal={() => {}}
        >
          {renderContent()}
        </ChartContainer>
        <ChartContainer
          title="Enrollment-wise Rating"
          subtitle="Average rating across enrollments"
          inLineStyles={{ height: "320px" }}
          icon
          handleModal={() => {}}
        >
          {renderContent("var(--orange-text-color1)")}
        </ChartContainer>
        <ChartContainer
          title="Feedback Reason Frequency"
          subtitle="Average rating given to each teacher"
          inLineStyles={{ height: "320px" }}
          icon
          handleModal={() => {}}
        >
          {renderContent("var(--red-text-color1)")}
        </ChartContainer>
        <ChartContainer
          title="Rating Trend Over Time"
          subtitle="Monthly average ratings given by student"
          inLineStyles={{ height: "320px" }}
          icon
          handleModal={() => {}}
        >
          <LineChartComponent data={lineChartData} chartId={lineChartId} />
        </ChartContainer>
        <ChartContainer
          title="Session-wise Rating History"
          subtitle="Rating progression across sessions"
          inLineStyles={{ height: "320px" }}
          icon
          handleModal={() => {}}
        >
          <LineChartComponent
            data={lineChartData}
            chartId={lineChartId2}
            strokeFillColor1="var(--green-color)"
            strokeFillColor2="var(--green-text-color3)"
          />
        </ChartContainer>
      </div>
    </div>
  );
};

export default StudentFeedbackAnalytics;
