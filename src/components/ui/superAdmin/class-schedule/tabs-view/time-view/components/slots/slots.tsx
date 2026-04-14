import { memo, FC, useCallback } from "react";
import styles from "./slots.module.css";
import Image from "next/image";
import moment from "moment";
import { MinutesToHours } from "@/utils/helpers/convert-minutes-to-hours";

interface Tutor {
  profileImageUrl?: string | null;
  name?: string | null;
}

interface Student {
  profileImageUrl?: string | null;
  name?: string | null;
}

interface Board {
  name?: string | null;
}

interface Grade {
  name?: string | null;
}

interface Subject {
  name?: string | null;
}

interface TeacherSchedule {
  session_duration?: number | null;
  start_time?: string | null;
}

interface Enrollment {
  tutor?: Tutor | null;
  students?: Student[] | null;
  board?: Board | null;
  grade?: Grade | null;
  subject?: Subject | null;
}

interface SlotItem {
  teacherSchedule?: TeacherSchedule | null;
  enrollment?: Enrollment | null;
}

interface SlotsProps {
  item?: SlotItem;
  deleteSlotModal?: any;
}

const Slots: FC<SlotsProps> = ({ item, deleteSlotModal }) => {
  const handleDeleteSlot = useCallback((item: any) => {
    deleteSlotModal({
      open: true,
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
    });
  }, []);
  return (
    <div className={styles.bookedBox} onClick={() => handleDeleteSlot(item)}>
      <div className={styles.timeBox}>
        <p>{MinutesToHours(item?.teacherSchedule?.session_duration || 0)}</p>
        <p>
          {item?.teacherSchedule?.start_time
            ? moment
                .utc(item.teacherSchedule.start_time, "HH:mm:ss")
                .local()
                .format("hh:mm A")
            : "No Time"}
        </p>
      </div>
      <div className={styles.infoBox}>
        <div className={styles.facultyInfoBox}>
          <div className={styles.imageBox}>
            <Image
              src={
                item?.enrollment?.tutor?.profileImageUrl ||
                "/assets/images/dummyPic.png"
              }
              alt="Tutor Image"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <p>{item?.enrollment?.tutor?.name || "No Show"}</p>
        </div>
        <div className={styles.studentsInfoBox}>
          <div className={styles.imagesContainer}>
            <div className={styles.imageBox}>
              <Image
                src={
                  item?.enrollment?.students?.[0]?.profileImageUrl ||
                  "/assets/images/dummyPic.png"
                }
                alt="Student Image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {item?.enrollment?.students &&
              item?.enrollment?.students?.length > 1 && (
                <div
                  className={styles.imageBox}
                  style={{
                    position: "absolute",
                    right: "-7px",
                  }}
                >
                  <Image
                    src={
                      (item?.enrollment?.students &&
                        item?.enrollment?.students[1]?.profileImageUrl) ||
                      "/assets/images/dummyPic.png"
                    }
                    alt="Student Image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
          </div>
          <div>
            <p>{item?.enrollment?.students?.[0]?.name || "No Students"}</p>
            {item?.enrollment?.students?.length &&
            item?.enrollment?.students?.length > 1 ? (
              <>
                <p>, {item.enrollment.students[1]?.name || "No Students"}</p>
                <span>{` + ${
                  (item.enrollment.students.length || 1) - 1
                } more`}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
      <div className={styles.curriculumBox}>
        <p>{item?.enrollment?.board?.name || "No Show"}</p>
        <p>{item?.enrollment?.grade?.name || "No Show"}</p>
        <p>{item?.enrollment?.subject?.name || "No Show"}</p>
      </div>
    </div>
  );
};

export default memo(Slots);
