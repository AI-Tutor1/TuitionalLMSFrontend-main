"use client";
import React, { use } from "react";
import Transactions from "@/screens/transactions/transactions";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);
  return <Transactions role={role} />;
};

export default withAuth(Page);
