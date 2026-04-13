import { FC, memo, useMemo, useCallback } from "react";
import styles from "./time-view.module.css";
import ChildHeader from "./components/child-header/child-header";
import Slots from "./components/slots/slots";
import { getAllClassSchedulesDAYOfWeek } from "@/services/dashboard/superAdmin/class-schedule/class-schedule-day0fWeek/class-schedule-day0fWeek";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import moment from "moment";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";

interface Subject {
  name: string;
}

interface Student {
  name: string;
}

interface Teacher {
  name: string;
}

interface TimeViewProps {
  day: string;
  subject: Subject | null;
  student: Student | null;
  teacher: Teacher | null;
  handleBack?: () => void;
  deleteSlotModal?: (item: any) => void;
}

const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DAY_ABBREVIATIONS: Record<string, string> = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
  Saturday: "SAT",
  Sunday: "SUN",
};

const TimeView: FC<TimeViewProps> = ({
  day,
  subject,
  student,
  teacher,
  handleBack,
  deleteSlotModal,
}) => {
  const token = useAppSelector((state) => state?.user?.token);

  const dayAbbreviation = DAY_ABBREVIATIONS[day] || "";
  if (!dayAbbreviation) {
    console.error("Invalid day provided:", day);
  }

  const dayDate = useMemo(() => {
    const dayIndex = WEEK_DAYS.indexOf(day);
    if (dayIndex === -1) {
      console.error("Invalid day provided:", day);
      return "";
    }
    const startOfWeek = moment().startOf("week");
    const targetDate = startOfWeek.clone().add(dayIndex, "days");
    return targetDate.format("Do MMMM YYYY");
  }, [day]);

  const { data, isLoading } = useQuery({
    queryKey: ["class-schedules-dayOfWeek", day],
    queryFn: () => getAllClassSchedulesDAYOfWeek(dayAbbreviation, { token }),
  });

  const groupedData = useMemo(() => {
    if (!data) return [];

    const filteredData = data.filter((item: Record<string, any>) => {
      const matchesSubject = subject
        ? item?.enrollment?.subject?.name === subject?.name
        : true;
      const matchesStudent = student
        ? item?.enrollment?.students?.some(
            (s: Record<string, any>) => s?.name === student?.name
          )
        : true;
      const matchesTeacher = teacher
        ? item.enrollment?.tutor?.name === teacher.name
        : true;

      return matchesSubject && matchesStudent && matchesTeacher;
    });

    const sortedData = [...filteredData].sort(
      (a: Record<string, any>, b: Record<string, any>) => {
        const timeA = a.teacherSchedule?.start_time || "";
        const timeB = b.teacherSchedule?.start_time || "";
        return timeA.localeCompare(timeB);
      }
    );

    const grouped = new Map<string, Record<string, any>[]>();
    sortedData.forEach((item) => {
      const startTime = item.teacherSchedule?.start_time || "Unknown Time";
      if (!grouped.has(startTime)) {
        grouped.set(startTime, []);
      }
      grouped.get(startTime)?.push(item);
    });

    return Array.from(grouped.values());
  }, [data, subject, student, teacher]);

  const handleDeleteSlotModal = useCallback(
    (item: any) => {
      deleteSlotModal?.(item);
    },
    [deleteSlotModal]
  );

  return (
    <div className={styles.container}>
      {isLoading ? (
        <LoadingBox />
      ) : (
        <>
          <p className={styles.heading}>
            <ArrowBackIosIcon
              onClick={handleBack}
              aria-label="Go back"
              sx={{
                width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
              }}
            />
            <span>{day},</span>&nbsp; {dayDate}
          </p>
          <div className={styles.section2}>
            {groupedData?.length > 0 ? (
              groupedData?.map((group, index) => (
                <div className={styles.child} key={index}>
                  <ChildHeader
                    startTime={group[0]?.teacherSchedule?.start_time}
                    endTime={group[0]?.teacherSchedule?.session_duration}
                  />
                  <div className={styles.slotsBox}>
                    {group?.map((item, idx) => (
                      <Slots
                        key={idx}
                        item={item}
                        deleteSlotModal={(item: any) =>
                          handleDeleteSlotModal({ ...item, day: day })
                        }
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <ErrorBox />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(TimeView);
