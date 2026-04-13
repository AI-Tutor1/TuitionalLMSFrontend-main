"use client";
import { withAuth } from "@/utils/withAuth/withAuth";
import React, { use } from "react";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);
  return <p>Settings</p>;
};

export default withAuth(Page);
