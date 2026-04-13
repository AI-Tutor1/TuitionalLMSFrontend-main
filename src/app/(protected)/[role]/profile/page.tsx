"use client";
import React from "react";
import StudetProfile from "@/screens/teacher-student-profile/profile";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <StudetProfile />;
};

export default withAuth(Page);
