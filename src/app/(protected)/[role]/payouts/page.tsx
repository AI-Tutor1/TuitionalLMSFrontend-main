"use client";
import React from "react";
import TutorPayouts from "@/screens/payouts/payouts";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <TutorPayouts />;
};

export default withAuth(Page);
