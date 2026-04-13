"use client";
import React from "react";
import CurriculumForm from "@/screens/curriculum/curriculum";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page: React.FC = () => {
  return <CurriculumForm />;
};

export default withAuth(Page);
