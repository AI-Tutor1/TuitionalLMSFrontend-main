import { FC, memo, useCallback, useMemo } from "react";
import styles from "./list-view.module.css";
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

interface ListSchedule {
  day: string;
  date: string;
  slots: Slot[];
  deleteSlotModal?: any;
}

interface ListScheduleViewProps {
  classSchedules: ListSchedule[];
  deleteSlotModal?: any;
  role?: string;
}
const ListView: React.FC<ListScheduleViewProps> = ({
  classSchedules,
  deleteSlotModal,
  role,
}) => {
  const today = moment();
  const bgColor = ["#dafff0", "#b8e5ff", "#d6cfff"];
  const handleDeleteSlot = useCallback((item: any, day: string) => {
    deleteSlotModal({
      open: true,
      day: day,
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
  }, []);

  return (
    <div className={styles.classScheduleBox}>
      {classSchedules?.length > 0 ? (
        classSchedules.map(({ day, date, slots }: any, indx: number) => {
          const isToday = moment(date).isSame(
            today.format("YYYY-MM-DD"),
            "day"
          );

          return (
            <div key={indx} className={styles.daysBox}>
              <p className={styles.daysNameBox}>{day}</p>
              <div className={styles.slotsBox}>
                {slots?.length === 0 ? (
                  <div className={styles.nullBox}>No slots added yet</div>
                ) : (
                  slots?.map((item: any, idx: number) => {
                    const bookedBoxStyle = {
                      backgroundColor: bgColor[idx % 3],
                    };

                    return (
                      <div
                        className={styles.bookedBox}
                        key={item?.id}
                        style={bookedBoxStyle}
                        onClick={() => {
                          if (role === "teacher" || role === "student") {
                            const currentTime = moment();
                            const startTime = moment
                              .utc(
                                item?.teacherSchedule?.start_time,
                                "HH:mm:ss"
                              )
                              .local();

                            if (isToday) {
                              const hoursDifference = startTime.diff(
                                currentTime,
                                "hours"
                              );
                              if (hoursDifference >= 6) {
                                handleDeleteSlot(item, day);
                              } else {
                                toast.error(
                                  "Cancellation is only allowed 6 hours before the scheduled time for today's slots."
                                );
                              }
                            } else {
                              handleDeleteSlot(item, day);
                            }
                          } else {
                            handleDeleteSlot(item, day);
                          }
                        }}
                      >
                        <div className={styles.timeBox}>
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
                        <div className={styles.studentTeacherInfoBox}>
                          <div className={styles.facultyInfoBox}>
                            <div className={styles.imageBox}>
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
                                {item?.enrollment?.tutor?.name || "No Teacher"}
                              </p>
                            </div>
                          </div>
                          <div className={styles.studentsInfoBox}>
                            <div className={styles.imagesContainer}>
                              <div className={styles.imageBox}>
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
                              {item?.enrollment?.studentsGroups?.length > 1 && (
                                <div
                                  className={styles.imageBox}
                                  style={{
                                    position: "absolute",
                                    right: "-7px",
                                  }}
                                >
                                  <Image
                                    src={
                                      item?.enrollment?.studentsGroups[1]?.user
                                        ?.profileImageUrl ||
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
                                {item?.enrollment?.studentsGroups[0]?.user
                                  ?.name || "No Students"}
                                {item?.enrollment?.studentsGroups?.length >
                                1 ? (
                                  <span>
                                    {` + ${
                                      item?.enrollment?.studentsGroups?.length -
                                      1
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
