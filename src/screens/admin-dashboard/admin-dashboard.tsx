"use client";
import React, { FC, useEffect, useMemo, memo } from "react";
import classes from "./admin-dashboard.module.css";
import AdminDashboardStatsCard from "@/components/ui/superAdmin/admin-dashboard/dashboard-statsCard/dashboard-statsCard";
import SessionsChart from "@/components/ui/superAdmin/admin-dashboard/session-chart/session-chart";
// import SchedulesChart from "@/components/ui/superAdmin/admin-dashboard/schedules-chart/schedules-chart";
import EnrollmentTrendsChart from "@/components/ui/superAdmin/admin-dashboard/enrollmentTrends-card/enrollmentTrends-card";
import AttendanceChart from "@/components/ui/superAdmin/admin-dashboard/attendance-chart/attendance-chart";
import UserEngagementChart from "@/components/ui/superAdmin/admin-dashboard/userEngagement-chart/userEngagement-chart";
import StudentDistributionByCurriculumChart from "@/components/ui/superAdmin/admin-dashboard/studentDistribution/studentDistribution";
import StudentDistributionByGradeChart from "@/components/ui/superAdmin/admin-dashboard/gradeDistribution-chart/gradeDistribution-chart";
import SessionsHourChart from "@/components/ui/superAdmin/admin-dashboard/sessionHour-chart/sessionHour-chart";
import GeographicDistributionChart from "@/components/ui/superAdmin/admin-dashboard/geographicDistribution/geographicDistribution";
import TodaysSessionsTable from "@/components/ui/superAdmin/admin-dashboard/todaySessions-table/todaySessions-table";
import ChurnUsersTable from "@/components/ui/superAdmin/admin-dashboard/churn-users-table/churn-users-table";
import TutorPerformance from "@/components/ui/superAdmin/admin-dashboard/tutorPerformance/tutorPerformance";
import {
  Users,
  BookOpen,
  Activity,
  UserPlus,
  TrendingDown,
  BarChart2,
} from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useQuery } from "@tanstack/react-query";
import { getComparisionAnalytics } from "@/services/dashboard/superAdmin/analytics/analytics";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import { dataAnalyticsCountByCountryApi } from "@/services/dashboard/superAdmin/analytics/analytics";
import {
  studentsByCurriculum,
  studentsByGrade,
  // churnAnalytics,
} from "@/services/dashboard/superAdmin/analytics/analytics";
import { getAttendanceRateBySubject } from "@/services/dashboard/superAdmin/sessions/sessions";
import { useParams } from "next/navigation";
import moment from "moment";
import { getSessionCountsByHour } from "@/services/dashboard/superAdmin/sessions/sessions";

const AdminDashboard: FC = () => {
  const { role } = useParams();
  const { token, user } = useAppSelector((state) => state?.user);

  const { data, error, isLoading } = useQuery({
    queryKey: ["getComparisionAnalytics", token],
    queryFn: () => getComparisionAnalytics({ token }),
    enabled: !!token,
  });

  const {
    data: studentsByCurriculumData,
    error: studentsByCurriculumError,
    isLoading: studentsByCurriculumIsLoading,
  } = useQuery({
    queryKey: ["studentsByCurriculum", token],
    queryFn: () => studentsByCurriculum({ token }),
    enabled: !!token,
  });

  const {
    data: studentsByGradeData,
    error: studentsByGradeError,
    isLoading: studentsByGradeIsLoading,
  } = useQuery({
    queryKey: ["studentsByGrade", token],
    queryFn: () => studentsByGrade({ token }),
    enabled: !!token,
  });

  const {
    data: dataAnalyticsCountByCountryData,
    error: dataAnalyticsCountByCountryError,
    isLoading: dataAnalyticsCountByCountryIsLoading,
  } = useQuery({
    queryKey: ["dataAnalyticsCountByCountry", token],
    queryFn: () => dataAnalyticsCountByCountryApi({ token }),
    enabled: !!token,
  });

  const statsData = useMemo(
    () => [
      {
        title: "Active Students",
        value: data?.result.activeStudents.today,
        icon: Users,
        description: "Daily active users",
        trend: {
          value: data?.result.activeStudents.percentageChange,
          isPositive:
            Number(data?.result?.activeStudents?.percentageChange) > 0,
          label: "vs. yesterday",
        },
        compact: true,
      },
      {
        title: "New Enrollments",
        value: data?.result.enrollments.currentMonth,
        icon: UserPlus,
        description: "This month",
        trend: {
          value: data?.result.enrollments.percentageChange,
          isPositive: Number(data?.result.enrollments.percentageChange) > 0,
          label: "vs. last month",
        },
        compact: true,
      },
      ...(user?.roleId === 1
        ? [
            {
              title: "Student Retention",
              value:
                data?.result.studentRetention.retentionRateCurrentMonth + "%",
              icon: Activity,
              description: "30-day retention rate",
              trend: {
                value: data?.result.studentRetention.percentageDifference,
                isPositive:
                  Number(data?.result.studentRetention.percentageDifference) >
                  0,
                label: "vs. last month",
              },
              compact: true,
            },
          ]
        : []),
      {
        title: "Churn Rate",
        value: data?.result.churnRate.churnRateCurrentMonth + "%",
        icon: TrendingDown,
        description: "Monthly churn",
        trend: {
          value: data?.result.churnRate.percentageDifference,
          isPositive: Number(data?.result.churnRate.percentageDifference) > 0,
          label: "vs. last month",
        },
        compact: true,
      },
      {
        title: "Avg. Sessions",
        value: Number(data?.result.sessionAvg.currentMonthAverage).toFixed(2),
        icon: BarChart2,
        description: "Per student / month",
        trend: {
          value: Number(data?.result.sessionAvg.percentageDifference).toFixed(
            2,
          ),
          isPositive: Number(data?.result.sessionAvg.percentageDifference) > 0,
          label: "vs. last month",
        },
        compact: true,
      },
      {
        title: "Active Teachers",
        value: data?.result.activeTeachers.today,
        icon: BookOpen,
        description: "Currently online",
        trend: {
          value: data?.result.activeTeachers.percentageChange,
          isPositive: Number(data?.result.activeTeachers.percentageChange) > 0,
          label: "vs. yesterday",
        },
        compact: true,
      },
    ],
    [data, user?.roleId],
  );

  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [error]);

  return (
    <div className={classes.container}>
      <div className={classes.gridContainer1}>
        {statsData?.map((item: any, indx: number) => (
          <AdminDashboardStatsCard
            key={indx}
            title={item?.title}
            value={item?.value}
            icon={item?.icon}
            description={item?.description}
            trend={item?.trend}
            compact={item?.compact}
            variant={item?.variant}
            loading={isLoading}
            inlineStyles={{ flex: "1" }}
          />
        ))}
      </div>
      <div className={classes.gridContainer2}>
        <StudentDistributionByCurriculumChart
          inLineStyles={{
            gridColumn: "span 1",
            display: "flex",
            flexDirection: "column",
          }}
          data={studentsByCurriculumData || []}
          loading={studentsByCurriculumIsLoading}
          error={studentsByCurriculumError}
          title="Students Distribution"
          subtitle="By curriculum"
        />
        <StudentDistributionByCurriculumChart
          inLineStyles={{
            gridColumn: "span 1",
            display: "flex",
            flexDirection: "column",
          }}
          data={studentsByGradeData || []}
          loading={studentsByGradeIsLoading}
          error={studentsByGradeError}
          title="Students Distribution"
          subtitle="By grade"
        />
        {/* <StudentDistributionByGradeChart
          inLineStyles={{ gridColumn: "span 1" }}
          data={studentsByGradeData ? studentsByGradeData : []}
          loading={studentsByGradeIsLoading}
          error={studentsByGradeError}
        /> */}
        {/* <SchedulesChart
          inLineStyles={{
            gridColumn: "span 1",
            display: "flex",
            flexDirection: "column",
          }}
        /> */}
        <SessionsChart
          inLineStyles={{
            gridColumn: "span 1",
            display: "flex",
            flexDirection: "column",
          }}
        />
        <AttendanceChart inLineStyles={{ gridColumn: "span 1" }} />
        {role === "superAdmin" && (
          <EnrollmentTrendsChart
            inLineStyles={{ gridColumn: "span 1" }}
            title="Enrollment Trends"
            subtitle="New students vs churn"
          />
        )}
        <SessionsHourChart inLineStyles={{ gridColumn: "span 1" }} />
        {role === "superAdmin" && (
          <UserEngagementChart inLineStyles={{ gridColumn: "span 1" }} />
        )}
        {/* <AttendanceChart
          label="Session Completion"
          inLineStyles={{ gridColumn: "span 1" }}
        /> */}
        {/* <StudentDistributionChart data={usersData} /> */}
        {role === "superAdmin" && (
          <GeographicDistributionChart
            data={dataAnalyticsCountByCountryData}
            inLineStyles={{ gridColumn: "span 1" }}
          />
        )}
      </div>

      <div className={classes.gridContainer3}>
        {role === "superAdmin" && (
          <>
            <TutorPerformance inLineStyles={{ gridColumn: "span 1" }} />
            <TodaysSessionsTable inLineStyles={{ gridColumn: "span 1" }} />
            <ChurnUsersTable inLineStyles={{ gridColumn: "span 1" }} />
          </>
        )}
        {/* <StudentDistributionChart /> */}
      </div>
    </div>
  );
};

export default memo(AdminDashboard);
