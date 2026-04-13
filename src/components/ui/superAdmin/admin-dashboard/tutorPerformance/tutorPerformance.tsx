import React from "react";
import { ChevronRight } from "lucide-react";
import styles from "./tutorPerformance.module.css";

interface Tutor {
  id: number;
  name: string;
  subject: string;
  sessions: number;
  rating: number;
  pendingPayout: number;
}

const tutors: Tutor[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    subject: "Mathematics",
    sessions: 28,
    rating: 4.9,
    pendingPayout: 1240,
  },
  {
    id: 2,
    name: "Ahmed Hassan",
    subject: "Physics",
    sessions: 23,
    rating: 4.8,
    pendingPayout: 980,
  },
  {
    id: 3,
    name: "Maria Garcia",
    subject: "Chemistry",
    sessions: 19,
    rating: 4.7,
    pendingPayout: 760,
  },
  {
    id: 4,
    name: "John Smith",
    subject: "English",
    sessions: 15,
    rating: 4.6,
    pendingPayout: 600,
  },
];

const TutorPerformance: React.FC<{ inLineStyles?: React.CSSProperties }> = ({
  inLineStyles,
}) => {
  return (
    <div className={styles.container} style={inLineStyles}>
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h3 className={styles.title}>Top Performing Tutors</h3>
          <p className={styles.subtitle}>This month</p>
        </div>
        <div className={styles.viewAllButton}>
          View All <ChevronRight className={styles.chevronIcon} />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.headerCell}>Tutor</th>
                <th className={styles.headerCell}>Sessions</th>
                <th className={styles.headerCell}>Rating</th>
                <th className={styles.headerCell}>Pending</th>
                <th
                  className={`${styles.headerCell} ${styles.headerCellRight}`}
                ></th>
              </tr>
            </thead>
            <tbody>
              {tutors?.map((tutor) => (
                <tr key={tutor.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.tutorNameBox}>
                      <div className={styles.tutorName}>{tutor.name}</div>
                      <div className={styles.tutorSubject}>{tutor.subject}</div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>{tutor.sessions}</td>
                  <td className={styles.tableCell}>
                    <span className={styles.ratingBadge}>{tutor.rating}</span>
                  </td>
                  <td className={styles.tableCell}>${tutor.pendingPayout}</td>
                  <td
                    className={`${styles.tableCell} ${styles.tableCellRight}`}
                  >
                    <div className={styles.viewButton}>View</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TutorPerformance;
