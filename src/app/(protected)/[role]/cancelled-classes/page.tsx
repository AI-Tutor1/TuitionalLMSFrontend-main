"use client";
import React from "react";
import CancelledClasses from "@/screens/cancelled-classes/cancelled-classes";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <CancelledClasses />;
};

export default withAuth(Page);
