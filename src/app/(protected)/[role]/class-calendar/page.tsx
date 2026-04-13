"use client";
import ClassCalendar from "@/screens/class-calendar/class-calender";
import { use } from "react";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);

  return <ClassCalendar role={role} />;
};

export default withAuth(Page);
