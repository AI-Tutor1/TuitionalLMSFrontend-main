// Import required modules
import React, { FC, useEffect } from "react";
import classes from "./card.module.css";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/global/button/button";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { redirect, useParams } from "next/navigation";
import { ClassJoinTracking_Payload_Type } from "@/types/join-class-tracking/joinClassTracking.types";
import { ClassScheduleWithStudents } from "@/types/class-schedule/getOngoingClasses.types";
import LocalActivityOutlinedIcon from "@mui/icons-material/LocalActivityOutlined";

interface CardProps {
  classItem: any; // The main class item object containing all the data
  handleExtendClass: (duration: number | null, openModal: boolean) => void;
  handleClassJoinTracking: (payload: ClassJoinTracking_Payload_Type) => any;
  handleClassJoinTrackingSuccess?: boolean;
  handleClassJoinTrackingLoading?: boolean;
  handleTicketingModal: (item: ClassScheduleWithStudents) => void;
}

const Card: FC<CardProps> = ({
  classItem,
  handleExtendClass,
  handleClassJoinTracking,
  handleClassJoinTrackingSuccess,
  handleClassJoinTrackingLoading,
  handleTicketingModal,
}) => {
  const { role } = useParams();
  const { user } = useAppSelector((state) => state?.user);
  const isLarge = window.innerWidth < 577;

  // Extract data from classItem
  const isRescheduled =
    classItem?.hasOwnProperty("enrollment_reschedual") || false;
  const activeEnrollment = isRescheduled
    ? classItem?.enrollment_reschedual
    : classItem?.enrollment;

  // Extract all required data
  const time =
    classItem?.teacherSchedule?.start_time ||
    classItem?.DateTime ||
    classItem?.createdAt;

  const duration =
    classItem?.duration || classItem?.teacherSchedule?.session_duration || null;

  const name = activeEnrollment?.tutor?.name || "";
  const subject = activeEnrollment?.subject?.name || "";
  const profileImageUrl = activeEnrollment?.tutor?.profileImageUrl;
  const students = activeEnrollment?.studentsGroups || [];
  const meetLink = classItem?.meetLink;
  const id = classItem?.id;

  const checkTimeFormat = (time: string) => {
    if (!time) return "Invalid Time";
    if (time.includes("T")) {
      return moment
        .utc(time, "YYYY-MM-DDTHH:mm:ss.SSSZ")
        .local()
        .format("hh:mm A");
    }
    return moment.utc(time, "HH:mm:ss").local().format("hh:mm A");
  };

  useEffect(() => {
    if (handleClassJoinTrackingSuccess && role === "student") {
      window.open(meetLink || "", "_blank", "noopener,noreferrer");
    }
  }, [handleClassJoinTrackingSuccess]);

  return (
    <div className={classes.cardBox}>
      <div className={classes.firstBox}>
        {isRescheduled && <p className={classes.rescheduled}>Rescheduled</p>}
        <p>Started at</p>
        <p>{checkTimeFormat(time) || "No Show"}</p>
      </div>
      <div className={classes.secondBox}>
        <div className={classes.infoBox}>
          {role === "student" && (
            <>
              <div className={classes.nameImageBox}>
                <div className={classes.imageBox}>
                  <Image
                    src={
                      profileImageUrl || "/assets/images/static/demmyPic.png"
                    }
                    alt="Profile image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <p>{name.split(" ").slice(0, 2).join(" ")}</p>
              </div>
              <div className={classes.line}></div>
            </>
          )}
          {role === "teacher" && (
            <>
              <div className={classes.studentsBox}>
                <div className={classes.imagesBox}>
                  <div className={classes.imageBox}>
                    <Image
                      src={
                        (students && students[0]?.user?.profileImageUrl) ||
                        "/assets/images/demmyPic.png"
                      }
                      alt={(students && students[0]?.user?.name) || "Student"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  {/* {students && students[1] && ( */}
                  <div className={classes.imageBox2}>
                    <Image
                      src={
                        students[1]?.user?.profileImageUrl ||
                        "/assets/images/demmyPic.png"
                      }
                      alt={students[1]?.user?.name ?? "Student"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  {/* )} */}
                </div>
                <p>
                  {(students && students[0]?.user?.name?.split(" ")[0]) ||
                    "No Show"}
                  {students &&
                    students[1] &&
                    `, ${students[1]?.user?.name?.split(" ")[0]}`}
                  {students && students?.length > 2 && (
                    <div>
                      &nbsp;
                      <p>
                        {students?.length > 2
                          ? `+${students?.length - 2} more`
                          : null}
                      </p>
                    </div>
                  )}
                </p>
              </div>
              <div className={classes.line}></div>
            </>
          )}
          <p>{subject || "No Show"}</p>
          <div className={classes.line}></div>
          <p>{duration + " min" || "No Show"}</p>
        </div>
        <div className={classes.actions}>
          <span
            className={classes.ticketBox}
            onClick={() =>
              handleTicketingModal(classItem as ClassScheduleWithStudents)
            }
          >
            <LocalActivityOutlinedIcon
              sx={{
                width: "var(--regular18-)",
                height: "var(--regular18-)",
              }}
            />
          </span>
          {role === "teacher" && (
            <Button
              clickFn={() => handleExtendClass(duration, true)}
              text="Extend Class"
              inlineStyling={styles.buttonStyles}
            />
          )}{" "}
          {role === "teacher" && (
            <Link
              href={meetLink || ""}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.button}
            >
              {"Join Now"}
            </Link>
          )}
          {role === "student" && (
            <Button
              text="Join Now"
              clickFn={() => {
                handleClassJoinTracking({
                  class_schedule_id: isRescheduled ? null : id,
                  reschedule_request_id: isRescheduled ? id : null,
                  enrollment_id: activeEnrollment?.id || null,
                  meeting_link: meetLink || "",
                  user_id: user?.id || null,
                });

                if (window !== undefined) {
                  window.open(meetLink || "", "_blank", "noopener,noreferrer");
                }
              }}
              inlineStyling={{ ...styles.buttonStyles }}
              loading={handleClassJoinTrackingLoading}
              disabled={handleClassJoinTrackingLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;

const styles = {
  buttonStyles: {
    width: "max-content",
    padding: "clamp(0.3125rem, 0.2453rem + 0.3165vw, 0.625rem)",
    height: "max-content",
    maxHeight: "max-content",
    minHeight: "max-content",
    fontSize: "var(--regular16-)",
    lineHeight: "var(--regular16-)",
    borderRadius: "clamp(0.3125rem, 0.2453rem + 0.3165vw, 0.625rem)",
  },
};
