"use client";
import React from "react";
import Teachers from "@/screens/teachers/teachers";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <Teachers />;
};

export default withAuth(Page);
