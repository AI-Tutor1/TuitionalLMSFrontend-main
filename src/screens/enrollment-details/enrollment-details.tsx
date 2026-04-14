"use client";
import React, { useState, useCallback, useEffect, useMemo, FC } from "react";
import { toast } from "react-toastify";
import { Container, Box, CircularProgress } from "@mui/material";
import classes from "./enrollment-details.module.css";
import { MyAxiosError } from "@/services/error.type";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import moment from "moment";
import Image from "next/image";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useAppDispatch } from "@/lib/store/hooks/hooks";
import { fetchResources } from "@/lib/store/slices/resources-slice";
import { fetchUsersByGroup } from "@/lib/store/slices/usersByGroup-slice";
import {
  rescheduleRequest,
  addTeacherSchedule,
  cancelClassScheduleForWeek,
  deleteClassSchedule,
  confirmClassSchedule,
  removeAvailableSlotFn,
} from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id";
import {
  Create_TeacherSchedule_Payload,
  ConfirmClassSchedule_Payload,
  DeleteClassSchedule_Payload_Type,
} from "@/services/dashboard/superAdmin/enrollments/getEnrollmentByGroup-id/getEnrollmentByGroup-id.types";
import {
  deleteEnrollment,
  changeBreakStatus,
  editEnrollmentByGroupId,
  getEnrollmentByGroupId,
  getEnrollmentStatusLog,
} from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { getAllSessions } from "@/services/dashboard/superAdmin/sessions/sessions";
import BasicSwitches from "@/components/global/toggle-button/toggle-button";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import TeacherSceduleAddModal from "@/components/ui/superAdmin/enrollment-details/teacherSchedule-add-modal/teacherSchedule-add-modal";
import TeacherExtraSceduleAddModal from "@/components/ui/superAdmin/enrollment-details/teacherExtraSchedule-modal/teacherExtraSchedule-modal";
import SlotsConfirmModal from "@/components/ui/superAdmin/enrollment-details/slots-confirm-modal/slots-confirm-modal";
import DeleteSlotsModal from "@/components/ui/superAdmin/enrollment-details/deleteSlots-modal/deleteSlots-modal";
import RemoveAvailableSlotsModal from "@/components/ui/superAdmin/enrollment-details/remove-availableSlots-modal/remove-availableSlots-modal";
import ClassSchedule from "./tabs-view/class-schedule/class-schedule";
import DeleteEnrollmentModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import EditEnrollmentModal from "@/components/ui/superAdmin/enrollment/edit-enrollment-modal/edit-enrollment-modal";
import Sessions from "./tabs-view/sessions/sessions";
import Detail from "./tabs-view/detail/detail";
import { ChangeEnrollmentBrekStatus_Api_Payload_Type } from "@/types/enrollment/getAllEnrollments.types";
import EnrollmentPauseModal from "@/components/ui/superAdmin/enrollment/enrollment-pause-modal/enrollment-pause-modal";

const Tabs = dynamic(() => import("@/components/global/tabs/tabs"));
const ADMIN_ROLES = new Set(["superAdmin", "admin", "counsellor", "hr"]);
const tabsArray = ["Detail", "Class Schedule", "Sessions"];

const EnrollmentDetailsForm: FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { id, role } = useParams();
  const { token, user } = useAppSelector((state) => state?.user);
  const { subject, curriculum, board, grades } = useAppSelector(
    (state) => state?.resources,
  );
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const dayNames: any = useMemo(
    () => ({
      Sun: "Sunday",
      Mon: "Monday",
      Tue: "Tuesday",
      Wed: "Wednesday",
      Thu: "Thursday",
      Fri: "Friday",
      Sat: "Saturday",
    }),
    [],
  );
  const dayOrder = useMemo(
    () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    [],
  );
  const canToggleBreak = useMemo(() => ADMIN_ROLES.has(role as string), [role]);
  // tabs states
  const [activeTab, setActiveTab] = useState(tabsArray[0]);
  // transform data state
  const [transformedSchedules, setTransformedSchedules] = useState<any>([]);
  // modal states
  // delete enrollment modal state
  const [deleteEnrollmentModal, setDeleteEnrollmentModal] =
    useState<any>(false);
  // edit enrollment modal state
  const [editEnrollmentModal, setEditEnrollmentModal] = useState<any>(false);
  // remove available state
  const [removeAvailableSlot, setRemoveAvailableSlot] = useState<any>({
    open: false,
    id: null,
    day: "",
    startTime: "",
    endTime: "",
  });
  // add teacher slot state
  const [addTeacherScheduleModal, setaddTeacherScheduleModal] = useState({
    id: "",
    open: false,
    transformedSchedulesArr: [],
  });
  const [addExtraTeacherScheduleModal, setAddExtraTeacherScheduleModal] =
    useState({ open: false, transformedSchedulesArr: [] });
  // confirm available slot state
  const [confirmSlotModal, setConfirmSlotModal] = useState<any>({
    open: false,
    day: "",
    teacher_schedule_id: null,
    enrollment_id: null,
    startTime: "",
    endTime: "",
  });
  // delete condirm slot state
  const [deleteSlotModal, setDeleteSlotModal] = useState({
    open: false,
    day: "",
    startTime: "",
    endTime: "",
    ids: [] as any,
  });
  const [pauseModal, setPauseModal] = useState<any>({
    open: false,
    id: null,
    name: "",
    on_break: null,
    is_permanent: null,
  });

  // delete-user modal open/close  functions
  const handleDeleteModalClose = useCallback(() => {
    setDeleteEnrollmentModal(false);
  }, []);

  const handleSwitch = useCallback(
    (
      e: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>,
      payload: {
        id: number | null;
        name: string;
        on_break: boolean | null;
        is_permanent: null | false | true;
      },
    ) => {
      e.stopPropagation();
      setPauseModal({
        open: true,
        id: payload?.id,
        name: payload?.name,
        on_break: payload?.on_break,
        is_permanent: payload?.is_permanent,
      });
    },
    [],
  );

  const handlePauseModelClose = useCallback(() => {
    setPauseModal({
      open: false,
      id: null,
      name: "",
      on_break: null,
      is_permanent: null,
    });
  }, []);

  const transformClassSchedules = useCallback(
    (classSchedules: any) => {
      const sortByStartTime = (arr: any[]) =>
        arr.sort((a, b) => {
          const localTimeA = moment
            .utc(a?.teacher_schedule?.start_time, "HH:mm:ss")
            .local();
          const localTimeB = moment
            .utc(b?.teacher_schedule?.start_time, "HH:mm:ss")
            .local();
          return localTimeA.isBefore(localTimeB) ? -1 : 1;
        });

      const updatedSchedules: Record<string, any[]> = dayOrder.reduce(
        (acc: Record<string, any[]>, day: string) => {
          acc[day] = [];
          return acc;
        },
        {},
      );
      Object.keys(classSchedules).forEach((day: string) => {
        if (day === "undefined" || !day) return;

        classSchedules[day]?.forEach((schedule: any) => {
          if (!schedule?.teacher_schedule?.start_time) return;

          const startTimeUTC = moment.utc(
            `${dayNames[day]} ${schedule.teacher_schedule.start_time}`,
            "ddd HH:mm:ss",
          );
          const localStartTime = startTimeUTC.clone().local();
          const localDayOfWeek = localStartTime.format("ddd");

          schedule.teacher_schedule.start_time =
            localStartTime.format("HH:mm:ss");
          schedule.teacher_schedule.day_of_week = localDayOfWeek;

          const localDayKey = Object.keys(dayNames).find(
            (key) => dayNames[key].substr(0, 3) === localDayOfWeek,
          );

          if (localDayKey) {
            updatedSchedules[localDayKey].push(schedule);
          }
        });
      });

      // Get today's key and reorder dayOrder to start from today
      const todayKey = moment().format("ddd"); // e.g., "Wed"
      const reorderedDayOrder = [
        ...dayOrder.slice(dayOrder.indexOf(todayKey)),
        ...dayOrder.slice(0, dayOrder.indexOf(todayKey)),
      ];

      // Get today's date as the base date
      const todayDate = moment();

      // Create the transformed schedule using the reordered dayOrder
      const transformed = reorderedDayOrder.map(
        (day: string, index: number) => ({
          date: todayDate.clone().add(index, "days").format("YYYY-MM-DD"), // Increment date by index
          key: day,
          name: dayNames[day],
          slotsArr: sortByStartTime(updatedSchedules[day]),
        }),
      );

      setTransformedSchedules(transformed);
    },
    [dayNames, dayOrder],
  );

  // get enrollments by group id
  const { data, error, isLoading, refetch } = useQuery<any>({
    queryKey: ["getEnrollmentByGroupId", id],
    queryFn: () => getEnrollmentByGroupId(id as string, { token }),
    enabled: !!id && !!token,
    staleTime: 120000, // 2 minutes
  });

  // get logs by enrollment
  const {
    data: logsData,
    error: logsError,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useQuery<any>({
    queryKey: ["getEnrollmentStatusLog", id],
    queryFn: () => getEnrollmentStatusLog(id as string, { token }),
    enabled: !!id && !!token,
    staleTime: 120000, // 2 minutes
  });

  // get sessions by enrollment id
  const {
    data: sessionByEnrollmentData,
    error: sessionByEnrollmentError,
    isLoading: sessionByEnrollmentLoading,
  } = useQuery({
    queryKey: ["getSessionsByEnrollmentId"],
    queryFn: () =>
      getAllSessions(
        { enrollment_id: id ? String(id) : "" },
        {
          token,
        },
      ),
    enabled: !!id && !!token,
    staleTime: 120000, // 2 minutes
  });

  // get all reschedule request with enrollment id
  const handleRescheduleRequest_withEnrollmentId = useMutation({
    mutationFn: (payload: any) =>
      rescheduleRequest(
        {},
        {
          token,
        },
        payload,
      ),

    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
      // setDeleteEnrollmentModal(false);
    },
  });

  //edit enrollment
  const handleEditEnrollment = useMutation({
    mutationFn: (payload: any) =>
      editEnrollmentByGroupId(id as any, payload, {
        token,
      }),
    onSuccess: () => {
      toast.success("Enrollment Edit Successfully.");
      setEditEnrollmentModal(false);
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  //delete enrollment
  const handleDelete = useMutation({
    mutationFn: (payload: any) =>
      deleteEnrollment(payload, {
        token,
      }),
    onSuccess: () => {
      router.push("/enrollments");
      toast.success("Enrollment Deleted Successfully");
      setDeleteEnrollmentModal(false);
      refetch();
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
      setDeleteEnrollmentModal(false);
    },
  });

  // add teacher schedule
  const handleAddTeacherSchedule = useMutation({
    mutationFn: (payload: Create_TeacherSchedule_Payload) =>
      addTeacherSchedule(payload, { token }),
    onSuccess: () => {
      toast.success("Teacher Schedule Added Successfully");
      setaddTeacherScheduleModal({
        id: "",
        open: false,
        transformedSchedulesArr: transformedSchedules,
      });
      refetch();
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
    },
  });

  const handleConfirmClassSchedule = useMutation({
    mutationFn: (payload: ConfirmClassSchedule_Payload) =>
      confirmClassSchedule(payload, { token }),
    onSuccess: () => {
      toast.success("Class Schedule Confirmed Successfully");
      setConfirmSlotModal({
        open: false,
        day: "",
        startTime: "",
        endTime: "",
      });
      refetch();
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
    },
  });

  const handleDeleteClassScheduleForWeek_foraddExtraClassSchedule = useMutation(
    {
      mutationFn: (payload: any) =>
        cancelClassScheduleForWeek(payload, { token }),
      onSuccess: (data) => {
        if (data && "newRescheduleRequest" in data) {
          toast.success("Extra Slot added successfully.");
          setAddExtraTeacherScheduleModal({
            open: false,
            transformedSchedulesArr: [],
          });
        } else {
          toast.success("Class Schedule deleted successfully for the week");
          setDeleteSlotModal({
            open: false,
            day: "",
            startTime: "",
            endTime: "",
            ids: [],
          });
        }
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
      },
    },
  );

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
      });
      refetch();
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
    },
  });

  const handleRemoveAvailableSlot = useMutation({
    mutationFn: (payload: string) => removeAvailableSlotFn(payload, { token }),
    onSuccess: () => {
      toast.success("Class Schedule Delete Successfully");
      setRemoveAvailableSlot({
        open: false,
        id: null,
        day: "",
        startTime: "",
        endTime: "",
      });
      refetch();
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
    },
  });

  const handleEnrollmentPause = useMutation({
    mutationFn: (payload: ChangeEnrollmentBrekStatus_Api_Payload_Type) =>
      changeBreakStatus(payload, { token }),
    onSuccess: (data) => {
      if (data) {
        toast.success(data?.message);
      }
      setPauseModal({
        open: false,
        id: null,
        name: "",
        on_break: null,
        is_permanent: null,
      });
    },
    onError: (error: unknown) => {
      const axiosError = error as MyAxiosError;
      toast.error(
        axiosError.message ||
          (axiosError?.response
            ? axiosError?.response.status === 404
              ? "No enrollments found"
              : axiosError?.response.data.error ||
                `${axiosError?.response.status} ${axiosError?.response.statusText}`
            : "An unexpected error occurred"),
      );
    },
  });

  const enrollmentPauseModalProps = useMemo(
    () => ({
      modalValues: pauseModal,
      handleClose: handlePauseModelClose,
      heading: "Pause Enrollment",
      subHeading:
        "Are you sure to pause or unpause this enrollment temporary or permanent",
      handleEnrollmentPause: (payload: any) =>
        handleEnrollmentPause.mutate(payload),
      loading: handleEnrollmentPause?.isPending,
    }),
    [pauseModal, handlePauseModelClose, handleEnrollmentPause],
  );

  useEffect(() => {
    if (data?.classSchedules) {
      transformClassSchedules(data?.classSchedules);
    }
  }, [data]);

  useEffect(() => {
    if (id) {
      handleRescheduleRequest_withEnrollmentId?.mutate({
        enrollment_id: id,
      });
    }
  }, [id]);

  useEffect(() => {
    if (token) {
      dispatch(fetchResources({ token }));
      dispatch(fetchUsersByGroup({ token }));
    }
  }, [token]);

  if (error || sessionByEnrollmentError || logsError) {
    const axiosError = (error ||
      sessionByEnrollmentError ||
      logsError) as MyAxiosError;
    if (axiosError?.response) {
      toast.error(axiosError.response.data.error);
    } else {
      toast.error(axiosError?.message);
    }
  }

  return (
    <Container maxWidth={false} className={classes.enrollmentContainer}>
      {isLoading ? (
        <LoadingBox />
      ) : data ? (
        <>
          {/* Section 1: Tutor and Student Info */}
          <Box className={classes.enrollmentSection1}>
            <div className={classes.enrollmentBox}>
              <div className={classes.enrollmentImageContainer}>
                <Image
                  src={
                    data?.tutor?.profileImageUrl ||
                    `/assets/images/dummyPic.png`
                  }
                  alt="Teacher"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className={classes.enrollmentTextContainer}>
                <p>Teacher</p>
                <p>{data?.tutor?.name || "No Show"}</p>
              </div>
            </div>

            <div className={classes.enrollmentItem}>
              <p className={classes.enrollmentLabel}>Subject</p>
              <p>{data?.subject?.name || "No Show"}</p>
            </div>
            <div className={classes.enrollmentItem}>
              <p className={classes.enrollmentLabel}>Date</p>
              <p>
                {moment(data?.createdAt).format("DD-MMM-YYYY") || "No Show"}
              </p>
            </div>
            <div className={classes.enrollmentItem}>
              <div className={classes.enrollmentLabel}>On Break</div>
              {handleEnrollmentPause?.isPending ? (
                <LoadingBox
                  loaderStyling={{
                    height: "var(--medium28-) !important",
                    width: "var(--medium28-) !important",
                  }}
                  inlineStyling={{
                    width: "max-content",
                  }}
                />
              ) : (
                <BasicSwitches
                  background={data?.is_permanent === true ? "red" : undefined}
                  value={data?.on_break}
                  handleToggle={
                    canToggleBreak && !data?.is_permanent
                      ? (e: any) =>
                          handleSwitch(e, {
                            id: data?.id || null,
                            name: data?.name || "",
                            on_break: data?.on_break,
                            is_permanent: data?.is_permanent,
                          })
                      : undefined
                  }
                />
              )}
            </div>
          </Box>

          {/* Section 2: Tabs */}
          <Box className={classes.enrollmentSection2}>
            <Tabs
              tabsArray={tabsArray}
              activeTab={activeTab}
              handleTabChange={setActiveTab}
              inlineTabsStyles={styles?.tabsStyles}
            />
            {activeTab === "Sessions" ? null : (
              <div className={classes.actions}>
                {activeTab === "Class Schedule" ? (
                  <>
                    Add Teacher Schedule
                    <div className={classes.addModal}>
                      <AddOutlinedIcon
                        onClick={() => {
                          setaddTeacherScheduleModal({
                            id: data?.tutor.id,
                            open: true,
                            transformedSchedulesArr: transformedSchedules,
                          });
                        }}
                      />
                    </div>
                    Add Extra Class
                    <div className={classes.addModal}>
                      <AddOutlinedIcon
                        onClick={() => {
                          setAddExtraTeacherScheduleModal({
                            open: true,
                            transformedSchedulesArr: transformedSchedules,
                          });
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    Edit
                    <div className={classes.addModal}>
                      <EditOutlinedIcon
                        onClick={() => {
                          setEditEnrollmentModal(true);
                        }}
                      />
                    </div>
                    Delete
                    <div className={classes.addModal}>
                      <DeleteOutlinedIcon
                        onClick={() => {
                          setDeleteEnrollmentModal(true);
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </Box>

          {/* Section 3 */}
          {activeTab === "Sessions" ? (
            <Sessions
              sessionsOfEnrollment={sessionByEnrollmentData || 0}
              sessionByEnrollmentLoading={sessionByEnrollmentLoading}
              error={sessionByEnrollmentError}
            />
          ) : activeTab === "Detail" ? (
            <Detail
              data={data || {}}
              sessionsOfEnrollment={sessionByEnrollmentData || 0}
              sessionByEnrollmentLoading={sessionByEnrollmentLoading}
              logsData={logsData}
              logsLoading={logsLoading}
            />
          ) : (
            <ClassSchedule
              transformedSchedules={transformedSchedules}
              rescheduleRequestData={
                handleRescheduleRequest_withEnrollmentId?.data
              }
              setConfirmSlotModal={setConfirmSlotModal}
              setDeleteSlotModal={setDeleteSlotModal}
              setaddTeacherScheduleModal={setaddTeacherScheduleModal}
              setRemoveAvailableSlot={setRemoveAvailableSlot}
              data={data}
              id={id}
            />
          )}
        </>
      ) : (
        <ErrorBox />
      )}
      <TeacherSceduleAddModal
        heading="Add Teacher Schedule"
        subHeading="Fill out the form in order to create the teacher schedule."
        modalOpen={addTeacherScheduleModal}
        handleClose={() => {
          setaddTeacherScheduleModal({
            id: "",
            open: false,
            transformedSchedulesArr: [],
          });
        }}
        success={handleAddTeacherSchedule?.isSuccess}
        loading={handleAddTeacherSchedule?.isPending}
        handleAdd={(payload: Create_TeacherSchedule_Payload) =>
          handleAddTeacherSchedule?.mutate(payload)
        }
      />
      <TeacherExtraSceduleAddModal
        heading="Add Teacher Extra Schedule"
        subHeading="Fill out the form in order to create the extra teacher schedule."
        modalOpen={addExtraTeacherScheduleModal}
        handleClose={() => {
          setAddExtraTeacherScheduleModal({
            open: false,
            transformedSchedulesArr: [],
          });
        }}
        success={
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.isSuccess
        }
        loading={
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.isPending
        }
        rescheduleRequestData={
          handleRescheduleRequest_withEnrollmentId?.data || []
        }
        handleAdd={(payload: any) =>
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.mutate({
            ...payload,
            user_id: user?.roleId || null,
            enrollment_id: id || null,
            class_status: "SCHEDULED",
          })
        }
      />
      <EditEnrollmentModal
        data={data || {}}
        subject={subject || []}
        curriculum={curriculum || []}
        board={board || []}
        grades={grades || []}
        students={students?.users || []}
        teachers={teachers?.users || []}
        loading={handleEditEnrollment?.isPending}
        heading="Edit Enrollment"
        subHeading="Fill out the form in order to edit the enrollment details. "
        modalOpen={editEnrollmentModal}
        handleClose={() => {
          setEditEnrollmentModal(false);
        }}
        handleEdit={(payload: any) =>
          handleEditEnrollment?.mutate(payload as any)
        }
      />
      <DeleteEnrollmentModal
        modalOpen={deleteEnrollmentModal}
        handleClose={handleDeleteModalClose}
        subHeading="Are you sure you want to delete this enrollment? This action is permanent."
        heading="Are You Sure?"
        handleDelete={() => {
          handleDelete?.mutate({ id: id });
        }}
        loading={handleDelete?.isPending}
      />
      <SlotsConfirmModal
        loading={handleConfirmClassSchedule?.isPending}
        modalOpen={confirmSlotModal}
        handleConfirmSlot={(payload: ConfirmClassSchedule_Payload) =>
          handleConfirmClassSchedule.mutate(payload)
        }
        handleClose={() =>
          setConfirmSlotModal({
            open: false,
            day: "",
            teacher_schedule_id: null,
            enrollment_id: null,
            startTime: "",
            endTime: "",
          })
        }
        subHeading={`Do you want to confirm your slot between (${confirmSlotModal?.startTime} to ${confirmSlotModal?.endTime})`}
        heading={confirmSlotModal.day}
      />
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
            ids: [],
          })
        }
        heading={`${deleteSlotModal?.day}`}
        subHeading={`Are you sure you want to delete slot (${deleteSlotModal?.startTime} to ${deleteSlotModal?.endTime})`}
        handleDelete={(payload: any) => {
          handleDeleteClassSchedule?.mutate(payload);
        }}
        dayDeletion={(day: string) => {
          const time = moment(deleteSlotModal?.startTime, "hh:mmA").format(
            "HH:mm:ss",
          );
          const dateTime = day + time;
          const payload = {
            user_id: user?.roleId || null,
            enrollment_id: id || null,
            class_status: "CANCELLED",
            class_schedule_id: deleteSlotModal?.ids[0],
            dateTime: moment(dateTime, "DD-MMM-YYYY HH:mm:ss")
              .utc()
              .format("YYYY-MM-DDTHH:mm:ss[Z]"),
          };
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.mutate(
            payload,
          );
        }}
        weekDeletion={(day: string) => {
          const time = moment(deleteSlotModal?.startTime, "hh:mm A").format(
            "HH:mm:ss",
          );
          const dateTime = `${day}T${time}`;
          const payload = {
            user_id: user?.roleId || null,
            enrollment_id: id || null,
            class_status: "CANCELLED",
            class_schedule_id: deleteSlotModal?.ids[0],
            dateTime: moment(dateTime).utc().format("YYYY-MM-DDTHH:mm:ss[Z]"),
          };
          // console.log(payload);
          handleDeleteClassScheduleForWeek_foraddExtraClassSchedule?.mutate(
            payload,
          );
        }}
      />
      <RemoveAvailableSlotsModal
        heading={`${removeAvailableSlot.day}`}
        subHeading={`Are you sure you want to delete slot (${removeAvailableSlot?.startTime} to ${removeAvailableSlot?.endTime})`}
        modalOpen={removeAvailableSlot}
        handleClose={() =>
          setRemoveAvailableSlot({
            open: false,
            id: null,
            day: "",
            startTime: "",
            endTime: "",
          })
        }
        handleDelete={(payload: any) => {
          handleRemoveAvailableSlot?.mutate(payload?.id);
        }}
        loading={handleRemoveAvailableSlot?.isPending}
      />
      <EnrollmentPauseModal {...enrollmentPauseModalProps} />
    </Container>
  );
};

export default EnrollmentDetailsForm;

const styles = {
  tabsStyles: {
    minWidth: "300px",
    width: "40%",
  },
};
