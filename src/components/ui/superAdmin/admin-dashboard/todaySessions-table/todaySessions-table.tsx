import React from "react";
import { ChevronRight } from "lucide-react";
import styles from "./todaySessions-table.module.css";

type SessionStatus = "scheduled" | "completed" | "missed" | "flagged";

type Session = {
  id: number;
  time: string;
  student: string;
  tutor: string;
  subject: string;
  status: SessionStatus;
};

const sessions: Session[] = [
  {
    id: 1,
    time: "10:00 AM - 11:00 AM",
    student: "Omar Al-Farsi",
    tutor: "Sarah Johnson",
    subject: "Mathematics",
    status: "scheduled",
  },
  {
    id: 2,
    time: "11:30 AM - 12:30 PM",
    student: "Layla Ahmed",
    tutor: "John Smith",
    subject: "English Literature",
    status: "completed",
  },
  {
    id: 3,
    time: "1:00 PM - 2:00 PM",
    student: "Mohammed Al-Qahtani",
    tutor: "Ahmed Hassan",
    subject: "Physics",
    status: "scheduled",
  },
  {
    id: 4,
    time: "3:00 PM - 4:00 PM",
    student: "Aisha Malik",
    tutor: "Maria Garcia",
    subject: "Chemistry",
    status: "flagged",
  },
  {
    id: 5,
    time: "5:00 PM - 6:00 PM",
    student: "Khalid Sharif",
    tutor: "Ahmed Hassan",
    subject: "Biology",
    status: "missed",
  },
];

interface StatusStyle {
  className: string;
  label: string;
}

function getStatusBadge(status: SessionStatus): StatusStyle {
  switch (status) {
    case "scheduled":
      return { className: styles.badgeScheduled, label: "Scheduled" };
    case "completed":
      return { className: styles.badgeCompleted, label: "Completed" };
    case "missed":
      return { className: styles.badgeMissed, label: "Missed" };
    case "flagged":
      return { className: styles.badgeFlagged, label: "Flagged" };
    default:
      return { className: styles.badgeDefault, label: status };
  }
}

const TodaysSessionsTable: React.FC<{ inLineStyles?: React.CSSProperties }> = ({
  inLineStyles,
}) => {
  return (
    <div className={styles.container} style={inLineStyles}>
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h3 className={styles.title}>Today's Activity</h3>
          <p className={styles.subtitle}>May 20, 2025</p>
        </div>
        <div className={styles.viewCalendarButton}>
          View Calendar <ChevronRight className={styles.chevronIcon} />
        </div>
      </div>

      <div className={styles.sessionsList}>
        {sessions.map((session) => {
          const statusStyle = getStatusBadge(session.status);

          return (
            <div key={session.id} className={styles.sessionItem}>
              <div className={styles.sessionHeader}>
                <div className={styles.sessionInfo}>
                  <p className={styles.sessionTitle}>
                    {session.subject} • {session.time}
                  </p>
                  <p className={styles.studentInfo}>
                    Student: {session.student}
                  </p>
                  <p className={styles.tutorInfoMobile}>
                    Tutor: {session.tutor}
                  </p>
                  <p className={styles.tutorInfoDesktop}>
                    Student: {session.student} • Tutor: {session.tutor}
                  </p>
                </div>
                <span
                  className={statusStyle.className}
                  style={{ padding: "10px" }}
                >
                  {statusStyle.label}
                </span>
              </div>

              <div className={styles.actionButtons}>
                <div className={styles.viewButton}>View</div>
                {session.status === "scheduled" && (
                  <div className={styles.rescheduleButton}>Reschedule</div>
                )}
                {(session.status === "flagged" ||
                  session.status === "missed") && (
                  <div className={styles.followUpButton}>Follow Up</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodaysSessionsTable;
