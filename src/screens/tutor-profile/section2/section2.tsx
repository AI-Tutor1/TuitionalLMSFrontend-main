"use client";
import { useState, useMemo, memo, useCallback } from "react";
import { Box } from "@mui/material";
import styles from "./section2.module.css";
import AboutTab from "./tabs-view/about-tab/about-tab";
import EducationTab from "./tabs-view/education-tab/education-tab";
import AvailabilityTab from "./tabs-view/availability-tab/availability-tab";
import Tabs from "@/components/global/tabs/tabs";
import moment from "moment";

interface Section2Props {
  userData: any;
}

const Section2: React.FC<Section2Props> = ({ userData }) => {
  const inlineTabsStyles = useMemo(
    () => ({
      height: "max-content",
    }),
    []
  );
  const tabsArray = useMemo(() => {
    return ["About", "Education", "Availability"];
  }, []);

  const [activeTab, setActiveTab] = useState<string>("About");

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Memoize parsed data to avoid recalculation
  const parsedJsonData = useMemo(() => {
    return userData?.parsed_jsonData || {};
  }, [userData?.parsed_jsonData]);

  // Memoize tab content props
  const aboutTabProps = useMemo(
    () => ({
      video: parsedJsonData?.video,
      gender: parsedJsonData?.gender,
      country: parsedJsonData?.country,
      availability: `${parsedJsonData?.hoursPerWeek} Hr/Week`,
      date: moment(userData?.createdAt).format("D MMM YYYY"),
    }),
    [
      parsedJsonData?.video,
      parsedJsonData?.gender,
      parsedJsonData?.country,
      parsedJsonData?.hoursPerWeek,
      userData?.createdAt,
    ]
  );

  const availabilityTabProps = useMemo(
    () => ({
      schedule: parsedJsonData?.schedule,
    }),
    [parsedJsonData?.schedule]
  );

  const educationTabProps = useMemo(
    () => ({
      cv: parsedJsonData?.document,
      university: parsedJsonData?.university,
      degree: parsedJsonData?.degree,
      degreeType: parsedJsonData?.degreeType,
      year: parsedJsonData?.endOfStudy,
      firstName: parsedJsonData?.firstName,
      lastName: parsedJsonData?.lastName,
    }),
    [
      parsedJsonData?.document,
      parsedJsonData?.university,
      parsedJsonData?.degree,
      parsedJsonData?.degreeType,
      parsedJsonData?.endOfStudy,
      parsedJsonData?.firstName,
      parsedJsonData?.lastName,
    ]
  );

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case "About":
        return <AboutTab {...aboutTabProps} />;
      case "Education":
        return <EducationTab {...educationTabProps} />;
      case "Availability":
        return <AvailabilityTab {...availabilityTabProps} />;
      default:
        return null;
    }
  }, [activeTab, aboutTabProps, educationTabProps, availabilityTabProps]);

  return (
    <Box className={styles.box}>
      <Tabs
        tabsArray={tabsArray}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        inlineTabsStyles={inlineTabsStyles}
      />
      {renderTabContent()}
    </Box>
  );
};

export default memo(Section2);
