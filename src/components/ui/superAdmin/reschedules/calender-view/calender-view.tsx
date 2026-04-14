import { memo, useCallback, useMemo } from "react";
import styles from "./calender-view.module.css";
import moment from "moment";
import Image from "next/image";
import ErrorBox from "@/components/global/error-box/error-box";

interface Slot {
  DateTime: string;
  id: string;
  teacherSchedule: {
    start_time: string;
    session_duration: number;
  };
  enrollment: {
    subject: {
      name: string;
    };
    tutor: {
      name: string;
      profileImageUrl: string;
    };
    students: {
      name: string;
      profileImageUrl: string;
    }[];
  };
  class_status?: string; // Added optional class_status
}

interface ClassSchedule {
  day: string;
  date: string;
  slots: Slot[];
}

interface CalenderViewProps {
  reschedules: ClassSchedule[];
  handleViewMore?: (day: string) => void;
}

const today = moment().format("dddd");
const CalenderView: React.FC<CalenderViewProps> = ({
  reschedules,
  handleViewMore,
}) => {
  const reorderedSchedules = useMemo(() => {
    if (!reschedules) return [];

    const todayIndex = reschedules?.findIndex(
      (schedule) => schedule?.day === today
    );

    if (todayIndex === -1) return reschedules;

    return [
      ...reschedules.slice(todayIndex),
      ...reschedules.slice(0, todayIndex),
    ];
  }, [reschedules, today]);

  const handleOnClick = useCallback(
    (day: string) => {
      handleViewMore?.(day);
    },
    [handleViewMore]
  );

  return (
    <div className={styles.classScheduleBox}>
      {reorderedSchedules?.length > 0 ? (
        reorderedSchedules.map(({ day, date, slots }, index) => {
          const isToday = day === today;
          const dayBoxStyle = {
            backgroundColor: isToday ? "#38b6ff" : "#f1f5f9",
            color: isToday ? "var(--white-color)" : "#727272",
          };

          return (
            <div key={index} className={styles.daysBox}>
              <div className={styles.daysNameBox} style={dayBoxStyle}>
                <p>
                  {day}
                  <span
                    style={{
                      color: isToday
                        ? "var(--white-color)"
                        : "var(--black-color)",
                    }}
                  >
                    {moment(date, "DD-MM-YYYY").format("D")}
                  </span>
                </p>
                <span>{slots?.length}</span>
              </div>
              <div className={styles.slotsBox}>
                {slots?.length === 0 ? (
                  <div className={styles.nullBox}>No slots added yet</div>
                ) : (
                  slots.slice(0, 3).map((item) => {
                    const bookedBoxStyle = {
                      bgColor: {
                        backgroundColor:
                          item?.class_status === "CANCELLED"
                            ? "rgb(255, 172, 172)"
                            : "rgb(150, 239, 207)",
                      },
                      fontColor: {
                        color:
                          item?.class_status === "CANCELLED"
                            ? "rgb(255, 172, 172)"
                            : "rgb(150, 239, 207)",
                      },
                      statusBgColor: {
                        backgroundColor:
                          item?.class_status === "CANCELLED"
                            ? "rgb(101, 56, 56)"
                            : "rgb(40, 99, 32)",
                      },
                    };

                    return (
                      <div
                        className={styles.bookedBox}
                        key={item.id}
                        style={bookedBoxStyle?.bgColor}
                      >
                        <div className={styles.timeBox}>
                          <p
                            style={{
                              ...bookedBoxStyle?.fontColor,
                              ...bookedBoxStyle?.statusBgColor,
                              padding: "5px",
                              borderRadius: "5px",
                              height: "max-content",
                              margin: "0px !important",
                            }}
                          >
                            {item?.class_status}
                          </p>
                          <p>
                            {item.enrollment?.subject?.name
                              .trim()
                              ?.split(" ")
                              .slice(0, 2)
                              .join(" ") || "No Show"}
                          </p>
                          <p>
                            {moment
                              .utc(item?.DateTime)
                              .local()
                              .format("H:mm A")}
                          </p>
                        </div>
                        <div className={styles.studentTeacherInfoBox}>
                          <div className={styles.facultyInfoBox}>
                            <div className={styles.imageBox}>
                              <Image
                                src={
                                  item.enrollment?.tutor?.profileImageUrl ||
                                  "/assets/images/dummyPic.png"
                                }
                                alt="Tutor"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <div>
                              <p>Teacher</p>
                              <p>
                                {item.enrollment?.tutor?.name
                                  ?.split(" ")
                                  .slice(0, 1)
                                  .join(" ") || "No Teacher"}
                              </p>
                            </div>
                          </div>
                          <div className={styles.studentsInfoBox}>
                            <div className={styles.imagesContainer}>
                              <div className={styles.imageBox}>
                                <Image
                                  src={
                                    item.enrollment?.students[0]
                                      ?.profileImageUrl ||
                                    "/assets/images/dummyPic.png"
                                  }
                                  alt="Student"
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                              {item.enrollment?.students?.length > 1 && (
                                <div
                                  className={styles.imageBox}
                                  style={{
                                    position: "absolute",
                                    right: "-7px",
                                  }}
                                >
                                  <Image
                                    src={
                                      item.enrollment?.students[1]
                                        ?.profileImageUrl ||
                                      "/assets/images/dummyPic.png"
                                    }
                                    alt="Student"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <p>Students</p>
                              <p>
                                {item.enrollment?.students[0]?.name
                                  ?.split(" ")
                                  .slice(0, 1)
                                  .join(" ") || "No Students"}
                                {item.enrollment?.students?.length > 1 && (
                                  <span>
                                    {` + ${
                                      item.enrollment.students.length - 1
                                    }`}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {slots?.length > 3 && (
                  <p onClick={() => handleOnClick(day)}>View more</p>
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

export default memo(CalenderView);
