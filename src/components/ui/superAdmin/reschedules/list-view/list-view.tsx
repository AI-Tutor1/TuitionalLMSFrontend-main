import { FC, memo } from "react";
import styles from "./list-view.module.css";
import moment from "moment";
import Image from "next/image";
import ErrorBox from "@/components/global/error-box/error-box";

interface Slot {
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
}

interface ListSchedule {
  day: string;
  date: string;
  slots: Slot[];
}

interface ListScheduleViewProps {
  reschedules: ListSchedule[];
}

const today = moment().format("dddd");
const ListView: React.FC<ListScheduleViewProps> = ({ reschedules }) => {
  const reorderedSchedules = (() => {
    const todayIndex = reschedules?.findIndex(
      (schedule) => schedule.day === today
    );

    if (todayIndex === -1) return reschedules;

    return [
      ...reschedules.slice(todayIndex),
      ...reschedules.slice(0, todayIndex),
    ];
  })();

  return (
    <div className={styles.classScheduleBox}>
      {reorderedSchedules?.length > 0 ? (
        reorderedSchedules.map(({ day, date, slots }: any, indx: number) => {
          return (
            <div key={indx} className={styles.daysBox}>
              <p className={styles.daysNameBox}>{day}</p>
              <div className={styles.slotsBox}>
                {slots?.length === 0 ? (
                  <div className={styles.nullBox}>No slots added yet</div>
                ) : (
                  slots?.map((item: any, idx: number) => {
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
                            }}
                          >
                            {item?.class_status || "No Show"}
                          </p>
                          <p>
                            {item?.enrollment?.subject?.name
                              .trim()
                              ?.split(" ")
                              .slice(0, 2)
                              .join(" ") || "No Show"}
                          </p>
                          <p>
                            {moment
                              .utc(item?.DateTime)
                              .local()
                              .format("Do-MMM-YYYY")}{" "}
                            (
                            {moment
                              .utc(item?.DateTime)
                              .local()
                              .format("H:mm A")}
                            )
                          </p>
                        </div>
                        <div className={styles.studentTeacherInfoBox}>
                          <div className={styles.facultyInfoBox}>
                            <div className={styles.imageBox}>
                              <Image
                                src={
                                  item?.enrollment?.tutor?.profileImageUrl ||
                                  "/assets/images/dummyPic.png"
                                }
                                alt={"image"}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <div>
                              <p>Teacher</p>
                              <p>
                                {item?.enrollment?.tutor?.name || "No Teacher"}
                              </p>
                            </div>
                          </div>
                          <div className={styles.studentsInfoBox}>
                            <div className={styles.imagesContainer}>
                              <div className={styles.imageBox}>
                                <Image
                                  src={
                                    item?.enrollment?.students[0]
                                      ?.profileImageUrl ||
                                    "/assets/images/dummyPic.png"
                                  }
                                  alt={"image"}
                                  fill
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              </div>
                              {item?.enrollment?.students?.length > 1 && (
                                <div
                                  className={styles.imageBox}
                                  style={{
                                    position: "absolute",
                                    right: "-7px",
                                  }}
                                >
                                  <Image
                                    src={
                                      item?.enrollment?.students[1]
                                        ?.profileImageUrl ||
                                      "/assets/images/dummyPic.png"
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
                                {item?.enrollment?.students[0]?.name ||
                                  "No Students"}
                                {item?.enrollment?.students?.length > 1 ? (
                                  <span>
                                    {` + ${
                                      item?.enrollment?.students?.length - 1
                                    } more`}
                                  </span>
                                ) : null}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
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

export default memo(ListView);
