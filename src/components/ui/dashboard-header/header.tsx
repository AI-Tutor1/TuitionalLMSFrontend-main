"use client";
import React, { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box } from "@mui/material";
import classes from "./header.module.css";
import NotificationBox from "./notificationBox/notificationBox";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { ThemeToggle } from "@/components/ui/theme-toggle/theme-toggle";
import Image from "next/image";
import { User_Type } from "@/services/auth/auth.types";

const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAppSelector((state: any) => state?.user);
  const userRole = useAppSelector((state: any) => state?.user?.user?.roleId);
  const role = userRole === 1 ? "superAdmin" : userRole === 2 ? "admin" : "";

  // Function to format the pathname into a user-friendly title
  const formattedPathname = useMemo(() => {
    const segments = pathname
      .replace(/^\/+/, "")
      .split("/")
      .slice(1)
      .filter((segment) => segment && isNaN(Number(segment)))
      .map((segment) =>
        segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      );

    return segments.join(" ");
  }, [pathname]);

  // Check if the current route matches specific patterns
  const isSpecificPath = useMemo(() => {
    const patterns = {
      tutorProfile: new RegExp(`^/${role}/tutor-profile/\\d+$`),
      enrollmentDetails: new RegExp(`^/${role}/enrollment-details/\\d+$`),
      sessionDetails: new RegExp(`^/${role}/session-details/\\d+$`),
    };

    return {
      tutorProfile: patterns.tutorProfile.test(pathname),
      enrollmentDetails: patterns.enrollmentDetails.test(pathname),
      sessionDetails: patterns.sessionDetails.test(pathname),
    };
  }, [pathname, role]);

  // Handle back button navigation
  const handleBackClick = () => {
    if (isSpecificPath.tutorProfile) {
      router.push(`/${role}/tutor-requests`);
    } else if (isSpecificPath.enrollmentDetails) {
      router.push(`/${role}/enrollments`);
    } else if (isSpecificPath.sessionDetails) {
      router.push(`/${role}/sessions`);
    }
  };

  return (
    <header className={classes.container}>
      <div className={classes.aside1}>
        {(isSpecificPath.tutorProfile ||
          isSpecificPath.enrollmentDetails ||
          isSpecificPath.sessionDetails) && (
          <Box className={classes.backButton} onClick={handleBackClick}>
            <ArrowBackIosIcon />
          </Box>
        )}
        <h1 className={classes.heading}>{formattedPathname}</h1>
      </div>
      <div className={classes.aside2}>
        <ThemeToggle />
        <div className={classes.line}></div>
        <NotificationBox />
        <div className={classes.line}></div>
        <div className={classes.picContainer}>
          <div className={classes.picBox}>
            <Image
              src={
                (user as User_Type)?.profileImageUrl ||
                "/assets/images/demmyPic.png"
              }
              alt={(user as User_Type)?.name || ""}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
