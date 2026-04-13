"use client";
import React from "react";
import EnrollmentLogs from "@/screens/enrollment-logs/enrollment-logs";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <EnrollmentLogs />;
};

export default withAuth(Page);
