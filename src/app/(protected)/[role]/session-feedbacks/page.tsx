"use client";
import React from "react";
import SessionsFeedbacks from "@/screens/session-feedbacks/session-feedbacks";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <SessionsFeedbacks />;
};

export default withAuth(Page);
