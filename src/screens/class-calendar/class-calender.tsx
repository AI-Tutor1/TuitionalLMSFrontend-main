"use client";
import moment from "moment";
import { toast } from "react-toastify";
import { useCallback, useState, useMemo, memo } from "react";
import classes from "./class-calender.module.css";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { MyAxiosError } from "@/services/error.type";
import {
  getAllClassSchedules,
  exportAllClassSchedules,
  exportAllClassSchedulesOld,
} from "@/services/dashboard/superAdmin/class-schedule/class-schedule-groupedByDay/clas-schedule-groupedByDay";
import { rescheduleRequest } from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
import { DeleteClassSchedule_Payload_Type } from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.types";
import {
  deleteClassSchedule,
  deleteRescheduleRequest,
  cancelClassScheduleForWeek,
} from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import CalenderView from "@/components/ui/superAdmin/class-calendar/calendar-view/calendar";
import ListView from "@/components/ui/superAdmin/class-calendar/list-view/list-view";
import DeleteCancelledSchedulledClassModal from "@/components/ui/superAdmin/class-calendar/delete-enrollment-modal/delete-enrollment-modal";
import DeleteNormalSlotModal from "@/components/ui/superAdmin/enrollment-details/deleteSlots-modal/deleteSlots-modal";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import Tabs from "@/components/global/tabs/tabs";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ListIcon from "@mui/icons-material/List";
import { useMediaQuery } from "react-responsive";
import Button from "@/components/global/button/button";

// Initial modal states to avoid repetition
const INITIAL_CANCELLED_MODAL_STATE = { id: null, open: false };
const INITIAL_NORMAL_SLOT_MODAL_STATE = {
  open: false,
  day: "",
  startTime: "",
  endTime: "",
  ids: [],
  enrollment_id: null,
};
const TABS_ARR = [
  {
    text: "Calendar1",
    icon: (
      <CalendarMonthIcon
        sx={{ fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)" }}
      />
    ),
  },
  {
    text: "List",
    icon: (
      <ListIcon
        sx={{ fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)" }}
      />
    ),
  },
];
const tabsStyle = {
  width: "max-content",
  alignSelf: "flex-end",
};

const ClassCalendar = ({ role }: { role: string }) => {
  // Use Redux selectors efficiently
  const mobileViewport = useMediaQuery({ maxWidth: 576 });
  const { token, user, childrens } = useAppSelector((state) => state?.user);
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const { subject } = useAppSelector((state) => state?.resources);
  const [dateFilter, setDateFilter] = useState<any>([
    moment().startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);
  const [selectedSubject, setSelectedSubject] = useState<any>("");
  const [selectedTeacher, setSelectedTeacher] = useState<any>("");
  const [selectedStudent, setSelectedStudent] = useState<any>("");
  const [selectedStatus, setSelectedStatus] = useState<any>("");
  const [selectedSlotType, setSelectedSlotType] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>(TABS_ARR[0]?.text);
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);

  // Modal states
  const [cancelledSchedulledClassModal, setCancelledSchedulledClassModal] =
    useState(INITIAL_CANCELLED_MODAL_STATE);
  const [normalSlotModal, setNormalSlotModal] = useState(
    INITIAL_NORMAL_SLOT_MODAL_STATE,
  );

  // Memoized filter data
  const filteredTeachers = useMemo(
    () => teachers?.users?.map((item) => JSON.stringify(item)) || [],
    [teachers],
  );
  const filteredStudents = useMemo(
    () => students?.users?.map((item) => JSON.stringify(item)) || [],
    [students],
  );
  const filteredSubjects = useMemo(
    () => subject?.map((item) => JSON.stringify(item)) || [],
    [subject],
  );

  // Memoized handlers

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  const handleCalendar = useCallback((value: any) => {
    if (value === null) {
      setDateFilter("");
    } else {
      setDateFilter(value);
    }
  }, []);
  const handleSubjectFilter = useCallback(
    (e: any) => setSelectedSubject(JSON.parse(e.target.value)),
    [],
  );
  const handleTeacherFilter = useCallback(
    (e: any) => setSelectedTeacher(JSON.parse(e.target.value)),
    [],
  );
  const handleStudentFilter = useCallback(
    (e: any) => setSelectedStudent(JSON.parse(e.target.value)),
    [],
  );
  const handleStatusFilter = useCallback((value: string) => {
    if (value) {
      if (value === "On break") setSelectedStatus("true");
      else {
        setSelectedStatus("false");
      }
    } else {
      setSelectedStatus("");
    }
  }, []);

  const handleSlotTypeFilter = useCallback((value: string) => {
    if (value) {
      const slotType = value.toLowerCase();
      setSelectedSlotType(slotType);
    } else {
      setSelectedSlotType("");
    }
  }, []);

  const handleCancelledSchedulledSlot = useCallback((item: any) => {
    setCancelledSchedulledClassModal({ ...item });
  }, []);
  const handleNormalSlot = useCallback((item: any) => {
    setNormalSlotModal({ ...item });
  }, []);

  const changeTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // cancelled and schedulled slot modal close
  const handleCancelledSchedulledClassModalClose = useCallback(() => {
    setCancelledSchedulledClassModal(INITIAL_CANCELLED_MODAL_STATE);
  }, []);

  // normal slot modal close
  const handleNormalSlotModalClose = useCallback(() => {
    setNormalSlotModal(INITIAL_NORMAL_SLOT_MODAL_STATE);
  }, []);

  // Fetch class schedules
  const classSchedulesQueryParams = useMemo(() => {
    if (role === "teacher") {
      return { tutor_id: user?.id };
    } else if (role === "student") {
      return { student_id: user?.id };
    } else if (role === "parent") {
      return { childrens: childrens?.map((i: any) => i.id).join(",") };
    }
    return {};
  }, [role, user?.id]);

  const { isPending: isExporting, mutate: triggerExport } = useMutation({
    mutationKey: ["export-class-schedules"],
    mutationFn: () => exportAllClassSchedules({ token }),
    onSuccess: (response) => {
      if (response) {
        toast.success("Class schedules exported successfully");
      }
    },
    onError: (error) => {
      toast.error("Failed to export class schedules");
    },
  });

  const { isPending: isExportingOld, mutate: triggerExportOld } = useMutation({
    mutationKey: ["export-class-schedules-old"],
    mutationFn: () => exportAllClassSchedulesOld({ token }),
    onSuccess: (response) => {
      if (response) {
        toast.success("Class schedules (old) exported successfully");
      }
    },
    onError: (error) => {
      toast.error("Failed to export class schedules (old)");
    },
  });

  const {
    data: classSchedulesData,
    isLoading: isClassSchedulesLoading,
    refetch: refetchClassSchedulesData,
  } = useQuery({
    queryKey: ["class-schedules-groupedByDay", role, user?.id],
    queryFn: () => getAllClassSchedules(classSchedulesQueryParams, { token }),
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 120000,
  });

  // Fetch reschedule requests
  const rescheduleRequestQueryParams = useMemo(() => {
    if (role === "teacher") {
      return { tutor_ids: [user?.id] };
    } else if (role === "student") {
      return { student_ids: [user?.id] };
    } else if (role === "parent") {
      return { student_ids: childrens?.map((i: any) => i.id) };
    }
    return {};
  }, [role, user?.id]);

  const {
    data: rescheduleRequestData,
    isLoading: isRescheduleRequestLoading,
    refetch: refetchRescheduleRequestData,
  } = useQuery({
    queryKey: ["reschedule-requests", role, user?.id, dateFilter],
    queryFn: () =>
      rescheduleRequest(
        {
          startDate: moment(dateFilter[0]).format("YYYY-MM-DD") || "",
          endDate:
            moment(dateFilter[1]).add(1, "day").format("YYYY-MM-DD") || "",
        },
        { token },
        rescheduleRequestQueryParams,
      ),
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 120000,
  });

  // Refactor class schedule data
  const refactorClassSchedule = useMemo(() => {
    if (!classSchedulesData) return [];

    const getNextDateForDay = (
      dayOfWeek: string,
      time: string,
      offsetDays = 0,
    ) => {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      const currentDay = today.getDay();
      const targetDay = daysOfWeek.indexOf(dayOfWeek);
      let daysUntilNext = (targetDay + 7 - currentDay) % 7;
      if (daysUntilNext === 0) daysUntilNext = 7;

      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysUntilNext + offsetDays);

      const [hours, minutes, seconds] = time.split(":").map(Number);
      nextDate.setUTCHours(hours, minutes, seconds, 0);

      return new Date(
        nextDate.toLocaleString("en-US", {
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      );
    };

    const result = Object.entries(classSchedulesData).flatMap(([key, items]) =>
      items.map((item) => ({ ...item, day: key })),
    );

    const events = result?.flatMap((item: any) =>
      Array.from({ length: 5 }, (_, i) => {
        const startDate = getNextDateForDay(
          item.teacherSchedule.day_of_week,
          item.teacherSchedule.start_time,
          (i - 1) * 7,
        );
        const endDate = new Date(startDate);
        endDate.setMinutes(
          startDate.getMinutes() + item.teacherSchedule.session_duration,
        );

        return {
          type: "normal slot",
          id: item.id,
          status: item.status,
          start: startDate,
          end: endDate,
          title: ` ${
            item.enrollment?.studentsGroups[0]?.user?.name
              ?.trim()
              .split(" ")[0] || "No Show"
          } x ${
            item.enrollment?.tutor?.name?.trim()?.split(" ")[0] || "No Show"
          }`,
          slotData: item,
        };
      }),
    );

    // Apply date filter if dateFilter is available
    if (
      dateFilter &&
      dateFilter.length === 2 &&
      dateFilter[0] &&
      dateFilter[1]
    ) {
      const filterStartDate = moment(dateFilter[0]).startOf("day").toDate();
      const filterEndDate = moment(dateFilter[1]).endOf("day").toDate();

      return events?.filter((event) => {
        const eventDate = new Date(event.start);
        return eventDate >= filterStartDate && eventDate <= filterEndDate;
      });
    }

    return events;
  }, [classSchedulesData, refetchClassSchedulesData, dateFilter]);

  // Refactor reschedule requests data
  const refactorResheduleRequests = useMemo(() => {
    if (!rescheduleRequestData) return [];

    return rescheduleRequestData?.map((item: any) => ({
      type: "extra slot",
      id: item.id,
      start: moment.utc(item.DateTime).local().toDate(),
      end: moment.utc(item.DateTime).local().add(60, "minutes").toDate(),
      status: item.class_status,
      title: ` ${
        item.enrollment?.students[0]?.name?.split(" ")[0].trim() || "No Show"
      } X ${item.enrollment?.tutor?.name.split(" ")[0].trim() || "No Show"}`,
      slotData: item,
    }));
  }, [rescheduleRequestData, refetchRescheduleRequestData]);

  const allClasses = useMemo(() => {
    return [...refactorClassSchedule, ...refactorResheduleRequests];
  }, [refactorClassSchedule, refactorResheduleRequests]);

  //  filtered classes logic
  const filteredClasses = useMemo(() => {
    return allClasses?.filter((classItem) => {
      const slot = classItem?.slotData;
      if (!slot || !slot.enrollment) return false;
      const hasSubjectMatch = selectedSubject?.id
        ? slot?.enrollment?.subject?.id === selectedSubject?.id
        : true;

      const hasTeacherMatch = selectedTeacher?.id
        ? slot?.enrollment?.tutor?.id === selectedTeacher?.id
        : true;

      const hasStudentMatch = !selectedStudent?.id
        ? true
        : slot?.enrollment?.studentsGroups
          ? slot.enrollment.studentsGroups.some(
              (student: any) => student.student_id === selectedStudent?.id,
            )
          : slot?.enrollment?.students
            ? slot.enrollment.students.some(
                (student: any) => student?.id === selectedStudent?.id,
              )
            : true;

      const hasStatusMatch =
        selectedStatus === ""
          ? true
          : (classItem?.slotData?.enrollment?.on_break ?? false) ===
            (selectedStatus === "true");

      const hasSlotTypeMatch =
        selectedSlotType === "" ? true : classItem?.type === selectedSlotType;

      return (
        hasSubjectMatch &&
        hasTeacherMatch &&
        hasStudentMatch &&
        hasStatusMatch &&
        hasSlotTypeMatch
      );
    });
  }, [
    selectedSubject,
    selectedStudent,
    selectedTeacher,
    selectedStatus,
    selectedSlotType,
    allClasses,
  ]);

  const handleDeleteCancelledSchedulledClassSlot = useMutation({
    mutationFn: (payload: number) =>
      deleteRescheduleRequest({ id: String(payload) }, { token }),
    onSuccess: (data) => {
      toast.success(
        `${
          data && data.message
            ? data.message
            : "Reschedule request deleted successfully"
        }`,
      );
      setCancelledSchedulledClassModal({ id: null, open: false });
      refetchClassSchedulesData();
      refetchRescheduleRequestData();
    },
    onError: (error: MyAxiosError) => {
      if (error?.response) {
        toast.error(
          error.response.data.error ||
            `${error.response.status} ${error.response.statusText}`,
        );
      } else {
        toast.error(error.message);
      }
      setCancelledSchedulledClassModal({ id: null, open: false });
    },
  });

  const handlePermanentDeleteClassSchedule = useMutation({
    mutationFn: (payload: DeleteClassSchedule_Payload_Type) =>
      deleteClassSchedule(payload, { token }),
    onSuccess: () => {
      toast.success("Class Schedule Delete Successfully");
      setNormalSlotModal({
        open: false,
        day: "",
        startTime: "",
        endTime: "",
        ids: [],
        enrollment_id: null,
      });
      refetchClassSchedulesData();
      refetchRescheduleRequestData();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response.data.error ||
            `${axiosError?.response.status} ${axiosError?.response.statusText}`,
        );
      } else {
        toast.error(axiosError?.message);
      }
      setNormalSlotModal({
        open: false,
        day: "",
        startTime: "",
        endTime: "",
        ids: [],
        enrollment_id: null,
      });
    },
  });

  const handlePermanentDeleteClassScheduleForWeek_foraddExtraClassSchedule =
    useMutation({
      mutationFn: (payload: any) =>
        cancelClassScheduleForWeek(payload, { token }),
      onSuccess: (data) => {
        if (data && "newRescheduleRequest" in data) {
          toast.success("Extra Slot added successfully.");
        } else {
          toast.success("Class Schedule deleted successfully for the week");
        }
        setNormalSlotModal({
          open: false,
          day: "",
          startTime: "",
          endTime: "",
          ids: [],
          enrollment_id: null,
        });
        refetchClassSchedulesData();
        refetchRescheduleRequestData();
      },
      onError: (error) => {
        const axiosError = error as MyAxiosError;
        if (axiosError?.response) {
          toast.error(
            axiosError?.response.data.error ||
              `${axiosError?.response.status} ${axiosError?.response.statusText}`,
          );
        } else {
          toast.error(axiosError?.message);
        }
        setNormalSlotModal({
          open: false,
          day: "",
          startTime: "",
          endTime: "",
          ids: [],
          enrollment_id: null,
        });
      },
    });

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: {
        width: "max-content",
        alignSelf: "flex-end",
      },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  return (
    <>
      <main className={classes.container}>
        <div className={classes.filtersBox}>
          {/* Show filters: always on desktop, conditionally on mobile */}
          {(!mobileViewport || showFullFilters) && (
            <>
              <FilterByDate
                changeFn={handleCalendar}
                value={dateFilter || null}
                flex={1}
                minWidth="135px"
                background="var(--main-white-color)"
              />
              {role !== "student" && (
                <FilterDropdown
                  placeholder="Filter student"
                  data={filteredStudents}
                  handleChange={handleStudentFilter}
                  value={JSON.stringify(selectedStudent)}
                  dropDownObject
                  inlineBoxStyles={styles.dropDownStyles}
                />
              )}
              {role !== "teacher" && (
                <FilterDropdown
                  placeholder="Filter teacher"
                  data={filteredTeachers}
                  handleChange={handleTeacherFilter}
                  value={JSON.stringify(selectedTeacher)}
                  dropDownObject
                  inlineBoxStyles={styles.dropDownStyles}
                />
              )}
              <FilterDropdown
                placeholder="Filter subject"
                data={filteredSubjects}
                handleChange={handleSubjectFilter}
                value={JSON.stringify(selectedSubject)}
                dropDownObject
                inlineBoxStyles={styles.dropDownStyles}
              />
              <FilterDropdown
                placeholder="Filter type"
                data={["Normal Slot", "Extra Slot"]}
                handleChange={handleSlotTypeFilter}
                value={selectedSlotType}
                inlineBoxStyles={styles.dropDownStyles}
              />
              {role !== "student" && role !== "teacher" && (
                <FilterDropdown
                  placeholder="Filter status"
                  data={["On break", "On going"]}
                  handleChange={handleStatusFilter}
                  value={
                    selectedStatus
                      ? selectedStatus === "true"
                        ? "On break"
                        : "On going"
                      : ""
                  }
                  inlineBoxStyles={styles.dropDownStyles}
                />
              )}
            </>
          )}

          {/* Only show filter button on mobile */}
          {mobileViewport && (
            <MobileFilterButton {...mobileFilterButtonProps} />
          )}
          <Button
            text="Export Data"
            clickFn={() => triggerExport()}
            inlineStyling={styles.buttonStyles}
            loading={isExporting}
          />
          <Button
            text="Export Data Old"
            clickFn={() => triggerExportOld()}
            inlineStyling={{...styles.buttonStyles, width: 'max-content', padding: '0 10px'}}
            loading={isExportingOld}
          />
          <Tabs
            tabsArray={TABS_ARR}
            activeTab={activeTab}
            handleTabChange={changeTab}
            inlineTabsStyles={tabsStyle}
            buttonWidth="max-content"
            icon
            buttonPadding="0px 5px"
          />
        </div>

        {isClassSchedulesLoading || isRescheduleRequestLoading ? (
          <LoadingBox />
        ) : filteredClasses?.length === 0 ? (
          <ErrorBox />
        ) : activeTab === "List" ? (
          <ListView
            events={filteredClasses || []}
            handleCancelledSchedulledSlot={
              role === "superAdmin" || role === "admin"
                ? handleCancelledSchedulledSlot
                : undefined
            }
            handleNormalSlot={
              role === "superAdmin" || role === "admin"
                ? handleNormalSlot
                : undefined
            }
          />
        ) : activeTab === "Calendar1" ? (
          <CalenderView
            events={filteredClasses || []}
            handleCancelledScheduledSlot={
              role === "superAdmin" || role === "admin"
                ? handleCancelledSchedulledSlot
                : undefined
            }
            handleNormalSlot={
              role === "superAdmin" || role === "admin"
                ? handleNormalSlot
                : undefined
            }
          />
        ) : null}
      </main>
      {/* cancelled and schedulled slot modal */}
      {(role === "superAdmin" || role === "admin") && (
        <>
          <DeleteCancelledSchedulledClassModal
            modalOpen={cancelledSchedulledClassModal}
            handleClose={handleCancelledSchedulledClassModalClose}
            subHeading="Are you sure you want to delete this schedule? This action is permanent."
            heading="Are You Sure?"
            handleDeleteSlot={() => {
              if (cancelledSchedulledClassModal?.id === null) return;
              handleDeleteCancelledSchedulledClassSlot?.mutate(
                cancelledSchedulledClassModal?.id,
              );
            }}
            loading={handleDeleteCancelledSchedulledClassSlot?.isPending}
          />
          {/* normal slot modal */}
          <DeleteNormalSlotModal
            loading={
              handlePermanentDeleteClassSchedule?.isPending ||
              handlePermanentDeleteClassScheduleForWeek_foraddExtraClassSchedule?.isPending
            }
            modalOpen={normalSlotModal}
            handleClose={handleNormalSlotModalClose}
            heading={`${normalSlotModal?.day}`}
            subHeading={`Are you sure you want to delete/remove slot (${normalSlotModal?.startTime} to ${normalSlotModal?.endTime}).`}
            handleDelete={(payload: any) => {
              handlePermanentDeleteClassSchedule?.mutate(payload);
            }}
            dayDeletion={(data: { day: string; selectRole: string }) => {
              const time = moment(normalSlotModal?.startTime, "hh:mmA").format(
                "HH:mm:ss",
              );
              const dateTime = data.day + time;
              const payload = {
                user_id: user?.roleId || null,
                enrollment_id: normalSlotModal?.enrollment_id || null,
                class_status: "CANCELLED",
                class_schedule_id: normalSlotModal?.ids[0],
                dateTime: moment(dateTime, "DD-MMM-YYYY HH:mm:ss")
                  .utc()
                  .format("YYYY-MM-DDTHH:mm:ss[Z]"),
                cancelBy: data.selectRole ? data.selectRole.toUpperCase() : "",
              };
              handlePermanentDeleteClassScheduleForWeek_foraddExtraClassSchedule?.mutate(
                payload,
              );
            }}
            weekDeletion={(data: { day: string; selectRole: string }) => {
              const time = moment(normalSlotModal?.startTime, "hh:mm A").format(
                "HH:mm:ss",
              );
              const dateTime = `${data.day} ${time}`;
              const payload = {
                user_id: user?.roleId || null,
                enrollment_id: normalSlotModal?.enrollment_id || null,
                class_status: "CANCELLED",
                class_schedule_id: normalSlotModal?.ids[0],
                dateTime: moment(dateTime)
                  .utc()
                  .format("YYYY-MM-DDTHH:mm:ss[Z]"),
                cancelBy: data.selectRole
                  ? data.selectRole.toLocaleUpperCase()
                  : "",
              };
              handlePermanentDeleteClassScheduleForWeek_foraddExtraClassSchedule?.mutate(
                payload,
              );
            }}
          />
        </>
      )}
    </>
  );
};

export default memo(ClassCalendar);

const styles = {
  dropDownStyles: {
    minWidth: "135px",
    flex: "1",
    background: "var(--main-white-color)",
  },
  buttonStyles: {
    width: "110px",
  },
};
