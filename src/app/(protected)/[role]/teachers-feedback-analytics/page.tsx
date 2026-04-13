"use client";
import React from "react";
import { withAuth } from "@/utils/withAuth/withAuth";
import TeacherFeedbacksAnalytics from "@/screens/teachersFeedback-analytics/teachersFeedback-analytics";

const Page = () => {
  return <TeacherFeedbacksAnalytics />;
};

export default withAuth(Page);
