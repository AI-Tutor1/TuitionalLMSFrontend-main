import React, { FC, useCallback, useEffect, useState, useMemo } from "react";
import styles from "./card.module.css";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/global/button/button";
import LocalActivityOutlinedIcon from "@mui/icons-material/LocalActivityOutlined";
import { ClassScheduleWithStudents } from "@/types/class-schedule/getOngoingClasses.types";
import { Tooltip } from "@mui/material";
import { useParams } from "next/navigation";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";

interface CardProps {
  students?: any[];
  handleExtendClass: (duration: number | null, openModal: boolean) => void; // Function to handle extending the class
  item?: ClassScheduleWithStudents;
  handleTicketingModal: (item: ClassScheduleWithStudents) => void;
  handleAttendanceModal: (item: ClassScheduleWithStudents) => void;
}

const Card: FC<CardProps> = ({
  item,
  students,
  handleExtendClass,
  handleTicketingModal,
  handleAttendanceModal,
}) => {
  const params = useParams();
  const { role } = params;
  const [showTooltip, setShowTooltip] = useState(false);
  const insufficientStudents = useMemo(
    () =>
      students?.filter(
        (group) => group.user?.balance_status === "INSUFFICIENT",
      ) || [],
    [students],
  );

  const checkTimeFormat = (time: string | undefined) => {
    if (!time) return "Invalid Time";
    if (time.includes("T")) {
      return moment
        .utc(time, "YYYY-MM-DDTHH:mm:ss.SSSZ")
        .local()
        .format("hh:mm A");
    }
    return moment.utc(time, "HH:mm:ss").local().format("hh:mm A");
  };

  return (
    <div className={styles.cardBox}>
      <div className={styles.firstBox}>
        {(item?.enrollment_reschedual || false) && (
          <p className={styles.rescheduled}>Rescheduled</p>
        )}
        <p style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          At
          <span>
            {checkTimeFormat(
              item?.teacherSchedule?.start_time ||
                item?.DateTime ||
                item?.createdAt,
            ) || "No Show"}
          </span>
        </p>
      </div>
      <div className={styles.secondBox}>
        <div className={styles.infoBox}>
          <div className={styles.enrollIdBox}>
            <div className={styles.imageBox}>
              <Image
                src={"/assets/svgs/menuBarIcons/enrollment.svg"}
                alt={"Enroll Id"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ filter: "var(--icon-filter)" }}
              />
            </div>
            <p>Id: {item?.enrollment?.id}</p>
            <p>
              Priority:{" "}
              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: "5px",
                  color:
                    item?.enrollment?.priority === "High"
                      ? "var(--red-text-color1)"
                      : item?.enrollment?.priority === "Moderate"
                        ? "var(--orange-text-color1)"
                        : "var(--pure-black-color)",
                  backgroundColor:
                    item?.enrollment?.priority === "High"
                      ? "var(--red-background-color2)"
                      : item?.enrollment?.priority === "Moderate"
                        ? "var(--orange-background-color1)"
                        : "var(--grey-color1)",
                }}
              >
                {item?.enrollment?.priority || "No Show"}
              </span>
            </p>
            {(role === "superAdmin" ||
              role === "admin" ||
              role === "manager") && (
              <div style={{ position: "relative" }}>
                Balance:{" "}
                <span
                  style={{
                    cursor: "pointer",
                    backgroundColor: students?.some(
                      (group) => group.user?.balance_status === "INSUFFICIENT",
                    )
                      ? "var(--red-background-color2)"
                      : "var(--green-background-color4)",
                    color: students?.some(
                      (group) => group.user?.balance_status === "INSUFFICIENT",
                    )
                      ? "var(--red-text-color1)"
                      : "var(--green-text-color2)",
                    padding: "5px",
                    borderRadius: "5px",
                  }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {students?.some(
                    (group) => group.user?.balance_status === "INSUFFICIENT",
                  )
                    ? "Insufficient"
                    : "Sufficient"}
                </span>
                {showTooltip && insufficientStudents?.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "125%",
                      left: "100px",
                      backgroundColor: "var(--main-white-color)",
                      borderRadius: "10px",
                      padding: "5px 10px",
                      boxShadow: "var(--cards--boxShadow-color)",
                      zIndex: 1000,
                    }}
                  >
                    <ul
                      style={{
                        padding: "0px 10px",
                        margin: 0,
                        listStyle: "none",
                      }}
                    >
                      {insufficientStudents?.map((group) => (
                        <li key={group.id} style={{ marginBottom: "3px" }}>
                          {group.user?.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className={styles.nameImageSubjectBox}>
            <div className={styles.nameImageBox}>
              <div className={styles.imageBox}>
                <Image
                  src={
                    item?.enrollment?.tutor?.profileImageUrl ||
                    item?.enrollment_reschedual?.tutor?.profileImageUrl ||
                    "/assets/images/dummyPic.png"
                  }
                  alt="Profile image"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <p>
                {item?.enrollment?.tutor?.name
                  ?.split(" ")
                  .slice(0, 2)
                  .join(" ") ||
                  item?.enrollment_reschedual?.tutor?.name
                    ?.split(" ")
                    .slice(0, 2)
                    .join(" ") ||
                  "No Show"}
              </p>
            </div>
            <div className={styles.line}></div>
            <p>
              {item?.enrollment?.subject?.name ||
                item?.enrollment_reschedual?.subject?.name ||
                "No Show"}
            </p>
            <div className={styles.line}></div>
            <p>
              {(item?.duration ||
                item?.teacherSchedule?.session_duration ||
                null) + " mins" || "No Show"}
            </p>
          </div>
          <div className={styles.studentsBox}>
            <div className={styles.imagesBox}>
              <div className={styles.imageBox}>
                <Image
                  src={
                    (students && students[0]?.user?.profileImageUrl) ||
                    "/assets/images/dummyPic.png"
                  }
                  alt={(students && students[0]?.name) || "Student"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              {students && students.length > 1 && (
                <div className={styles.imageBox}>
                  <Image
                    src={
                      students[1]?.user?.profileImageUrl ||
                      "/assets/images/dummyPic.png"
                    }
                    alt={students[1]?.user?.name || "Student"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </div>
            <p>
              {students && students[0]?.user?.name
                ? `${students[0]?.user?.name}`
                : "No Show"}

              {students &&
                students[1]?.user?.name &&
                `, ${students[1]?.user?.name}`}

              {students && students.length > 2 && (
                <>
                  &nbsp;
                  <span>{`+${students.length - 2} more`}</span>
                </>
              )}
            </p>
          </div>
          <div className={styles.bottomBox}>
            <p>
              {item?.enrollment?.board?.name ||
                item?.enrollment_reschedual?.board?.name ||
                "No Show"}
            </p>
            <p>
              {item?.enrollment?.grade?.name ||
                item?.enrollment_reschedual?.grade?.name ||
                "No Show"}
            </p>
            <p>
              {item?.enrollment?.curriculum?.name ||
                item?.enrollment_reschedual?.curriculum?.name ||
                "No Show"}
            </p>
          </div>
        </div>

        <div className={styles.actionsBox}>
          <div className={styles.quickActionsBox}>
            <Tooltip title="Mark Attendance" arrow>
              <span
                className={styles.ticketBox}
                onClick={() =>
                  handleAttendanceModal(item as ClassScheduleWithStudents)
                }
              >
                <BookmarkBorderOutlinedIcon
                  sx={{
                    fontSize: "var(--regular20-)",
                    color: "var(--pure-black-color)",
                  }}
                />
              </span>
            </Tooltip>
            <Tooltip title="Generate Ticket" arrow>
              <span
                className={styles.ticketBox}
                onClick={() =>
                  handleTicketingModal(item as ClassScheduleWithStudents)
                }
              >
                <LocalActivityOutlinedIcon
                  sx={{
                    fontSize: "var(--regular20-)",
                    color: "var(--pure-black-color)",
                  }}
                />
              </span>
            </Tooltip>
          </div>
          <Button
            text="Extend Class"
            inlineStyling={{
              padding: "5px 10px",
              height: "max-content",
              minHeight: "max-content",
              fontSize: "var(--regular18-)",
              lineHeight: "var(--regular18-)",
              borderRadius: "5px",
            }}
            clickFn={() =>
              handleExtendClass(
                item?.duration ||
                  item?.teacherSchedule?.session_duration ||
                  null,
                true,
              )
            }
          />
          <Link
            href={item?.meetLink || ""}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          >
            {"Join Now"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
