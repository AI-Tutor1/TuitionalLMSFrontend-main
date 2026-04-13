"use client";
import React from "react";
import Demo from "@/screens/demo/demo";
import { use } from "react";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);
  return role === "superAdmin" || role === "admin" ? (
    <Demo />
  ) : role === "counsellor" ? (
    <Demo />
  ) : null;
};

export default withAuth(Page);
