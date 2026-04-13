"use client";
import React from "react";
import Chat from "@/screens/chat/chat";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <Chat />;
};

export default withAuth(Page);
