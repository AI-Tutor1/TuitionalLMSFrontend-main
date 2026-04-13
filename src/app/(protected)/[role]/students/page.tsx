"use client";

import React from "react";
import Students from "@/screens/students/students";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <Students />;
};

export default withAuth(Page);
