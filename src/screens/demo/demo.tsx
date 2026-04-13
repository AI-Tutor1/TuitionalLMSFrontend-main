"use client";
import React, { useState, useCallback, useMemo, memo } from "react";
import classes from "./demo.module.css";
import DemoCard from "@/components/ui/superAdmin/demo/demoCard/demoCard";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ShowChartOutlinedIcon from "@mui/icons-material/ShowChartOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import Tabs from "@/components/global/tabs/tabs";
import CreateDemoLink from "@/components/ui/superAdmin/demo/tabs/createDemoLink/createDemoLink";
import UpcomingDemos from "@/components/ui/superAdmin/demo/tabs/upcomingDemos/upcomingDemos";
import ManageDemo from "@/components/ui/superAdmin/demo/tabs/manageDemo/manageDemo";
import FeedBackReports from "@/components/ui/superAdmin/demo/tabs/feedBackReports/feedBackReports";
import TeacherPerformance from "@/components/ui/superAdmin/demo/tabs/teacherPerformance/teacherPerformance";
import FeedBackModal from "@/components/ui/superAdmin/demo/feedBack-modal/feedBack-modal";
import FeedBackReprtModal from "@/components/ui/superAdmin/demo/feedBackReport-modal/feedBackReport-modal";

// Static data with memoized icons to prevent recreation
const DEMO_CARDS_DATA = [
  {
    id: "total-demos",
    heading: "Total Demos",
    number: 1,
    icon: <CalendarMonthOutlinedIcon />,
    text: "This is a demo card.",
  },
  {
    id: "conversion-rate",
    heading: "Avg Conversion Rate",
    number: 72,
    icon: <ShowChartOutlinedIcon />,
    text: "+5% from last month",
  },
  {
    id: "students-converted",
    heading: "Students Converted",
    number: 56,
    icon: <PeopleAltOutlinedIcon />,
    text: "From 76 total attendees",
  },
  {
    id: "feedback-reports",
    heading: "Feedback Reports",
    number: 3,
    icon: <DescriptionOutlinedIcon />,
    text: "Teacher feedback submitted",
  },
] as const;

// Static tabs configuration - Fixed: Remove 'as const' to make it mutable
const TABS_CONFIG = [
  "Create Demo Link",
  "Upcoming Demos",
  "Manage All Demos",
  "Teacher Performance",
  "Feedback  Reports",
];

// Memoized tab styles to prevent recreation
const TAB_STYLES = {
  inlineTabsStyles: { borderRadius: "7.5px" },
  borderRadius: "5px",
} as const;

// Modal configurations
const MODAL_CONFIG = {
  feedback: {
    heading: "Admin Feedback Collection",
    subHeading:
      "Collect feedback for Arjun Kumar's Chemistry demo session with Emily Davis",
  },
  feedbackReport: {
    heading: "Demo Class Feedback Report",
    subHeading:
      "Detailed feedback report for Rahul Sharma's Mathematics demo session",
  },
} as const;

// Memoized individual card component to prevent unnecessary re-renders
const MemoizedDemoCard = memo(DemoCard);

// Memoized tab components to prevent unnecessary re-renders
const MemoizedCreateDemoLink = memo(CreateDemoLink);
const MemoizedUpcomingDemos = memo(UpcomingDemos);
const MemoizedManageDemo = memo(ManageDemo);
const MemoizedTeacherPerformance = memo(TeacherPerformance);
const MemoizedFeedBackReports = memo(FeedBackReports);
const MemoizedTabs = memo(Tabs);
const MemoizedFeedBackModal = memo(FeedBackModal);
const MemoizedFeedBackReprtModal = memo(FeedBackReprtModal);

// Memoized cards container to prevent re-rendering when parent re-renders
const MemoizedCardsContainer = memo(() => {
  const cardList = useMemo(
    () =>
      DEMO_CARDS_DATA.map((item) => (
        <MemoizedDemoCard
          key={item.id}
          heading={item.heading}
          number={item.number}
          icon={item.icon}
          text={item.text}
        />
      )),
    []
  );

  return <div className={classes.cardBox}>{cardList}</div>;
});

MemoizedCardsContainer.displayName = "MemoizedCardsContainer";

// Memoized tab content component to prevent unnecessary re-renders
const MemoizedTabContent = memo(
  ({
    activeTab,
    onFeedbackModalOpen,
    onFeedbackReportModalOpen,
  }: {
    activeTab: string;
    onFeedbackModalOpen: () => void;
    onFeedbackReportModalOpen: () => void;
  }) => {
    const tabContent = useMemo(() => {
      switch (activeTab) {
        case "Create Demo Link":
          return <MemoizedCreateDemoLink />;
        case "Upcoming Demos":
          return (
            <MemoizedUpcomingDemos
              handleFeedbackModalOpen={onFeedbackModalOpen}
            />
          );
        case "Manage All Demos":
          return <MemoizedManageDemo />;
        case "Teacher Performance":
          return <MemoizedTeacherPerformance />;
        case "Feedback  Reports":
          return (
            <MemoizedFeedBackReports
              handleFeedbackReportModalOpen={onFeedbackReportModalOpen}
            />
          );
        default:
          return <MemoizedCreateDemoLink />;
      }
    }, [activeTab, onFeedbackModalOpen, onFeedbackReportModalOpen]);

    return <>{tabContent}</>;
  }
);

MemoizedTabContent.displayName = "MemoizedTabContent";

const Demo = () => {
  const [activeTab, setActiveTab] = useState<string>("Create Demo Link");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackReportModalOpen, setFeedbackReportModalOpen] = useState(false);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleFeedbackModalOpen = useCallback(() => {
    setFeedbackModalOpen(true);
  }, []);

  const handleFeedbackModalClose = useCallback(() => {
    setFeedbackModalOpen(false);
  }, []);

  const handleFeedbackReportModalOpen = useCallback(() => {
    setFeedbackReportModalOpen(true);
  }, []);

  const handleFeedbackReportModalClose = useCallback(() => {
    setFeedbackReportModalOpen(false);
  }, []);

  // Memoized tabs props to prevent unnecessary re-renders
  const tabsProps = useMemo(
    () => ({
      tabsArray: TABS_CONFIG,
      activeTab,
      handleTabChange,
      inlineTabsStyles: TAB_STYLES.inlineTabsStyles,
      borderRadius: TAB_STYLES.borderRadius,
    }),
    [activeTab, handleTabChange]
  );

  // Memoized modal props to prevent unnecessary re-renders
  const feedbackModalProps = useMemo(
    () => ({
      heading: MODAL_CONFIG.feedback.heading,
      subHeading: MODAL_CONFIG.feedback.subHeading,
      modalOpen: feedbackModalOpen,
      handleClose: handleFeedbackModalClose,
    }),
    [feedbackModalOpen, handleFeedbackModalClose]
  );

  const feedbackReportModalProps = useMemo(
    () => ({
      heading: MODAL_CONFIG.feedbackReport.heading,
      subHeading: MODAL_CONFIG.feedbackReport.subHeading,
      modalOpen: feedbackReportModalOpen,
      handleClose: handleFeedbackReportModalClose,
    }),
    [feedbackReportModalOpen, handleFeedbackReportModalClose]
  );

  return (
    <>
      <div className={classes.container}>
        <MemoizedCardsContainer />
        <MemoizedTabs {...tabsProps} />
        <MemoizedTabContent
          activeTab={activeTab}
          onFeedbackModalOpen={handleFeedbackModalOpen}
          onFeedbackReportModalOpen={handleFeedbackReportModalOpen}
        />
      </div>

      {/* modals */}
      <MemoizedFeedBackModal {...feedbackModalProps} />
      <MemoizedFeedBackReprtModal {...feedbackReportModalProps} />
    </>
  );
};

export default memo(Demo);
