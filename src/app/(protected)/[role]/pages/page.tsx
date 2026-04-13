"use client";
import React from "react";
import Pages from "@/screens/pages/page";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = () => {
  return <Pages />;
};

export default withAuth(Page);
