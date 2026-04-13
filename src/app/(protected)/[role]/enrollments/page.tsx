"use client";
import React from "react";
import EnrollmentForm from "@/screens/enrollments/enrollments";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <EnrollmentForm />;
};

export default withAuth(Page);
