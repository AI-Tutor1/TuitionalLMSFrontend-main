"use client";
import React from "react";
import Invoices from "@/screens/invoices/invoices";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <Invoices />;
};

export default withAuth(Page);
