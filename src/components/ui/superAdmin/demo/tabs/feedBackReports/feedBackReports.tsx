import React, { useState } from "react";
import classes from "./feedBackReports.module.css";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SearchBox from "@/components/global/search-box/search-box";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";

const dummyDemoClasses = [
  {
    id: 1,
    teacher: "Sarah Johnson",
    student: "Alex Chen",
    subject: { name: "Mathematics", topic: "Algebra" },
    date: "2025-07-15T16:00:00", // Today at 4 PM
    performance: { clarity: "Good", confidence: "High" },
    status: "Pending",
  },
  {
    id: 2,
    teacher: "David Williams",
    student: "Emma Thompson",
    subject: { name: "Physics", topic: "Classical Mechanics" },
    date: "2025-07-16T10:00:00", // Tomorrow at 10 AM
    performance: { clarity: "Average", confidence: "Medium" },
    status: "Pending",
  },
  {
    id: 3,
    teacher: "Maria Garcia",
    student: "James Wilson",
    subject: { name: "Spanish", topic: "Grammar Basics" },
    date: "2025-07-16T14:30:00", // Tomorrow at 2:30 PM
    performance: { clarity: "Excellent", confidence: "Very High" },
    status: "Pending",
  },
  {
    id: 4,
    teacher: "John Smith",
    student: "Sophia Martinez",
    subject: { name: "Chemistry", topic: "Organic Chemistry" },
    date: "2025-07-17T11:00:00", // Day after tomorrow at 11 AM
    performance: { clarity: "Pending", confidence: "Pending" },
    status: "Pending",
  },
  {
    id: 5,
    teacher: "Emily Brown",
    student: "Oliver Davis",
    subject: { name: "English Literature", topic: "Shakespeare" },
    date: "2025-07-17T15:00:00", // Day after tomorrow at 3 PM
    performance: { clarity: "Pending", confidence: "Pending" },
    status: "Pending",
  },
  {
    id: 6,
    teacher: "Robert Taylor",
    student: "Isabella Rodriguez",
    subject: { name: "History", topic: "World War II" },
    date: "2025-07-18T09:00:00", // Friday at 9 AM
    performance: { clarity: "Pending", confidence: "Pending" },
    status: "Pending",
  },
  {
    id: 7,
    teacher: "Lisa Anderson",
    student: "William Lee",
    subject: { name: "Biology", topic: "Cell Structure" },
    date: "2025-07-18T13:30:00", // Friday at 1:30 PM
    performance: { clarity: "Pending", confidence: "Pending" },
    status: "Pending",
  },
  {
    id: 8,
    teacher: "Michael Johnson",
    student: "Ava White",
    subject: { name: "Computer Science", topic: "Programming Basics" },
    date: "2025-07-21T10:00:00", // Next Monday at 10 AM
    performance: { clarity: "Pending", confidence: "Pending" },
    status: "Pending",
  },
  {
    id: 9,
    teacher: "Patricia Miller",
    student: "Noah Harris",
    subject: { name: "French", topic: "Pronunciation" },
    date: "2025-07-21T14:00:00", // Next Monday at 2 PM
    performance: { clarity: "Pending", confidence: "Pending" },
    status: "Submitted",
  },
  {
    id: 10,
    teacher: "Christopher Martin",
    student: "Mia Clark",
    subject: { name: "Geography", topic: "Climate Change" },
    date: "2025-07-22T11:30:00", // Next Tuesday at 11:30 AM
    performance: { clarity: "Pending", confidence: "Pending" },
    status: "Pending",
  },
  {
    id: 11,
    teacher: "Jennifer Davis",
    student: "Ethan Brown",
    subject: { name: "Art", topic: "Watercolor Techniques" },
    date: "2025-07-14T10:00:00", // Yesterday - completed session
    performance: { clarity: "Excellent", confidence: "Very High" },
    status: "Submitted",
  },
  {
    id: 12,
    teacher: "Mark Wilson",
    student: "Sophia Lee",
    subject: { name: "Music", topic: "Piano Fundamentals" },
    date: "2025-07-13T14:00:00", // Day before yesterday - completed session
    performance: { clarity: "Good", confidence: "High" },
    status: "Submitted",
  },
  {
    id: 13,
    teacher: "Amanda Clark",
    student: "Ryan Martinez",
    subject: { name: "Drama", topic: "Acting Techniques" },
    date: "2025-07-12T11:30:00", // Three days ago - completed session
    performance: { clarity: "Needs Improvement", confidence: "Low" },
    status: "Pending",
  },
];

const headData = [
  { name: "Teacher", width: "13%" },
  { name: "Student", width: "13%" },
  { name: "Subject", width: "15%" },
  { name: "Date & Time", width: "10%" },
  { name: "Performance", width: "18%" },
  { name: "Status", width: "10%" },
  { name: "Actions", width: "21%" },
];

interface FeedBackReportsProps {
  handleFeedbackReportModalOpen: () => void;
}

const FeedBackReports: React.FC<FeedBackReportsProps> = ({
  handleFeedbackReportModalOpen,
}) => {
  const [activeModalId, setActiveModalId] = useState<number | null>(null);

  const toggleModal = (demoId: number) => {
    setActiveModalId(activeModalId === demoId ? null : demoId);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { dateStr, timeStr };
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div>
          <span>
            <DescriptionOutlinedIcon sx={{ width: "2rem", height: "2rem" }} />
          </span>
          <p>Demo Sessions & Feedback Reports</p>
        </div>
        <p>View all demo sessions and collect feedback after completion</p>
      </div>
      <SearchBox
        placeholder="Search by Teacher, Student, or Subject"
        iconColor="var(--black-color)"
        inlineIconBoxStyles={{
          background: "#fff",
          boxShadow: "0px -1px 10px 0px #d6d6d6 inset",
        }}
        inlineStyles={{
          width: "25%",
          minWidth: "max-content",
          background: "#fff",
          boxShadow: "0px -1px 10px 0px #d6d6d6 inset",
        }}
      />
      <div className={classes.table}>
        <div className={classes.tableHeader}>
          {headData.map((header, index) => (
            <p key={index} style={{ width: header.width }}>
              {header.name}
            </p>
          ))}
        </div>
        <div className={classes.tableBody}>
          {dummyDemoClasses?.map((demo) => {
            const { dateStr, timeStr } = formatDateTime(demo.date);

            return (
              <div className={classes.tableRow} key={demo.id}>
                <p style={{ width: headData[0].width }}>{demo.teacher}</p>
                <p style={{ width: headData[1].width }}>{demo.student}</p>
                <div
                  style={{ width: headData[2].width }}
                  className={classes.subject}
                >
                  <strong>{demo.subject.name}</strong>
                  {demo.subject.topic}
                </div>
                <div
                  style={{ width: headData[3].width }}
                  className={classes.dateTime}
                >
                  <strong>{dateStr}</strong>
                  <br />
                  {timeStr}
                </div>
                <div
                  className={classes.performance}
                  style={{ width: headData[4].width }}
                >
                  <p>
                    Clarity: &nbsp;
                    <span
                      className={classes.status}
                      style={{
                        color:
                          demo.performance.clarity === "Good"
                            ? "rgba(30, 64, 175, 1)"
                            : demo.performance.clarity === "Excellent"
                            ? "rgba(22, 101, 52, 1)"
                            : "rgba(133, 77, 14, 1)",
                        backgroundColor:
                          demo.performance.clarity === "Good"
                            ? "rgba(219, 234, 254,1)"
                            : demo.performance.clarity === "Excellent"
                            ? "rgba(220, 252, 231, 1)"
                            : "rgba(254, 249, 195, 1)",
                      }}
                    >
                      {" "}
                      {demo.performance.clarity}
                    </span>
                  </p>
                  <p>
                    Confidence: &nbsp;
                    <span
                      className={classes.status}
                      style={{
                        color:
                          demo.performance.confidence === "High"
                            ? "rgba(30, 64, 175, 1)"
                            : demo.performance.confidence === " Very High"
                            ? "rgba(22, 101, 52, 1)"
                            : "rgba(133, 77, 14, 1)",
                        backgroundColor:
                          demo.performance.confidence === "High"
                            ? "rgba(219, 234, 254,1)"
                            : demo.performance.confidence === " Very High"
                            ? "rgba(220, 252, 231, 1)"
                            : "rgba(254, 249, 195, 1)",
                      }}
                    >
                      {" "}
                      {demo.performance.confidence}
                    </span>
                  </p>
                </div>
                <p
                  style={{
                    width: headData[5].width,
                  }}
                >
                  <span
                    className={classes.status}
                    style={{
                      color:
                        demo.status === "Submitted"
                          ? "rgba(22, 101, 52, 1)"
                          : "rgba(133, 77, 14, 1)",
                      backgroundColor:
                        demo.status === "Submitted"
                          ? "rgba(220, 252, 231, 1)"
                          : "rgba(254, 249, 195, 1)",
                    }}
                  >
                    {demo.status}
                  </span>
                </p>
                <div
                  className={classes.sideActions}
                  style={{ width: headData[6].width }}
                >
                  <span
                    className={classes.action}
                    onClick={handleFeedbackReportModalOpen}
                  >
                    <VisibilityIcon sx={{ height: "1rem", width: "1rem" }} />
                    View
                  </span>
                  <span className={classes.action}>
                    <FileDownloadOutlinedIcon
                      sx={{ height: "1rem", width: "1rem" }}
                    />
                    PDF
                  </span>
                  <span
                    className={classes.action}
                    style={{
                      color: "var(--main-color)",
                      borderColor: "var(--main-color)",
                    }}
                  >
                    <FileUploadOutlinedIcon
                      sx={{
                        height: "1rem",
                        width: "1rem",
                        color: "var(--main-color)",
                      }}
                    />
                    Share
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeedBackReports;
