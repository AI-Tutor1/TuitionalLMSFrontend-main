"use client";
import React, { use, useMemo } from "react";
import UsersForm from "@/screens/users/user-form";
import { withAuth } from "@/utils/withAuth/withAuth";

const Page = ({ params }: { params: Promise<{ role: string }> }) => {
  const { role } = use(params);
  const allowedRoles = useMemo(() => {
    return ["superAdmin", "admin", "counsellor", "hr", "manager"];
  }, []);

  return allowedRoles.includes(role) ? <UsersForm /> : null;
};

export default withAuth(Page);
