"use client";
import React from "react";
import { withAuth } from "@/utils/withAuth/withAuth";
import ChurnResources from "@/screens/churn-resources/churn-resources";

const Page = () => {
  return <ChurnResources />;
};

export default withAuth(Page);
