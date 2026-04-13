"use client";
import React, { FC } from "react";
import Earnings from "@/screens/tutor-earnings/tutor-earnings";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: FC = () => {
  return <Earnings />;
};

export default withAuth(Page);
