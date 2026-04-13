import { FC, useEffect, useMemo } from "react";
import classes from "./tutor-earning.module.css";
import moment from "moment";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { MyAxiosError } from "@/services/error.type";
import TeacherDashboardCard from "@/components/ui/teacher/dashboard-card/dashboard-card";
import Card from "@/components/ui/teacher/earnings/card/card";
import EarningsOverview from "@/components/ui/teacher/earnings/earnings-overview/earnings-overview";
import SessionHistory from "@/components/ui/teacher/earnings/session-history/session-history";
import EarningHistory from "@/components/ui/teacher/earnings/earning-history/earning-history";
import ProductReviews from "@/components/ui/teacher/earnings/product-reviews/product-reviews";
import SessionSummary from "@/components/ui/teacher/earnings/session-summary/session-summary";
import {
  monthlySessionCountForTutor,
  monthlySessionDataForTutuor,
  sessionSummaryForTutuor,
} from "@/services/dashboard/superAdmin/sessions/sessions";

const Earnings: FC = () => {
  const { user, token } = useAppSelector((state) => state.user);

  // Fetch monthly session data for a tutor
  const {
    data: monthlySessionCountForTutorData,
    error: monthlySessionCountForTutorError,
    isLoading: monthlySessionCountForTutorLoading,
  } = useQuery({
    queryKey: [
      "getMonthlySessionData",
      user?.id,
      moment().subtract(1, "month").format("YYYY-MM"),
    ],
    queryFn: () =>
      monthlySessionDataForTutuor(
        {
          tutor_id: String(user?.id),
          month: moment().subtract(1, "month").format("YYYY-MM"),
        },
        {
          token,
        },
      ),
    enabled: !!user?.id && !!token,
    staleTime: 100000,
  });

  // Fetch session count per month for tutor
  const {
    data: sessionCountForTutorData,
    error: sessionCountForTutorError,
    isLoading: sessionCountForTutorLoading,
  } = useQuery({
    queryKey: ["getSessionCountData", user?.id],
    queryFn: () =>
      monthlySessionCountForTutor(
        { tutor_id: String(user?.id) },
        {
          token,
        },
      ),
    enabled: !!user?.id && !!token,
    staleTime: 100000,
  });

  const sessionCountData = useMemo(() => {
    if (
      !sessionCountForTutorData?.data ||
      !Array.isArray(sessionCountForTutorData?.data) ||
      (sessionCountForTutorData?.data as any[])?.length === 0
    )
      return [];

    return sessionCountForTutorData?.data?.map((item) => ({
      ...item,
      highlight: true,
    }));
  }, [sessionCountForTutorData?.data]);

  const {
    data: sessionSummaryForTutuorData,
    error: sessionSummaryForTutuorError,
    isLoading: sessionSummaryForTutuorLoading,
  } = useQuery({
    queryKey: ["getSessionSummaryForTutor", user?.id],
    queryFn: () =>
      sessionSummaryForTutuor(
        { tutor_id: String(user?.id) },
        {
          token,
        },
      ),
    enabled: !!user?.id && !!token,
    staleTime: 100000,
  });

  useEffect(() => {
    if (
      monthlySessionCountForTutorError ||
      sessionCountForTutorError ||
      sessionSummaryForTutuorError
    ) {
      const axiosError = (monthlySessionCountForTutorError ||
        sessionCountForTutorError ||
        sessionSummaryForTutuorError) as MyAxiosError;
      toast.error(axiosError.response?.data?.error || axiosError.message);
    }
  }, [
    monthlySessionCountForTutorError,
    sessionCountForTutorError,
    sessionSummaryForTutuorError,
  ]);

  return (
    <div className={classes.container}>
      {/* Earnings Overview */}
      <EarningsOverview
        loading={monthlySessionCountForTutorLoading}
        number={monthlySessionCountForTutorData?.tutorPayout?.balance || 0}
      />
      {/* Stats Cards */}
      <div className={classes.statsBox}>
        {[
          {
            name: "Conducted",
            value:
              monthlySessionCountForTutorData?.sessionSummary?.Conducted || 0,
          },
          {
            name: "Cancelled",
            value:
              monthlySessionCountForTutorData?.sessionSummary?.Cancelled || 0,
          },
          {
            name: "Teacher Absent",
            value:
              monthlySessionCountForTutorData?.sessionSummary?.[
                "Teacher Absent"
              ] || 0,
          },
          {
            name: "Upcoming Sessions",
            value:
              monthlySessionCountForTutorData?.sessionSummary?.[
                "Upcoming Sessions"
              ] || 0,
          },
        ].map((obj) => (
          <TeacherDashboardCard
            key={obj.name}
            text={obj.name}
            number={obj.value}
            inlineStyling={styles.cards}
            loading={monthlySessionCountForTutorLoading}
          />
        ))}
        <Card
          inlineStyling={{
            ...styles.cards,
          }}
          loading={monthlySessionCountForTutorLoading}
          number={monthlySessionCountForTutorData?.tutorPayout?.balance || 0}
          status={
            monthlySessionCountForTutorData?.tutorPayout?.status || "Pending"
          }
          startDate={
            monthlySessionCountForTutorData?.tutorPayout?.start_date || ""
          }
          endDate={monthlySessionCountForTutorData?.tutorPayout?.end_date || ""}
        />
      </div>

      {/* Session History and Earning History */}
      <div className={classes.historyGrid}>
        {/* Session History */}
        <SessionHistory
          data={sessionCountData || []}
          loading={sessionCountForTutorLoading}
        />
        {/* Session Count Summary */}
        <SessionSummary
          data={sessionSummaryForTutuorData?.data || []}
          loading={sessionSummaryForTutuorLoading}
        />
      </div>

      {/* Product Reviews and Session Count Summary */}
      <div className={classes.summaryGrid}>
        {/* Product Reviews */}
        <ProductReviews />
        {/* Earning History */}
        <EarningHistory />
      </div>
    </div>
  );
};

export default Earnings;

const styles = {
  cards: {
    minWidth: "225px",
    height: "max-content",
    flex: 1,
    width: "none !important",
  },
};
