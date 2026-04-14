import React, { FC, useMemo } from "react";
import classes from "./card.module.css";
import moment from "moment";
import Image from "next/image";
import { useMediaQuery } from "react-responsive";

interface Student {
  user?: {
    name?: string;
    profileImageUrl?: string;
  };
}

interface CardProps {
  time: string;
  tutor?: {
    name?: string;
    profileImageUrl?: string;
  };
  subject: string;
  board?: string;
  grade?: string;
  curriculum?: string;
  status?: string;
  expectedStudents?: Student[];
  role?: "teacher" | "student" | "parent";
}

const DEFAULT_IMAGE = "/assets/images/dummyPic.png";

const Card: FC<CardProps> = ({
  time,
  tutor,
  subject,
  status,
  expectedStudents = [],
  role,
}) => {
  const isLarge = useMediaQuery({ query: "(max-width: 1200px)" });
  const hasStudents = expectedStudents && expectedStudents.length > 0;

  // Format student name
  const formatStudentName = (student: Student) => {
    if (!student?.user?.name) return "No Show";

    try {
      const firstName = student.user.name.split(" ")[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    } catch {
      return "No Show";
    }
  };

  // Memoize date and time formats
  const formattedTime = useMemo(() => {
    if (!time) return { day: "No Show", date: "No Show", clock: "No Show" };

    try {
      const momentTime = moment.utc(time).local();
      return {
        day: momentTime.format("dddd"),
        date: momentTime.format("Do-MMM-YYYY"),
        clock: momentTime.format("HH:mm A"),
      };
    } catch {
      return { day: "No Show", date: "No Show", clock: "No Show" };
    }
  }, [time]);

  // Memoize status styles
  const statusStyle = useMemo(() => {
    const styles = {
      color: "#CC5500",
      backgroundColor: "#f9e79f",
      borderRadius: "5px",
      padding: "5px 10px",
      textAlign: "center" as const,
      width: "max-content",
    };

    if (!status) return styles;

    switch (status) {
      case "Cancelled":
        return { ...styles, color: "#653838", backgroundColor: "#FFACAC" };
      case "Conducted":
        return { ...styles, color: "#286320", backgroundColor: "#A0FFC0" };
      case "Student Absent":
        return { ...styles, color: "#05445e", backgroundColor: "#85ddee" };
      case "Teacher Absent":
        return { ...styles, color: "#2F3282", backgroundColor: "#DBDCFF" };
      default:
        return styles;
    }
  }, [status]);

  // Memoize student display info
  const studentDisplay = useMemo(() => {
    if (!hasStudents) return null;

    const visibleStudents = expectedStudents.slice(0, 2);
    const formattedNames = visibleStudents.map((student, index) => {
      if (index === 0) return formatStudentName(student);
      return `, ${formatStudentName(student)}`;
    });

    const additionalCount =
      expectedStudents.length > 2 ? expectedStudents.length - 2 : 0;

    return {
      visibleStudents,
      formattedNames,
      additionalCount,
    };
  }, [hasStudents, expectedStudents]);

  // Render student section
  const renderStudentSection = () => {
    if (!hasStudents || !studentDisplay) return null;

    return (
      <div className={classes.studentsBox}>
        <div className={classes.imagesBox}>
          {studentDisplay.visibleStudents.map((student, index) => (
            <div key={`student-${index}`} className={classes.imageBox}>
              <Image
                src={student?.user?.profileImageUrl || DEFAULT_IMAGE}
                alt={student?.user?.name || "Student"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
        <p>
          {studentDisplay.formattedNames}
          {studentDisplay.additionalCount > 0 && (
            <>
              &nbsp;
              <span className={classes.more}>
                {`+${studentDisplay.additionalCount} more`}
              </span>
            </>
          )}
        </p>
      </div>
    );
  };

  // Render tutor section
  const renderTutorSection = () => {
    return (
      <div className={classes.tutorBox}>
        <div className={classes.imageBox}>
          <Image
            src={tutor?.profileImageUrl || DEFAULT_IMAGE}
            alt="Tutor profile image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <p>{tutor?.name?.split(" ").slice(0, 2).join(" ") || "No Show"}</p>
      </div>
    );
  };

  // Render parent info section (both students and tutor)
  const renderParentInfoSection = () => {
    return (
      <div className={classes.parentInfoBox}>
        {hasStudents && (
          <div className={classes.parentStudentsSection}>
            <span className={classes.sectionLabel}>Students:</span>
            {renderStudentSection()}
          </div>
        )}
        <div className={classes.parentTutorSection}>
          <span className={classes.sectionLabel}>Tutor:</span>
          {renderTutorSection()}
        </div>
      </div>
    );
  };

  // Determine what info to show based on role
  const renderRoleBasedInfo = () => {
    switch (role) {
      case "teacher":
        return renderStudentSection();
      case "student":
        return renderTutorSection();
      case "parent":
        return renderParentInfoSection();
      default:
        return null;
    }
  };

  return isLarge ? (
    <div className={classes.cardBox}>
      <div className={classes.resFirstBox}>
        <div className={classes.info}>{renderRoleBasedInfo()}</div>
        <p className={classes.fifthBox}>
          <span style={statusStyle}>{status || "No Show"}</span>
        </p>
      </div>
      <div className={classes.resSecondBox}>
        <div className={classes.wrapper}>
          <Image
            src={"/assets/svgs/book.svg"}
            alt={"icon"}
            height={0}
            width={0}
            style={{ width: "var(--regular22-)", height: "var(--regular22-)" }}
          />{" "}
          <p className={classes.secondBox}>{subject}</p>
        </div>
        <div className={classes.wrapper}>
          <Image
            src={"/assets/svgs/watch.svg"}
            alt={"icon"}
            height={0}
            width={0}
            style={{ width: "var(--regular22-)", height: "var(--regular22-)" }}
          />
          <p className={classes.fourthBox}>{formattedTime.clock}</p>
        </div>
        <div className={classes.wrapper}>
          <Image
            src={"/assets/svgs/date.svg"}
            alt={"icon"}
            height={0}
            width={0}
            style={{ width: "var(--regular22-)", height: "var(--regular22-)" }}
          />
          <p className={classes.thirdBox}>
            {"  "}
            {formattedTime.date}
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div className={classes.cardBox}>
      <div className={classes.firstBox}>{renderRoleBasedInfo()}</div>
      <p className={classes.secondBox}>{subject}</p>
      <div className={classes.thirdBox}>
        <span>{formattedTime.date}</span>
        <span>{formattedTime.clock}</span>
      </div>
      <p className={classes.fourthBox}>
        <span style={statusStyle}>{status || "No Show"}</span>
      </p>
    </div>
  );
};

export default React.memo(Card);
