// Import required modules
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
  name?: string;
  profileImageUrl?: string;
}

interface CardProps {
  name?: string;
  subject: string;
  board: string;
  grade: string;
  curriculum: string;
  profileImageUrl?: string;
  role?: "teacher" | "student" | "parent";
  day?: string;
  rate?: string;
  students?: Student[];
  tutorHourlyRate?: string;
}

const DEFAULT_STUDENT_IMAGE = "/assets/images/dummyPic.png";

const Card: FC<CardProps> = ({
  role,
  name,
  students = [],
  profileImageUrl,
  subject,
  day,
  board,
  grade,
  curriculum,
  tutorHourlyRate,
}) => {
  // console.log(name, role);
  const isLarge = useMediaQuery({
    query: "(min-width: 769px) and (max-width: 1200px)",
  });
  const hasStudents =
    (role === "teacher" || role === "parent") &&
    students &&
    students.length > 0;

  // Format a student name with proper error handling
  const formatName = (student: Student) => {
    try {
      const studentName = student?.user?.name;
      if (!studentName) return "No Show";

      const firstName = studentName.split(" ")[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    } catch {
      return "No Show";
    }
  };

  // Memoize student info to avoid recalculations on re-renders
  const studentInfo = useMemo(() => {
    if (!hasStudents) return null;

    const visibleStudents = students.slice(0, 2);
    const formattedNames = visibleStudents.map(formatName);
    const namesDisplay = formattedNames.join(", ");
    const hasMoreStudents = students.length > 2;

    return {
      visibleStudents,
      namesDisplay,
      hasMoreStudents,
      additionalCount: hasMoreStudents ? students.length - 2 : 0,
    };
  }, [hasStudents, students]);

  // Safely format the day with error handling
  const formattedDay = useMemo(() => {
    try {
      return day ? moment.utc(day).local().format("dddd") : "No Show";
    } catch {
      return "No Show";
    }
  }, [day]);

  return (
    <div className={classes.cardBox}>
      <div className={classes.firstBox}>
        {hasStudents && studentInfo && (
          <div className={classes.studentsBoxContainer}>
            <div className={classes.studentsBox}>
              <div className={classes.imagesBox}>
                {studentInfo.visibleStudents.map((student, index) => {
                  const imageUrl =
                    index === 0
                      ? student?.user?.profileImageUrl
                      : student?.user?.profileImageUrl ||
                        student?.profileImageUrl;

                  const altText =
                    index === 0
                      ? student?.user?.name
                      : student?.user?.name || student?.name;

                  return (
                    <div key={`student-${index}`} className={classes.imageBox}>
                      <Image
                        src={imageUrl || DEFAULT_STUDENT_IMAGE}
                        alt={altText || "Student"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  );
                })}
              </div>
              <p>{studentInfo.namesDisplay}</p>
              {studentInfo.hasMoreStudents && (
                <p>{`+${studentInfo.additionalCount} more`}</p>
              )}
            </div>
            {role !== "parent" && <p>{"Students"}</p>}
          </div>
        )}
        {(role === "student" || role === "parent") && (
          <div className={classes.teacherBox}>
            <div className={classes.imageBox}>
              <Image
                src={profileImageUrl || DEFAULT_STUDENT_IMAGE}
                alt="Profile image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div>
              <p>{name ? name.split(" ").slice(0, 2).join(" ") : "No Show"}</p>
              {role !== "parent" && <p>{"Teacher"}</p>}
            </div>
          </div>
        )}
      </div>

      <div className={classes.secondBox}>
        <div className={classes.nameImageBox}>
          <p>{subject || "No Show"}</p>
          <div className={classes.seperationBox}></div>
          <p>{formattedDay}</p>
        </div>
        <div className={classes.bottomBox}>
          <p>{board || "No Show"}</p>
          <p>{grade || "No Show"}</p>
          <p>{curriculum || "No Show"}</p>
        </div>
      </div>
      {role === "teacher" ||
        (role === "parent" &&
          (isLarge ? (
            <div className={classes.thirdBox}>
              <p>AED {tutorHourlyRate}</p>
              <p>Hourly Rate</p>
            </div>
          ) : (
            <div className={classes.thirdBox}>
              <p>AED</p>
              <p>{tutorHourlyRate}</p>
            </div>
          )))}
    </div>
  );
};

export default React.memo(Card);
