"use client";
import React from "react";
import TutrProfileForm from "@/screens/tutor-profile/tutor-profile";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <TutrProfileForm />;
};

export default withAuth(Page);
