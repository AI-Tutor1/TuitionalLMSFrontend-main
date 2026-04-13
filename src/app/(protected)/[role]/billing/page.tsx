"use client";
import React from "react";
import Billing from "@/screens/billing/billing";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <Billing />;
};

export default withAuth(Page);
