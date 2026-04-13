"use client";
// import ClassCalendarV1 from "@/screens/class-calendar-v1/class-calender";
import { use } from "react";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);

  // return <ClassCalendarV1 role={role} />;
  return <></>;
};

export default withAuth(Page);
