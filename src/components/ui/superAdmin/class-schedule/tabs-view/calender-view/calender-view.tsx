import { memo, useCallback, useMemo } from "react";
import classes from "./calender-view.module.css";
import moment from "moment";
import Image from "next/image";
import { MinutesToHours } from "@/utils/helpers/convert-minutes-to-hours";
import ErrorBox from "@/components/global/error-box/error-box";
import { toast } from "react-toastify";

interface Slot {
  id: string;
  teacherSchedule: {
    start_time: string;
    session_duration: number;
  };
  enrollment: {
    id: string;
    subject: {
      name: string;
    };
    tutor: {
      name: string;
      profileImageUrl: string;
    };
    studentsGroups: {
      user: {
        name: string;
        profileImageUrl: string;
      };
    }[];
  };
}

interface ClassSchedule {
  day: string;
  date: string;
  slots: Slot[];
}

interface ClassScheduleViewProps {
  classSchedules: ClassSchedule[];
  handleViewMore?: (day: string) => void;
  deleteSlotModal?: any;
  role?: string;
}

const ClassScheduleView: React.FC<ClassScheduleViewProps> = ({
  classSchedules,
  handleViewMore,
  deleteSlotModal,
  role,
}) => {
  const today = useMemo(() => moment(), []);
  const handleOnClick = useCallback(
    (day: string) => {
      if (handleViewMore) {
        handleViewMore(day);
      }
    },
    [handleViewMore]
  );

  const bgColor = ["#dafff0", "#b8e5ff", "#d6cfff"];

  const handleDeleteSlot = useCallback(
    (item: Slot, day: string, date?: string) => {
      deleteSlotModal({
        open: true,
        day: day,
        date: date,
        startTime: item?.teacherSchedule?.start_time
          ? moment
              .utc(item.teacherSchedule.start_time, "HH:mm:ss")
              .local()
              .format("hh:mmA")
          : null,
        endTime:
          item?.teacherSchedule?.start_time &&
          item?.teacherSchedule?.session_duration
            ? moment
                .utc(item.teacherSchedule.start_time, "HH:mm:ss")
                .clone()
                .add(item.teacherSchedule.session_duration, "minutes")
                .local()
                .format("hh:mmA")
            : null,
        ids: [item?.id],
        enrollment_id: item?.enrollment?.id,
      });
    },
    [deleteSlotModal]
  );

  return (
    <div className={classes.classScheduleBox}>
      {classSchedules?.length > 0 ? (
        classSchedules?.map(({ day, date, slots }, indx) => {
          const isToday = moment(date).isSame(
            today.format("YYYY-MM-DD"),
            "day"
          );
          const dayBoxStyle = {
            backgroundColor: isToday ? "#38b6ff" : "#f1f5f9",
            color: isToday ? "var(--white-color)" : "#727272",
          };

          return (
            <div key={indx} className={classes.daysBox}>
              <div className={classes.daysNameBox} style={dayBoxStyle}>
                <p>
                  {day}
                  <span
                    style={{
                      color: isToday
                        ? "var(--white-color)"
                        : "var(--black-color)",
                    }}
                  >
                    {moment(date).format("Do")}
                  </span>
                </p>
                <span>{slots?.length}</span>
              </div>
              <div className={classes.slotsBox}>
                {slots?.length === 0 ? (
                  <div className={classes.nullBox}>No slots added</div>
                ) : (
                  (role === "teacher" || role === "student"
                    ? slots
                    : slots?.slice(0, 4)
                  )?.map((item, index) => {
                    const bookedBoxStyle = {
                      backgroundColor: bgColor[index % 3],
                    };

                    return (
                      <div
                        className={classes.bookedBox}
                        key={item?.id}
                        style={bookedBoxStyle}
                        onClick={() => {
                          if (role === "teacher") {
                            const currentTime = moment();
                            const startTime = moment
                              .utc(
                                item?.teacherSchedule?.start_time,
                                "HH:mm:ss"
                              )
                              .local();

                            if (isToday) {
                              const minutesDifference = startTime.diff(
                                currentTime,
                                "minutes"
                              );
                              if (minutesDifference >= 30) {
                                handleDeleteSlot(item, day, date);
                              } else {
                                toast.error(
                                  "Cancellation is only allowed 30 minutes before the scheduled time for today's slots."
                                );
                              }
                            } else {
                              handleDeleteSlot(item, day, date);
                            }
                          } else if (role === "student") {
                            return undefined;
                          } else {
                            handleDeleteSlot(item, day);
                          }
                        }}
                      >
                        <div className={classes.timeBox}>
                          <div>
                            <p>
                              {item?.enrollment?.subject?.name || "No Show"}
                            </p>
                            <p>
                              {moment
                                .utc(
                                  item?.teacherSchedule?.start_time,
                                  "HH:mm:ss"
                                )
                                .local()
                                .format("hh:mm A")}
                            </p>
                          </div>
                          <p>{`${MinutesToHours(
                            item?.teacherSchedule?.session_duration
                          )}`}</p>
                        </div>
                        <div className={classes.studentTeacherInfoBox}>
                          {(role === "superAdmin" || role === "student") && (
                            <div className={classes.facultyInfoBox}>
                              <div className={classes.imageBox}>
                                <Image
                                  src={
                                    item?.enrollment?.tutor?.profileImageUrl ||
                                    "/assets/images/static/demmyPic.png"
                                  }
                                  alt={"image"}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                              <div>
                                <p>Teacher</p>
                                <p>
                                  {item?.enrollment?.tutor?.name
                                    .trim()
                                    .split(" ")
                                    .slice(0, 1)
                                    .join(" ") || "No Teacher"}
                                </p>
                              </div>
                            </div>
                          )}
                          {role !== "student" && (
                            <div className={classes.studentsInfoBox}>
                              <div className={classes.imagesContainer}>
                                <div className={classes.imageBox}>
                                  <Image
                                    src={
                                      item?.enrollment?.studentsGroups[0]?.user
                                        ?.profileImageUrl ||
                                      "/assets/images/static/demmyPic.png"
                                    }
                                    alt={"image"}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                </div>
                                {item?.enrollment?.studentsGroups?.length >
                                  1 && (
                                  <div
                                    className={classes.imageBox}
                                    style={{
                                      position: "absolute",
                                      right: "-7px",
                                    }}
                                  >
                                    <Image
                                      src={
                                        item?.enrollment?.studentsGroups[1]
                                          ?.user?.profileImageUrl ||
                                        "/assets/images/static/demmyPic.png"
                                      }
                                      alt={"image"}
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p>Students</p>
                                <p>
                                  {(item?.enrollment?.studentsGroups &&
                                    item?.enrollment?.studentsGroups.length >
                                      0 &&
                                    item?.enrollment?.studentsGroups[0]?.user?.name
                                      .trim()
                                      .split(" ")
                                      .slice(0, 1)
                                      .join(" ")) ||
                                    "No Students"}
                                  {item?.enrollment?.studentsGroups?.length >
                                  1 ? (
                                    <span>
                                      {` + ${
                                        item?.enrollment?.studentsGroups
                                          ?.length - 1
                                      }`}
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {role === "superAdmin" && slots?.length > 3 && (
                  <p
                    onClick={() => handleOnClick(day)}
                    className={classes.viewMore}
                  >
                    view more
                  </p>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <ErrorBox />
      )}
    </div>
  );
};

export default memo(ClassScheduleView);
