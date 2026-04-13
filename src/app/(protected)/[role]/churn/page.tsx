"use client";
import React from "react";
import Churn from "@/screens/churn/churn";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = () => {
  return <Churn />;
};

export default withAuth(Page);
