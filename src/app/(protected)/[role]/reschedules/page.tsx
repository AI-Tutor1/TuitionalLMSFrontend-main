"use client";
import React, { FC } from "react";
import Reschedules from "@/screens/reschedules/reschedules";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: FC = () => {
  return <Reschedules />;
};

export default withAuth(Page);
