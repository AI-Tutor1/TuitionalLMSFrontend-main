"use client";
import React from "react";
import { use } from "react";
import AdminDashboard from "@/screens/admin-dashboard/admin-dashboard";
import StudentTeacherDashboard from "@/screens/student-teacher-dashboard/student-teacher-dashboard";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);

  return role === "student" || role === "teacher" || role === "parent" ? (
    <StudentTeacherDashboard />
  ) : (
    <AdminDashboard />
  );
};

export default withAuth(Page);
