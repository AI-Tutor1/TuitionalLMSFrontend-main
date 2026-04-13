"use client";
import React from "react";
import Roles from "@/screens/roles/roles";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = () => {
  return <Roles />;
};

export default withAuth(Page);
