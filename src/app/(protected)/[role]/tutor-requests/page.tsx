"use client";
import React from "react";
import TutorRequestForm from "@/screens/tutor-request/tutor-request";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <TutorRequestForm />;
};

export default withAuth(Page);
