"use client";
import React from "react";
import Permission from "@/screens/permissions/permissions";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = () => {
  return <Permission />;
};

export default withAuth(Page);
