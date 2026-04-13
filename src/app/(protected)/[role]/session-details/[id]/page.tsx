"use client";

import React from "react";
import SessionDetailForm from "@/screens/session-details/session-details";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <SessionDetailForm />;
};

export default withAuth(Page);
