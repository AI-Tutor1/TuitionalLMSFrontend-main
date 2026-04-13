"use client";
import React from "react";
import Policies from "@/screens/policies/policies";
import { use } from "react";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  // const { role } = use(params);
  return <Policies />;
};

export default withAuth(Page);
