"use client";
import React, { useState, useCallback, useMemo } from "react";
import classes from "./page.module.css";
import Tabs from "@/components/global/tabs/tabs";
import AdminOngoingClasses from "@/screens/admin-ongoingClasses/admin-ongoingClasses";
import TutorInterviews from "@/screens/tutor-interviews/tutor-interviews";
import AdminOngoingDemos from "@/screens/admin-ongoingDemos/admin-ongoingDemos";
import { withAuth } from "@/utils/withAuth/withAuth";

type TabType = "Ongoing Classes" | "Tutor Interviews" | "Demo";

const SessionsPage: React.FC = () => {
  const tabsArray = useMemo(
    () => ["Ongoing Classes", "Tutor Interviews", "Demo"] as const,
    [],
  );
  const [activeTab, setActiveTab] = useState<TabType>(tabsArray[0]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as TabType);
  }, []);

  // Memoized tab content to prevent unnecessary re-renders
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case "Ongoing Classes":
        return <AdminOngoingClasses />;
      case "Demo":
        return <AdminOngoingDemos />;
      case "Tutor Interviews":
        return <TutorInterviews />;
      default:
        return <AdminOngoingDemos />;
    }
  }, [activeTab, handleTabChange]);

  return (
    <div className={classes.sessionsContainer}>
      <Tabs
        tabsArray={[...tabsArray]}
        handleTabChange={handleTabChange}
        activeTab={activeTab}
        inlineTabsStyles={{
          width: "45%",
          minWidth: "320px",
          maxWidth: "640",
        }}
      />
      {tabContent}
    </div>
  );
};

export default withAuth(SessionsPage);
