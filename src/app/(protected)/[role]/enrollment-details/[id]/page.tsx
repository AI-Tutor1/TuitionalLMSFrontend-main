"use client";
import React from "react";
import EnrollmentDetailsForm from "@/screens/enrollment-details/enrollment-details";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <EnrollmentDetailsForm />;
};

export default withAuth(Page);
