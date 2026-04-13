"use client";
import { FC, useCallback, useState, CSSProperties, useMemo } from "react";
import moment from "moment";
import classes from "./class-schedule.module.css";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { getAllClassSchedules } from "@/services/dashboard/superAdmin/class-schedule/class-schedule-groupedByDay/clas-schedule-groupedByDay";
import { DeleteClassSchedule_Payload_Type } from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.types";
import { MyAxiosError } from "@/services/error.type";
import {
  deleteClassSchedule,
  cancelClassScheduleForWeek,
} from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
import DeleteSlotsModal from "@/components/ui/superAdmin/enrollment-details/deleteSlots-modal/deleteSlots-modal";
import CalenderView from "@/components/ui/superAdmin/class-schedule/tabs-view/calender-view/calender-view";
import ListView from "@/components/ui/superAdmin/class-schedule/tabs-view/list-view/list-view";
import TimeView from "@/components/ui/superAdmin/class-schedule/tabs-view/time-view/time-view";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import Tabs from "@/components/global/tabs/tabs";

const tabsArray = ["Calender View", "List View"];
const WEEK_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const tabsStyle = { width: "max-content" };

const ClassSchedule: FC = () => {
  // token
  const token = useAppSelector((state) => state?.user?.token);
  // role id
  const { roleId } = useAppSelector((state: any) => state?.user?.user);
  // Date calculations
  const today = useMemo(() => moment(), []);
  const todayDateStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);
  // State and Selectors
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const { subject } = useAppSelector((state) => state?.resources);
  const filteredTeachers =
    teachers?.users?.map((item) => JSON.stringify(item)) || [];
  const filteredStudents =
    students?.users?.map((item) => JSON.stringify(item)) || [];
  const filteredSubjects = subject?.map((item) => JSON.stringify(item)) || [];
  // states
  const [activeTab, setActiveTab] = useState(tabsArray[0]);
  const [day, setDay] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<any>("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>("");
  const [selectedStudent, setSelectedStudent] = useState<any>("");
  // delete condirm slot state
  const [deleteSlotModal, setDeleteSlotModal] = useState({
    open: false,
    day: "",
    startTime: "",
    endTime: "",
    ids: [] as any,
    enrollment_id: null,
  });

  // Handlers
  const changeTab = useCallback((tab: string) => setActiveTab(tab), []);
  const handleDayFilter = useCallback((value: any) => setDay(value), []);
  const handleSubjectFilter = useCallback(
    (e: any) => setSelectedSubject(JSON.parse(e.target.value)),
    []
  );
  const handleTeacherFilter = useCallback(
    (e: any) => setSelectedTeacher(JSON.parse(e.target.value)),
    []
  );
  const handleStudentFilter = useCallback(
    (e: any) => setSelectedStudent(JSON.parse(e.target.value)),
    []
  );

  // Fetching data group_by_day
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["class-schedules-groupedByDay"],
    queryFn: () => getAllClassSchedules({}, { token }),
  });

  const datesForWeek = useMemo(() => {
    const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayIndex = today.day();

    return dayOrder?.map((shortDay, index) => {
      const offset = index - todayIndex;
      const fullDay = WEEK_DAYS[index];
      return {
        shortDay,
        fullDay,
        date: today.clone().add(offset, "days").format("YYYY-MM-DD"),
      };
    });
  }, [todayDateStr]);

  // Data transformation
  const refractorSchedule = useMemo(() => {
    if (!data) return [];
    const todayIndex = today.day();
    const todayDate = today.clone();
    // Define all possible days in a week
    const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Ensure each day in the week has an entry in the data object
    const completeData = allDays?.reduce((acc: any, day: string) => {
      acc[day] = data[day] || [];
      return acc;
    }, {});
    // Transform and group slots by their correct day
    let refractor = Object?.entries(completeData)?.map(([day, slots]: any) => {
      const dayInfo = datesForWeek?.find((d) => d.shortDay === day);
      return {
        day: dayInfo?.fullDay || "",
        date: dayInfo?.date || "",
        slots: slots
          ?.map((item: any) => {
            const mergeDayTime =
              item?.teacherSchedule?.day_of_week +
              " " +
              item?.teacherSchedule?.start_time;
            const localDayTime = moment
              .utc(mergeDayTime, "ddd HH:mm:ss")
              .local()
              .format("dddd");
            // Find the correct dayInfo for the localDayTime
            const correctDayInfo = datesForWeek.find(
              (d) => d.fullDay === localDayTime
            );
            // Return the item with updated day and date
            return {
              ...item,
              teacherSchedule: {
                ...item.teacherSchedule,
                day_of_week: correctDayInfo?.fullDay || "",
              },
              date: correctDayInfo?.date || "",
            };
          })
          ?.sort((a: any, b: any) => {
            const timeA = moment(a?.teacherSchedule.start_time, "HH:mm:ss");
            const timeB = moment(b?.teacherSchedule.start_time, "HH:mm:ss");
            return timeA.isBefore(timeB) ? -1 : 1;
          }),
      };
    });
    // Group slots by their correct day
    const groupedRefractor = datesForWeek?.map((dayInfo) => {
      const slotsForDay = refractor
        .flatMap((schedule) => schedule.slots)
        .filter(
          (slot) => slot?.teacherSchedule?.day_of_week === dayInfo.fullDay
        );

      return {
        day: dayInfo.fullDay,
        date: dayInfo.date,
        slots: slotsForDay,
      };
    });
    // Sort finalRefractor based on the day of the week
    groupedRefractor?.sort((a, b) => {
      const dayAIndex = WEEK_DAYS.indexOf(a.day);
      const dayBIndex = WEEK_DAYS.indexOf(b.day);
      return (
        ((dayAIndex - todayIndex + 7) % 7) - ((dayBIndex - todayIndex + 7) % 7)
      );
    });
    // Assign correct dates to each day
    return groupedRefractor?.map((item, index) => ({
      ...item,
      date: todayDate.clone().add(index, "days").format("YYYY-MM-DD"),
    }));
  }, [data, datesForWeek, today]);

  // Filtered schedule calculation
  const filteredSchedule = useMemo(() => {
    return refractorSchedule?.map((day: any) => {
      const filteredSlots = day?.slots?.filter((slot: any) => {
        const hasSubjectMatch = selectedSubject?.id
          ? slot?.enrollment?.subject?.id === selectedSubject?.id
          : true;

        const hasTeacherMatch = selectedTeacher?.id
          ? slot?.enrollment?.tutor?.id === selectedTeacher?.id
          : true;

        const hasStudentMatch = selectedStudent?.id
          ? slot?.enrollment?.studentsGroups?.some(
              (student: any) => student?.user?.id === selectedStudent?.id
            )
          : true;

        return hasSubjectMatch && hasTeacherMatch && hasStudentMatch;
      });

      return { ...day, slots: filteredSlots };
    });
  }, [refractorSchedule, selectedSubject, selectedTeacher, selectedStudent]);

  const handleDeleteClassSchedule = useMutation({
    mutationFn: (payload: DeleteClassSchedule_Payload_Type) =>
      deleteClassSchedule(payload, { token }),
    onSuccess: () => {
      toast.success("Class Schedule Delete Successfully");
      setDeleteSlotModal({
        open: false,
        day: "",
        startTime: "",
        endTime: "",
        ids: [],
        enrollment_id: null,
      });
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response.data.error ||
            `${axiosError?.response.status} ${axiosError?.response.statusText}`
        );
      } else {
        toast.error(axiosError?.message);
      }
    },
  });

  const handleDeleteClassScheduleForWeek_foraddExtraClassSchedule = useMutation(
    {
      mutationFn: (payload: any) =>
        cancelClassScheduleForWeek(payload, { token }),
      onSuccess: (data) => {
        if (data && "newRescheduleRequest" in data) {
          toast.success("Extra Slot added successfully.");
        } else {
          toast.success("Class Schedule deleted successfully for the week");
        }
        setDeleteSlotModal({
          open: false,
          day: "",
          startTime: "",
          endTime: "",
          ids: [],
          enrollment_id: null,
        });
      },
      onError: (error) => {
        const axiosError = error as MyAxiosError;
        if (axiosError?.response) {
          toast.error(
            axiosError?.response.data.error ||
              `${axiosError?.response.status} ${axiosError?.response.statusText}`
          );
        } else {
          toast.error(axiosError?.message);
        }
      },
    }
  );

  return (
    <>
      <main className={classes.container}>
        <div className={classes.section1}>
          <div className={classes.wrapper}>
            <FilterDropdown
              placeholder="Filter By Student"
              data={filteredStudents}
              handleChange={handleStudentFilter}
              value={selectedStudent?.name}
              inlineBoxStyles={{ width: "calc(100% - 10px)" }}
              dropDownObject
            />
            <FilterDropdown
              placeholder="Filter By Teacher"
              data={filteredTeachers}
              handleChange={handleTeacherFilter}
              value={selectedTeacher?.name}
              inlineBoxStyles={{ width: "calc(100% - 10px)" }}
              dropDownObject
            />
            <FilterDropdown
              placeholder="Filter By Subject"
              data={filteredSubjects}
              handleChange={handleSubjectFilter}
              value={selectedSubject?.name}
              dropDownObject
              inlineBoxStyles={{ width: "calc(100% - 10px)" }}
            />
            <FilterDropdown
              placeholder="Filter By Day"
              data={WEEK_DAYS}
              handleChange={handleDayFilter}
              value={day}
              inlineBoxStyles={{ width: "calc(100% - 10px)" }}
            />
          </div>
          <Tabs
            tabsArray={tabsArray}
            activeTab={activeTab}
            handleTabChange={changeTab}
            inlineTabsStyles={tabsStyle}
            buttonWidth="max-content"
          />
        </div>
        {isLoading ? (
          <LoadingBox />
        ) : !data || Object.keys(data).length === 0 ? (
          <ErrorBox />
        ) : day ? (
          <TimeView
            day={day}
            subject={selectedSubject || ""}
            teacher={selectedTeacher || ""}
            student={selectedStudent || ""}
            handleBack={() => setDay("")}
            deleteSlotModal={setDeleteSlotModal}
          />
        ) : activeTab === "Calender View" ? (
          <CalenderView
            classSchedules={filteredSchedule}
            handleViewMore={handleDayFilter}
            deleteSlotModal={setDeleteSlotModal}
            role="superAdmin"
          />
        ) : (
          <ListView
            classSchedules={filteredSchedule}
            deleteSlotModal={setDeleteSlotModal}
          />
        )}
      </main>
      <DeleteSlotsModal
        loading={
          handleDeleteClassSchedule?.isPending ||
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.isPending
        }
        modalOpen={deleteSlotModal}
        handleClose={() =>
          setDeleteSlotModal({
            open: false,
            day: "",
            startTime: "",
            endTime: "",
            enrollment_id: null,
            ids: [],
          })
        }
        heading={`${deleteSlotModal?.day}`}
        subHeading={`Are you sure you want to delete slot (${deleteSlotModal?.startTime} to ${deleteSlotModal?.endTime}).`}
        // api functions
        handleDelete={(payload: any) => {
          handleDeleteClassSchedule?.mutate(payload);
        }}
        dayDeletion={(day: string) => {
          const time = moment(deleteSlotModal?.startTime, "hh:mmA").format(
            "HH:mm:ss"
          );
          const dateTime = day + time;
          const payload = {
            user_id: roleId || null,
            enrollment_id: deleteSlotModal?.enrollment_id || null,
            class_status: "CANCELLED",
            class_schedule_id: deleteSlotModal?.ids[0],
            dateTime: moment(dateTime, "DD-MMM-YYYY HH:mm:ss")
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss[Z]"),
          };
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.mutate(
            payload
          );
        }}
        weekDeletion={(day: string) => {
          const time = moment(deleteSlotModal?.startTime, "hh:mm A").format(
            "HH:mm:ss"
          );
          const dateTime = `${day} ${time}`;
          const payload = {
            user_id: roleId || null,
            enrollment_id: deleteSlotModal?.enrollment_id || null,
            class_status: "CANCELLED",
            class_schedule_id: deleteSlotModal?.ids[0],
            dateTime: moment(dateTime).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
          };
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.mutate(
            payload
          );
        }}
      />
    </>
  );
};

export default ClassSchedule;
