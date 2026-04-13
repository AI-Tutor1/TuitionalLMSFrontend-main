"use client";
import React from "react";
import SessionForm from "@/screens/sessions/sessions";
import { withAuth } from "@/utils/withAuth/withAuth";


const Page: React.FC = () => {
  return <SessionForm />;
};

export default withAuth(Page);
