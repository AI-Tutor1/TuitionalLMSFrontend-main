"use client";
import React, { FC, useMemo, useEffect, CSSProperties } from "react";
import classes from "./student-teacher-dashboard.module.css";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { toast } from "react-toastify";
import Card from "@/components/ui/teacher/dashboard-card/dashboard-card";
import Enrollment from "./components/enrollment/enrollment";
import OngoingClass from "./components/ongoing-class/ongoing-class";
import Sessions from "./components/sessions/sessions";
import GoogleAuthModal from "@/components/global/google-auth/google-auth";
import SessionHistory from "@/components/ui/teacher/earnings/session-history/session-history";
import {
  monthlySessionCountForTutor,
  monthlySessionCountForStudent,
  monthlySessionCountForParent,
} from "@/services/dashboard/superAdmin/sessions/sessions";
import { useQuery } from "@tanstack/react-query";
import { MyAxiosError } from "@/services/error.type";
import { useMediaQuery } from "react-responsive";
import { getDashboardAnalytics } from "@/services/dashboard/superAdmin/analytics/analytics";

const StudentDashboard: FC = () => {
  const isLarge = useMediaQuery({ query: "(max-width: 1000px)" });
  const styles = useMemo(() => {
    return {
      cardStyles: {
        flexDirection: isLarge ? "row" : undefined,
        alingItems: isLarge ? "center" : undefined,
        justifyContent: isLarge ? "space-between" : undefined,
        padding: "15px",
        boxShadow: "none",
      } as CSSProperties,
      bottomBoxStyles: {
        width: isLarge ? "50%" : undefined,
      } as CSSProperties,
    };
  }, [isLarge]);
  const { token, user, childrens } = useAppSelector((state) => state?.user);

  const {
    data: sessionCountForTutorStudentData,
    error: sessionCountForTutorStudentError,
    isLoading: sessionCountForTutorStudentLoading,
  } = useQuery({
    queryKey: ["getSessionCountData", user?.id],
    queryFn: () => {
      if (user?.roleId === 5) {
        return monthlySessionCountForTutor(
          { tutor_id: String(user?.id) },
          {
            token,
          },
        );
      } else if (user?.roleId === 3) {
        return monthlySessionCountForStudent(
          { student_id: String(user?.id) },
          {
            token,
          },
        );
      } else if (user?.roleId === 4) {
        return monthlySessionCountForParent(
          {
            student_id: String(user?.id),
            childrens: childrens?.map((i: any) => i.id).join(","),
          },
          {
            token,
          },
        );
      }
    },
    enabled: !!user?.id && !!token && !!user?.roleId,
    refetchOnWindowFocus: false,
    staleTime: 300000,
  });

  const {
    data: dashboardAnalyticsData,
    error: dashboardAnalyticsError,
    isLoading: dashboardAnalyticsLoading,
  } = useQuery({
    queryKey: ["getDashboardAnalytics", user?.id],
    queryFn: () => {
      if (user?.roleId === 5) {
        return getDashboardAnalytics(
          { userId: Number(user?.id), role: "teacher" },
          {
            token,
          },
        );
      } else if (user?.roleId === 3) {
        return getDashboardAnalytics(
          { userId: Number(user?.id), role: "student" },
          {
            token,
          },
        );
      } else if (user?.roleId === 4) {
        return getDashboardAnalytics(
          {
            userId: Number(user?.id),
            role: "parent",
            childrens: childrens?.map((i: any) => i.id).join(","),
          },
          {
            token,
          },
        );
      }
    },
    enabled: !!user?.id && !!token && user?.roleId != null,
    refetchOnWindowFocus: false,
  });

  const sessionCountData = useMemo(() => {
    if (
      !sessionCountForTutorStudentData?.data ||
      !Array.isArray(sessionCountForTutorStudentData?.data) ||
      (sessionCountForTutorStudentData?.data as any[])?.length === 0
    )
      return [];

    return sessionCountForTutorStudentData?.data?.map((item) => ({
      ...item,
      highlight: true,
    }));
  }, [sessionCountForTutorStudentData?.data]);

  const cardProps = useMemo(() => {
    return {
      inlineStyling: styles.cardStyles,
      bottomBoxInlineStyling: styles.bottomBoxStyles,
      loading: dashboardAnalyticsLoading,
    };
  }, [dashboardAnalyticsLoading]);

  const card1Props = useMemo(() => {
    return {
      text: user?.roleId === 5 ? "Total Students" : "Subjects Enrolled",
      number: dashboardAnalyticsData?.enrollmentsCount,
    };
  }, [user, dashboardAnalyticsData?.enrollmentsCount]);

  const card2Props = useMemo(() => {
    return {
      text: user?.roleId === 5 ? "Upcoming Classes" : "Classes Attended",
      number:
        user?.roleId === 5
          ? dashboardAnalyticsData?.totalUpcomingClasses
          : dashboardAnalyticsData?.totalClassAttended,
    };
  }, [
    user,
    dashboardAnalyticsData?.totalUpcomingClasses,
    dashboardAnalyticsData?.totalClassAttended,
  ]);

  const card3Props = useMemo(() => {
    return {
      text: user?.roleId === 5 ? "Total Hours Taught" : "Upcoming Classes",
      number:
        user?.roleId === 5
          ? dashboardAnalyticsData?.totalClassTime
          : dashboardAnalyticsData?.totalUpcomingClasses,
    };
  }, [
    user,
    dashboardAnalyticsData?.totalClassTime,
    dashboardAnalyticsData?.totalUpcomingClasses,
  ]);

  const ongoingClassesStyles = useMemo(
    () => ({
      // minHeight: "300px",
      // maxHeight: "300px",
      flex: 1,
    }),
    [],
  );

  const sessionHistory = useMemo(() => {
    return {
      data: sessionCountData || [],
      loading: sessionCountForTutorStudentLoading,
      inLineStyles: {
        // padding: "20px",
        // width: "100%",
        // minHeight: "410px",
        // maxHeight: "410px",
        flex: 1,
      },
    };
  }, [sessionCountData, sessionCountForTutorStudentLoading]);

  useEffect(() => {
    if (sessionCountForTutorStudentError) {
      const error = sessionCountForTutorStudentError as MyAxiosError;
      toast.error(error.response?.data?.error || error.message);
    }

    if (dashboardAnalyticsError) {
      const error = dashboardAnalyticsError as MyAxiosError;
      toast.error(error.response?.data?.error || error.message);
    }
  }, [sessionCountForTutorStudentError, dashboardAnalyticsError]);

  return (
    <>
      {user?.isSync === true || user?.roleId === 4 ? (
        <div className={classes.container}>
          <div className={`${classes.sections} ${classes.rightPadding}`}>
            <div className={classes.componentsBox}>
              <Card {...cardProps} {...card1Props} />
              <Card {...cardProps} {...card2Props} />
              <Card {...cardProps} {...card3Props} />
            </div>
            <OngoingClass inLineStyles={ongoingClassesStyles} />
            <SessionHistory {...sessionHistory} />
          </div>
          <div className={classes.sections}>
            <Enrollment />
            <Sessions />
          </div>
        </div>
      ) : (
        <GoogleAuthModal user={user} token={token} />
      )}
    </>
  );
};

export default StudentDashboard;
