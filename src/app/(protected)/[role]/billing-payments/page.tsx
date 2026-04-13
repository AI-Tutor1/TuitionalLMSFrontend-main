"use client";
import React, { FC, use } from "react";
import BillingPayments from "@/screens/parent-billing&Payments/parent-billing&Payments";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: FC = () => {
  return <BillingPayments />;
};

export default withAuth(Page);
