"use client";
import AdminClassSchedule from "@/screens/class-schedule/class-schedule";
import StudentTeacherClassSchedule from "@/screens/student-teacher-classSchedules/student-teacher-classSchedules";
import { use } from "react";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);
  return role === "admin" || role === "superAdmin" ? (
    <AdminClassSchedule />
  ) : role === "student" || role === "teacher" ? (
    <StudentTeacherClassSchedule />
  ) : null;
};

export default withAuth(Page);
