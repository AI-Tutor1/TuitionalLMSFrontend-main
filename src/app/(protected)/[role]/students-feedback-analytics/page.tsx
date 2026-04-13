"use client";
import React from "react";
import StudentFeedbackAnalytics from "@/screens/studentFeedback-analytics/studentFeedback-analytics";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <StudentFeedbackAnalytics />;
};

export default withAuth(Page);
