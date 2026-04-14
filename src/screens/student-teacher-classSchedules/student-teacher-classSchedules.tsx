"use client";
import { FC, useCallback, useState, CSSProperties, useMemo } from "react";
import styles from "./student-teacher-classSchedules.module.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import moment from "moment";
import CalenderView from "@/components/ui/superAdmin/class-schedule/tabs-view/calender-view/calender-view";
import ListView from "@/components/ui/superAdmin/class-schedule/tabs-view/list-view/list-view";
import WeekDeleteExtraScheduleModal from "@/components/ui/teacher/class-shedule/weekDelete-extraSchedule-modal/weekDelete-extraSchedule-modal";
import Tabs from "@/components/global/tabs/tabs";
import LoadingBox from "@/components/global/loading-box/loading-box";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import { getAllClassSchedules } from "@/services/dashboard/superAdmin/class-schedule/class-schedule-groupedByDay/clas-schedule-groupedByDay";
import { getAllEnrollments } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { cancelClassScheduleForWeek } from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
import { MyAxiosError } from "@/services/error.type";
import { toast } from "react-toastify";

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

const ClassSchedule: FC = () => {
  const tabsStyle = useMemo<CSSProperties>(
    () => ({ flexBasis: "max-content" }),
    []
  );
  // user data
  const { user, token, childrens } = useAppSelector((state) => state.user);
  // Date calculations
  const today = useMemo(() => moment(), []);
  const todayDateStr = useMemo(() => today.format("YYYY-MM-DD"), [today]);
  // State and Selectors
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const { subject } = useAppSelector((state) => state?.resources);

  const filteredSubjects = subject?.map((item) => JSON.stringify(item)) || [];
  const [activeTab, setActiveTab] = useState(tabsArray[0]);
  const [selectedSubject, setSelectedSubject] = useState<any>("");
  const [selectedUser, setSelectedUser] = useState<any>("");

  const [deleteSlotModal, setDeleteSlotModal] = useState({
    open: false,
    day: "",
    date: "",
    startTime: "",
    endTime: "",
    ids: [] as any,
    enrollment_id: null,
  });

  // Handlers
  const changeTab = useCallback((tab: string) => setActiveTab(tab), []);
  const handleSubjectFilter = useCallback(
    (e: any) => setSelectedSubject(JSON.parse(e.target.value)),
    []
  );
  const handleUserFilter = useCallback(
    (e: any) => setSelectedUser(JSON.parse(e.target.value)),
    []
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["class-schedules-groupedByDay", selectedUser, user],
    queryFn: () =>
      getAllClassSchedules(
        {
          tutor_id: user?.roleId === 5 ? user?.id : selectedUser?.id,
          student_id: user?.roleId === 3 ? user?.id : selectedUser?.id,
          childrens:
            user?.roleId === 4
              ? childrens?.map((i: any) => i.id).join(",")
              : undefined,
        },
        { token }
      ),
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

  const refractorSchedule = useMemo(() => {
    if (!data) return [];

    const todayIndex = today.day();
    const todayDate = today.clone();

    const allDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const completeData = allDays?.reduce((acc: any, day: string) => {
      acc[day] = data[day] || [];
      return acc;
    }, {});

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

            const correctDayInfo = datesForWeek.find(
              (d) => d.fullDay === localDayTime
            );

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

    groupedRefractor?.sort((a, b) => {
      const dayAIndex = WEEK_DAYS.indexOf(a.day);
      const dayBIndex = WEEK_DAYS.indexOf(b.day);
      return (
        ((dayAIndex - todayIndex + 7) % 7) - ((dayBIndex - todayIndex + 7) % 7)
      );
    });

    return groupedRefractor?.map((item, index) => ({
      ...item,
      date: todayDate.clone().add(index, "days").format("YYYY-MM-DD"),
    }));
  }, [data, datesForWeek, today]);

  const filteredSchedule = useMemo(() => {
    return refractorSchedule?.map((day: any) => {
      const filteredSlots = day?.slots?.filter((slot: any) => {
        const hasSubjectMatch = selectedSubject?.id
          ? slot?.enrollment?.subject?.id === selectedSubject?.id
          : true;

        const hasUserMatch = selectedUser?.id
          ? user?.roleId === 5
            ? slot?.enrollment?.studentsGroups?.some(
                (student: any) => student?.user?.id === selectedUser?.id
              )
            : slot?.enrollment?.tutor?.id === selectedUser?.id
          : true;

        return hasSubjectMatch && hasUserMatch;
      });

      return { ...day, slots: filteredSlots };
    });
  }, [refractorSchedule, selectedSubject, selectedUser]);

  const { data: enrollmentsData } = useQuery({
    queryKey: ["enrollments", "for-class-schedule"],
    queryFn: () =>
      getAllEnrollments(
        {
          teacher_id: user?.roleId === 5 ? String(user?.id) : "",
          student_id: user?.roleId === 3 ? String(user?.id) : "",
        },
        { token }
      ),
  });

  const filteredUsers = useMemo(() => {
    if (!enrollmentsData?.data) return [];
    const users = user?.roleId === 5 ? students?.users : teachers?.users;
    return users
      ?.filter((u) =>
        enrollmentsData?.data?.some((enrollment) =>
          user?.roleId === 5
            ? enrollment?.studentsGroups?.some(
                (group) => group?.user?.id === u.id
              )
            : enrollment?.tutor?.id === u.id
        )
      )
      ?.map((item) => JSON.stringify(item));
  }, [enrollmentsData?.data, teachers?.users, students?.users, user?.roleId]);

  const handleDeleteClassScheduleForWeek = useMutation({
    mutationFn: async (payload: any) => {
      const time = moment(deleteSlotModal?.startTime, "hh:mm A").format(
        "HH:mm:ss"
      );
      const dateTime = `${deleteSlotModal?.date}T${time}`;
      const response1 = await cancelClassScheduleForWeek(
        {
          user_id: user?.roleId || null,
          enrollment_id: deleteSlotModal?.enrollment_id || null,
          class_status: "CANCELLED",
          class_schedule_id: deleteSlotModal?.ids[0],
          dateTime: moment(dateTime).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
        },
        { token }
      );
      const response2 = await cancelClassScheduleForWeek(
        { ...payload, class_status: "SCHEDULED" },
        { token }
      );

      return { response1, response2 };
    },
    onSuccess: () => {
      toast.success(
        "Class Schedule deleted successfully for this week and rescheduled for another day."
      );

      setDeleteSlotModal({
        open: false,
        day: "",
        date: "",
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
      setDeleteSlotModal({
        open: false,
        day: "",
        date: "",
        startTime: "",
        endTime: "",
        ids: [],
        enrollment_id: null,
      });
    },
  });

  return (
    <>
      <main className={styles.container}>
        <div className={styles.section1}>
          {user?.roleId === 5 ? (
            <FilterDropdown
              placeholder="Filter By Student"
              data={filteredUsers || []}
              handleChange={handleUserFilter}
              value={JSON.stringify(selectedUser)}
              dropDownObject
              inlineBoxStyles={{ flexGrow: 1 }}
            />
          ) : (
            <FilterDropdown
              placeholder="Filter By Teacher"
              data={filteredUsers || []}
              handleChange={handleUserFilter}
              value={JSON.stringify(selectedUser)}
              inlineBoxStyles={{ flexGrow: 1 }}
              dropDownObject
            />
          )}
          <FilterDropdown
            placeholder="Filter By Subject"
            data={filteredSubjects || []}
            handleChange={handleSubjectFilter}
            value={JSON.stringify(selectedSubject)}
            inlineBoxStyles={{ flexGrow: 1 }}
            dropDownObject
          />
          <Tabs
            tabsArray={tabsArray}
            activeTab={activeTab}
            handleTabChange={changeTab}
            inlineTabsStyles={tabsStyle}
          />
        </div>
        {isLoading ? (
          <LoadingBox />
        ) : activeTab === "Calender View" ? (
          <CalenderView
            classSchedules={filteredSchedule}
            deleteSlotModal={
              user?.roleId === 5 ? setDeleteSlotModal : undefined
            }
            role={user?.roleId === 5 ? "teacher" : "student"}
          />
        ) : (
          <ListView
            classSchedules={filteredSchedule}
            deleteSlotModal={
              user?.roleId === 5 ? setDeleteSlotModal : undefined
            }
            role={user?.roleId === 5 ? "teacher" : "student"}
          />
        )}
      </main>
      {user?.roleId === 5 && (
        <WeekDeleteExtraScheduleModal
          classSchedule={filteredSchedule}
          loading={handleDeleteClassScheduleForWeek?.isPending}
          success={handleDeleteClassScheduleForWeek?.isSuccess}
          modalOpen={deleteSlotModal}
          handleClose={() =>
            setDeleteSlotModal({
              open: false,
              day: "",
              date: "",
              startTime: "",
              endTime: "",
              enrollment_id: null,
              ids: [],
            })
          }
          heading={`${deleteSlotModal?.day} `}
          subHeading={`Are you sure you want to cancel slot "${deleteSlotModal?.date}" (${deleteSlotModal?.startTime} to ${deleteSlotModal?.endTime}) and reschedule it for another day.`}
          handleWeekDelete={(payload: any) => {
            handleDeleteClassScheduleForWeek?.mutate({
              ...payload,
              user_id: user?.roleId || null,
              enrollment_id: deleteSlotModal?.enrollment_id || null,
              class_status: "SCHEDULED",
            });
          }}
        />
      )}
    </>
  );
};

export default ClassSchedule;
