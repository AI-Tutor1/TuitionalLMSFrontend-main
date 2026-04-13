import React, { useState } from "react";
import classes from "./manageDemo.module.css";
import SearchBox from "@/components/global/search-box/search-box";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import Link from "next/link"; // Changed from "next/navigation"
import VisibilityIcon from "@mui/icons-material/Visibility";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";

const dummyDemoClasses = [
  {
    id: 1,
    teacher: {
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
    },
    subject: "Mathematics",
    student: {
      name: "Alex Chen",
      email: "alex.chen@example.com",
    },
    parent: {
      name: "Michael Chen",
      email: "m.chen@example.com",
      phone: "+1-234-567-8901",
    },
    grade: "Grade 8",
    dateTime: "2024-01-28T10:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/abc-123-def",
    adminFeedback: "Excellent presentation. Student engaged throughout.",
    cameraStatus: "On",
    conversation: "Active",
    status: "Completed",
    recording: true,
  },
  {
    id: 2,
    teacher: {
      name: "David Williams",
      email: "david.w@example.com",
    },
    subject: "Physics",
    student: {
      name: "Emma Thompson",
      email: "emma.t@example.com",
    },
    parent: {
      name: "Robert Thompson",
      email: "r.thompson@example.com",
      phone: "+1-234-567-8902",
    },
    grade: "Grade 10",
    dateTime: "2024-01-28T14:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/xyz-456-ghi",
    adminFeedback: "Good session. Consider more interactive examples.",
    cameraStatus: "On",
    conversation: "Active",
    status: "Scheduled",
    recording: false,
  },
  {
    id: 3,
    teacher: {
      name: "Maria Garcia",
      email: "maria.g@example.com",
    },
    subject: "Spanish",
    student: {
      name: "James Wilson",
      email: "james.w@example.com",
    },
    parent: {
      name: "Linda Wilson",
      email: "l.wilson@example.com",
      phone: "+1-234-567-8903",
    },
    grade: "Grade 7",
    dateTime: "2024-01-27T15:30:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/lmn-789-opq",
    adminFeedback: "Student was shy initially but opened up. Good progress.",
    cameraStatus: "Off",
    conversation: "Inactive",
    status: "Completed",
    recording: true,
  },
  {
    id: 4,
    teacher: {
      name: "John Smith",
      email: "john.s@example.com",
    },
    subject: "Chemistry",
    student: {
      name: "Sophia Martinez",
      email: "sophia.m@example.com",
    },
    parent: {
      name: "Carlos Martinez",
      email: "c.martinez@example.com",
      phone: "+1-234-567-8904",
    },
    grade: "Grade 11",
    dateTime: "2024-01-29T11:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/rst-012-uvw",
    adminFeedback: "Pending",
    cameraStatus: "On",
    conversation: "Active",
    status: "In Progress",
    recording: true,
  },
  {
    id: 5,
    teacher: {
      name: "Emily Brown",
      email: "emily.b@example.com",
    },
    subject: "English Literature",
    student: {
      name: "Oliver Davis",
      email: "oliver.d@example.com",
    },
    parent: {
      name: "Susan Davis",
      email: "s.davis@example.com",
      phone: "+1-234-567-8905",
    },
    grade: "Grade 9",
    dateTime: "2024-01-29T16:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/def-345-abc",
    adminFeedback: "Pending",
    cameraStatus: "Pending",
    conversation: "Pending",
    status: "Scheduled",
    recording: false,
  },
  {
    id: 6,
    teacher: {
      name: "Robert Taylor",
      email: "robert.t@example.com",
    },
    subject: "History",
    student: {
      name: "Isabella Rodriguez",
      email: "isabella.r@example.com",
    },
    parent: {
      name: "Maria Rodriguez",
      email: "m.rodriguez@example.com",
      phone: "+1-234-567-8906",
    },
    grade: "Grade 12",
    dateTime: "2024-01-26T13:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/ghi-678-jkl",
    adminFeedback: "Technical issues in the beginning but resolved quickly.",
    cameraStatus: "On",
    conversation: "Active",
    status: "Completed",
    recording: true,
  },
  {
    id: 7,
    teacher: {
      name: "Lisa Anderson",
      email: "lisa.a@example.com",
    },
    subject: "Biology",
    student: {
      name: "William Lee",
      email: "william.l@example.com",
    },
    parent: {
      name: "Jennifer Lee",
      email: "j.lee@example.com",
      phone: "+1-234-567-8907",
    },
    grade: "Grade 10",
    dateTime: "2024-01-30T09:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/mno-901-pqr",
    adminFeedback: "Pending",
    cameraStatus: "Pending",
    conversation: "Pending",
    status: "Scheduled",
    recording: false,
  },
  {
    id: 8,
    teacher: {
      name: "Michael Johnson",
      email: "michael.j@example.com",
    },
    subject: "Computer Science",
    student: {
      name: "Ava White",
      email: "ava.w@example.com",
    },
    parent: {
      name: "Thomas White",
      email: "t.white@example.com",
      phone: "+1-234-567-8908",
    },
    grade: "Grade 11",
    dateTime: "2024-01-25T17:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/stu-234-vwx",
    adminFeedback: "Excellent demonstration of coding concepts.",
    cameraStatus: "On",
    conversation: "Active",
    status: "Completed",
    recording: true,
  },
  {
    id: 9,
    teacher: {
      name: "Patricia Miller",
      email: "patricia.m@example.com",
    },
    subject: "French",
    student: {
      name: "Noah Harris",
      email: "noah.h@example.com",
    },
    parent: {
      name: "Rachel Harris",
      email: "r.harris@example.com",
      phone: "+1-234-567-8909",
    },
    grade: "Grade 6",
    dateTime: "2024-01-28T12:00:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/yza-567-bcd",
    adminFeedback: "Student needs more practice with pronunciation.",
    cameraStatus: "Off",
    conversation: "Inactive",
    status: "Cancelled",
    recording: false,
  },
  {
    id: 10,
    teacher: {
      name: "Christopher Martin",
      email: "chris.m@example.com",
    },
    subject: "Geography",
    student: {
      name: "Mia Clark",
      email: "mia.c@example.com",
    },
    parent: {
      name: "Daniel Clark",
      email: "d.clark@example.com",
      phone: "+1-234-567-8910",
    },
    grade: "Grade 8",
    dateTime: "2024-01-31T14:30:00", // Changed to ISO format
    meetingLink: "https://meet.example.com/efg-890-hij",
    adminFeedback: "Pending",
    cameraStatus: "Pending",
    conversation: "Pending",
    status: "Scheduled",
    recording: false,
  },
];

const SideActionsModal = () => {
  return (
    <div className={classes.sideActionsModal}>
      <div className={classes.childs}>
        <VisibilityIcon sx={{ height: "1rem", width: "1rem" }} />
        View Details
      </div>
      <div className={classes.childs}>
        <ChatBubbleOutlineOutlinedIcon sx={{ height: "1rem", width: "1rem" }} />
        View Feedback
      </div>
      <div className={classes.childs}>
        <EditOutlinedIcon sx={{ height: "1rem", width: "1rem" }} />
        Edit
      </div>
      <div className={classes.childs}>
        <DeleteOutlineOutlinedIcon sx={{ height: "1rem", width: "1rem" }} />
        Delete
      </div>
    </div>
  );
};

const headData = [
  { name: "Teacher", width: "10%" },
  { name: "Subject", width: "8%" },
  { name: "Student", width: "10%" },
  { name: "Parent", width: "10%" },
  { name: "Grade", width: "6%" },
  { name: "Date & Time", width: "12%" },
  { name: "Meeting Link", width: "8%" },
  { name: "Admin Feedback", width: "14%" },
  { name: "Camera Status", width: "8%" },
  { name: "Conversation", width: "10%" },
  { name: "Status", width: "6%" },
  { name: "Actions", width: "8%" },
];

const ManageDemo = () => {
  const [activeModalId, setActiveModalId] = useState<number | null>(null);

  const toggleModal = (demoId: number) => {
    setActiveModalId(activeModalId === demoId ? null : demoId);
  };

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <p>All Demo Classes Overview</p>
        <p>Manage and analyze all demo classes and their performance</p>
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
          {dummyDemoClasses?.map((demo) => (
            <div className={classes.tableRow} key={demo.id}>
              <p style={{ width: headData[0].width }}>{demo.teacher.name}</p>
              <p style={{ width: headData[1].width }}>{demo.subject}</p>
              <p style={{ width: headData[2].width }}>{demo.student.name}</p>
              <p style={{ width: headData[3].width }}>{demo.parent.name}</p>
              <p style={{ width: headData[4].width }}>{demo.grade}</p>
              <p style={{ width: headData[5].width }}>
                {new Date(demo.dateTime).toLocaleString()}
              </p>
              <Link
                href={demo.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ width: headData[6].width }}
              >
                Join Meeting
              </Link>
              <p style={{ width: headData[7].width }}>{demo.adminFeedback}</p>
              <p style={{ width: headData[8].width }}>{demo.cameraStatus}</p>
              <p style={{ width: headData[9].width }}>{demo.conversation}</p>
              <p
                className={classes.status}
                style={{ width: headData[10].width }}
              >
                {demo.status}
              </p>
              <div
                className={classes.sideActions} // Changed from sideActions
                style={{ width: headData[11].width }}
              >
                <span className={classes.threeDots}>
                  <MoreHorizOutlinedIcon onClick={() => toggleModal(demo.id)} />
                  {activeModalId === demo.id && <SideActionsModal />}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageDemo;
