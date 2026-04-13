"use client";
import React, { use } from "react";
import TransactionsDetails from "@/screens/transaction-details/transactions-details";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);
  return <TransactionsDetails />;
};

export default withAuth(Page);
