import { useCallback, useState, useEffect, useMemo } from "react";
import moment from "moment";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "react-toastify";
import classes from "./session-details.module.css";
import { BASE_URL } from "@/services/config";
import { Box, Typography } from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SubjectOutlinedIcon from "@mui/icons-material/SubjectOutlined";
import LoginIcon from "@mui/icons-material/Login";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CachedIcon from "@mui/icons-material/Cached";
import LogoutIcon from "@mui/icons-material/Logout";
import EmergencyRecordingRoundedIcon from "@mui/icons-material/EmergencyRecordingRounded";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { MinutesToHours } from "@/utils/helpers/convert-minutes-to-hours";
import {
  getConclusionTypeStyles,
  getTagTypeStyles,
} from "@/utils/helpers/sessionType-styles";
import { MyAxiosError } from "@/services/error.type";
import { getSessionDetailsById } from "@/services/dashboard/superAdmin/sessions/sessions";
import { SessionById_Response_Type } from "@/types/sessions/getSessionById.types";
import {
  updateSession,
  recreacteSession,
  deleteSession,
  updateTeacherDuration,
  updateSessionReviewStatus,
  updateSessionPaymentStatus,
} from "@/services/dashboard/superAdmin/sessions/sessions";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import DeleteModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import EditSessionModal from "@/components/ui/superAdmin/session-details/edit-enrollment-modal/edit-enrollment-modal";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import { getTooltipStyles } from "@/components/global/tooltip/tooltip";
import TeacherDurationUpdateModal from "@/components/ui/superAdmin/sessions/teacherDurationUpdateModal/teacherDurationUpdateModal";
import { Tooltip, Checkbox } from "@mui/material";
import TextBox from "@/components/global/text-box/text-box";

const findById = (id: number, arr: any) => {
  return arr?.find((item: any) => item.student_id === id) || null;
};

const SessionDetailForm: React.FC = () => {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { token, user } = useAppSelector((state) => state?.user);
  const [editSessionModalType, setEditSessionModalType] = useState<string>("");
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [reviewModal, setReviewModal] = useState<boolean>(false);
  const [reviewReason, setReviewReason] = useState<string>("");
  const [editModal, setEditModal] = useState<boolean>(false);
  const [teacherDurationUpdateModal, setTeacherDurationUpdateModal] = useState<{
    open: boolean;
    session_id: number | null;
    tutor_class_time: number | string | null;
  }>({
    open: false,
    session_id: null,
    tutor_class_time: null,
  });
  const [sessionPaymentupdateMoal, setSessionPaymentupdateMoal] = useState<{
    openModal: boolean;
    session_id: number | null;
    student_id: number | null;
    is_paid: boolean | null;
    payment_date: string;
  }>({
    openModal: false,
    session_id: null,
    student_id: null,
    is_paid: null,
    payment_date: "",
  });

  const handleModalClose = useCallback((type: string) => {
    if (type === "edit") {
      setEditModal(false);
    } else if (type === "delete") {
      setDeleteModal(false);
    } else if (type === "review") {
      setReviewModal(false);
      setReviewReason("");
    } else if (type === "payment") {
      setSessionPaymentupdateMoal({
        openModal: false,
        session_id: null,
        student_id: null,
        is_paid: null,
        payment_date: "",
      });
    }
  }, []);

  const handleModalOpen = useCallback((type: string) => {
    if (type === "duration" || type === "conclusion_type") {
      setEditSessionModalType(type);
      setEditModal(true);
    } else if (type === "delete") {
      setDeleteModal(true);
    } else if (type === "review") {
      setReviewModal(true);
    }
  }, []);

  const { data, error, isLoading, refetch } =
    useQuery<SessionById_Response_Type>({
      queryKey: ["sessionsById"],
      queryFn: () => getSessionDetailsById(id, { token }),
      enabled: !!token,
    });

  // determine if current user has already added a review
  const hasReviewed = useMemo(() => {
    const reviewers = data?.session?.reviews || [];
    return reviewers.some((r: any) => r.reviewer_id === Number(user?.id));
  }, [data, user]);

  const handleUpdate = useMutation({
    mutationFn: (payload: { conclusion_type?: string; duration?: number }) =>
      updateSession(id, { token }, payload),
    onSuccess: () => {
      toast.success("Session Update Successfully");
      setEditModal(false);
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

  const handleReload = useMutation({
    mutationFn: (id: string) => recreacteSession(id, { token }),
    onSuccess: () => {
      toast.success("Session Reload Successfully");
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

  const handleDelete = useMutation({
    mutationFn: (id: string) => deleteSession(id, { token }),
    onSuccess: () => {
      toast.success("Session Deleted Successfully");
      setDeleteModal(false);
      router.push("/superAdmin/sessions");
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
      setDeleteModal(false);
    },
  });

  const handleSessionReview = useMutation({
    mutationFn: (id: string) =>
      updateSessionReviewStatus(
        {
          sessionId: id,
          reviewer_id: Number(user?.id),
          reason: reviewReason,
        },
        { token },
      ),
    onSuccess: () => {
      toast.success("Session Reviewed Successfully");
      setReviewModal(false);
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
      setReviewModal(false);
    },
  });

  const handleTeacherDurationUpdate = useMutation({
    mutationFn: (payload: { tutor_class_time: number | string | null }) =>
      updateTeacherDuration(
        { token },
        {
          session_id: teacherDurationUpdateModal.session_id,
          ...payload,
        },
      ),
    onSuccess: () => {
      toast.success("Teacher duration updated successfully.");
      setTeacherDurationUpdateModal({
        open: false,
        session_id: null,
        tutor_class_time: null,
      });
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

  const handleSessionPaymentStatus = useMutation({
    mutationFn: (payload: {
      session_id: number | null;
      student_id: number | null;
      is_paid: boolean | null;
      payment_date: string;
    }) => updateSessionPaymentStatus(payload, { token }),
    onSuccess: () => {
      toast.success("Session payment status updated successfully.");
      setSessionPaymentupdateMoal({
        openModal: false,
        session_id: null,
        student_id: null,
        is_paid: null,
        payment_date: "",
      });
      refetch();
    },
    onError: (error) => {
      setSessionPaymentupdateMoal({
        openModal: false,
        session_id: null,
        student_id: null,
        is_paid: null,
        payment_date: "",
      });
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message || axiosError?.error);
      }
    },
  });

  const teacherDurationUpdateModalProps = useMemo(
    () => ({
      heading: "Update Tutor Duration",
      subHeading:
        "Fill out the duration in minutes in order to update the teacher duration.",
      modalOpen: {
        open: teacherDurationUpdateModal.open,
        tutor_class_time: teacherDurationUpdateModal.tutor_class_time,
      },
      handleClose: () =>
        setTeacherDurationUpdateModal({
          open: false,
          session_id: null,
          tutor_class_time: null,
        }),
      loading: handleTeacherDurationUpdate.isPending,
      success: handleTeacherDurationUpdate.isSuccess,
      handleUpdate: (payload: { tutor_class_time: number | string | null }) =>
        handleTeacherDurationUpdate.mutate(payload),
    }),
    [
      teacherDurationUpdateModal,
      handleTeacherDurationUpdate.isPending,
      handleTeacherDurationUpdate.isSuccess,
    ],
  );

  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className={classes.container}>
        <LoadingBox />
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.container}>
        <ErrorBox />
      </div>
    );
  }

  if (!data || !data.session) {
    return (
      <div className={classes.container}>
        <ErrorBox />
      </div>
    );
  }

  return (
    <>
      <div className={classes.container}>
        <Box className={classes.row1}>
          <div className={classes.row1Header}>
            <p className={classes.sectionHeading}>Enrollment Details</p>
            {handleReload?.isPending ? (
              <LoadingBox
                loaderStyling={{
                  height: "var(--regular22-) !important",
                  width: "var(--regular22-) !important",
                }}
              />
            ) : (
              <div className={classes.actionWrapper}>
                <p className={classes.actionText}>Recording Link</p>
                <div
                  className={classes.addModal}
                  onClick={() => {
                    const meetRecording = JSON.parse(
                      data?.session?.meet_recording,
                    );
                    if (meetRecording?.length > 0)
                      window.open(meetRecording[0], "_blank");
                    else {
                      toast.error("No Recording Found");
                    }
                  }}
                >
                  <EmergencyRecordingRoundedIcon
                    sx={{
                      color: "var(--pure-black-color)",
                      fontSize: "var(--regular18-)",
                    }}
                  />
                </div>
                <p className={classes.actionText}>Reload</p>
                <div
                  className={classes.addModal}
                  onClick={() => handleReload?.mutate(id)}
                >
                  <CachedIcon
                    sx={{
                      color: "var(--pure-black-color)",
                      fontSize: "var(--regular18-)",
                    }}
                  />
                </div>
                <p className={classes.actionText}>Edit</p>
                <div
                  className={classes.addModal}
                  onClick={() => handleModalOpen("conclusion_type")}
                >
                  <EditOutlinedIcon
                    sx={{
                      color: "var(--pure-black-color)",
                      fontSize: "var(--regular18-)",
                    }}
                  />
                </div>
                <p className={classes.actionText}>Delete</p>
                <div
                  className={classes.addModal}
                  onClick={() => handleModalOpen("delete")}
                >
                  <DeleteOutlinedIcon
                    sx={{
                      color: "var(--pure-black-color)",
                      fontSize: "var(--regular18-)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className={classes.row1MainBox}>
            <div className={classes.section1Components}>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.imageBox}>
                  <Image
                    src={
                      data?.session?.tutor?.profileImageUrl ||
                      "/assets/images/demmyPic.png"
                    }
                    alt="image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Teacher</p>
                  <p className={classes.userName}>
                    {data?.session?.tutor?.name
                      .trim()
                      .split(" ")
                      .slice(0, 3)
                      .join(" ")}
                  </p>
                </div>
              </div>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.imageBox}>
                  <Image
                    src={
                      data?.session?.sessionEnrollment?.studentsGroups[0]?.user
                        ?.profileImageUrl || "/assets/images/demmyPic.png"
                    }
                    alt="image"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Student</p>
                  <p className={classes.userName}>
                    {data?.session?.sessionEnrollment?.studentsGroups[0]?.user?.name
                      .trim()
                      .split(" ")
                      .slice(0, 3)
                      .join(" ")}
                  </p>
                </div>
              </div>
            </div>
            <div className={classes.section1Components}>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <SubjectOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Subject</p>
                  <p className={classes.userName}>
                    {data?.session?.subject?.name}
                  </p>
                </div>
              </div>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <CalendarMonthOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Enroll Date</p>
                  <p className={classes.userName}>
                    {moment
                      .utc(data?.session?.created_at)
                      .local()
                      .format("Do-MMM-YYYY")}
                  </p>
                </div>
              </div>
            </div>
            <div className={classes.section1Components}>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <SubjectOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Session Type</p>
                  <p
                    className={classes.userName}
                    style={getConclusionTypeStyles(
                      data?.session?.conclusion_type,
                    )}
                  >
                    {data?.session?.conclusion_type}
                  </p>
                </div>
              </div>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <CalendarMonthOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Session Tag</p>
                  <p
                    className={classes.userName}
                    style={getTagTypeStyles(data?.session?.tag || "")}
                  >
                    {data?.session?.tag}
                  </p>
                </div>
              </div>
            </div>
            <div className={classes.section1Components}>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <SubjectOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Session Reviewed</p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2.5px",
                    }}
                  >
                    <Checkbox
                      checked={
                        data?.session?.is_reviewed !== "Pending" &&
                        data?.session?.is_reviewed !== ""
                      }
                      onChange={() => handleModalOpen("review")}
                      disabled={hasReviewed}
                      sx={{
                        padding: "4px",
                        "& .MuiSvgIcon-root": {
                          fontSize: "var(--regular16-)",
                          borderRadius: "50%",
                        },
                        "&.Mui-checked": {
                          color:
                            data?.session?.is_reviewed === "Admin"
                              ? "var(--purple-text-color1)"
                              : data?.session?.is_reviewed === "Manager"
                                ? "var(--blue-text-color1)"
                                : data?.session?.is_reviewed === "Both"
                                  ? "var(--green-text-color4)"
                                  : "var(--main-blue-color)",
                        },
                        "& .MuiCheckbox-root": {
                          borderRadius: "50%",
                        },
                      }}
                      icon={
                        <span
                          style={{
                            width: "var(--regular16-)",
                            height: "var(--regular16-)",
                            borderRadius: "50%",
                            border: "2px solid var(--black-color)",
                            display: "inline-block",
                          }}
                        />
                      }
                      checkedIcon={
                        <span
                          style={{
                            width: "var(--regular16-)",
                            height: "var(--regular16-)",
                            borderRadius: "50%",
                            border: `2px solid ${
                              data?.session?.is_reviewed === "Admin"
                                ? "var(--purple-text-color1)"
                                : data?.session?.is_reviewed === "Manager"
                                  ? "var(--blue-text-color1)"
                                  : data?.session?.is_reviewed === "Both"
                                    ? "var(--green-text-color4)"
                                    : "var(--main-blue-color)"
                            }`,
                            backgroundColor:
                              data?.session?.is_reviewed === "Admin"
                                ? "var(--purple-text-color1)"
                                : data?.session?.is_reviewed === "Manager"
                                  ? "var(--blue-text-color1)"
                                  : data?.session?.is_reviewed === "Both"
                                    ? "var(--green-text-color4)"
                                    : "var(--main-blue-color)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "var(--regular16-)",
                          }}
                        >
                          ✓
                        </span>
                      }
                    />
                    <span
                      style={{
                        fontSize: "var(--regular16-)",
                        lineHeight: "var(--regular16-)",
                        fontFamily: "var(--leagueSpartan-medium-500)",
                        color: "var(--black-color)",
                      }}
                    >
                      {data?.session?.is_reviewed === "Pending"
                        ? "Review this session"
                        : data?.session?.reviews &&
                            data?.session?.reviews.length > 0
                          ? `Reviewed by ${data?.session?.reviews
                              ?.map((r) =>
                                r?.reviewer.name
                                  .split(" ")
                                  .slice(0, 1)
                                  .join(" "),
                              )
                              .join(" & ")}`
                          : "Reviewed"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <CalendarMonthOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Payment Status</p>
                  {data?.session?.paymentStatuses?.map((item, index) => (
                    <div key={index} className={classes.paymentStatusBox}>
                      <p className={classes.userName}>
                        {item?.student?.name.split(" ")[0] || "No Show"}
                      </p>
                      <p
                        className={classes.userName}
                        style={{
                          fontSize: "var(--regular14-)",
                          lineHeight: "var(--regular14-)",
                          borderRadius: "4px",
                          padding: "5px",
                          color: item?.is_paid
                            ? "var(--green-text-color4)"
                            : "var(--red-text-color1)",
                          backgroundColor: item?.is_paid
                            ? "var(--green-background-color4)"
                            : "var(--red-background-color2)",
                        }}
                      >
                        {item?.is_paid ? "Paid" : "Unpaid"}
                      </p>
                      {item?.is_paid === false && (
                        <Tooltip
                          title="Update Tutor Duration"
                          arrow
                          slotProps={getTooltipStyles()}
                        >
                          <div
                            className={classes.addModal}
                            onClick={() => {
                              setSessionPaymentupdateMoal({
                                openModal: true,
                                session_id: data?.session?.id,
                                student_id: item?.student?.id,
                                is_paid: true,
                                payment_date: item?.payment_date,
                              });
                            }}
                          >
                            <UpgradeIcon
                              sx={{
                                color: "var(--pure-black-color)",
                                fontSize: "var(--regular18-)",
                              }}
                            />
                          </div>
                        </Tooltip>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={classes.section1Components}>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <SubjectOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Tutor Duration</p>
                  <p className={classes.userName}>
                    {MinutesToHours(data?.session?.tutor_class_time)}
                  </p>
                </div>
                <Tooltip
                  title="Update Tutor Duration"
                  arrow
                  slotProps={getTooltipStyles()}
                >
                  <div
                    className={classes.addModal}
                    onClick={() => {
                      setTeacherDurationUpdateModal({
                        open: true,
                        session_id: data?.session?.id || 0,
                        tutor_class_time: data?.session?.tutor_class_time
                          ? MinutesToHours(data?.session?.tutor_class_time)
                          : "-",
                      });
                    }}
                  >
                    <UpgradeIcon
                      sx={{
                        color: "var(--pure-black-color)",
                        fontSize: "var(--regular18-)",
                      }}
                    />
                  </div>
                </Tooltip>
              </div>
              <div className={classes.section1ComponentsChild}>
                <div className={classes.logoBox}>
                  <CalendarMonthOutlinedIcon className={classes.logoBoxIcon} />
                </div>
                <div className={classes.userInfo}>
                  <p className={classes.userLabel}>Class Duration</p>
                  <p className={classes.userName}>
                    {data?.session?.duration} m
                  </p>
                </div>
                <Tooltip
                  title="Update Class Duration"
                  arrow
                  slotProps={getTooltipStyles()}
                >
                  <div
                    className={classes.addModal}
                    onClick={() => handleModalOpen("duration")}
                  >
                    <EditOutlinedIcon
                      sx={{
                        color: "var(--pure-black-color)",
                        fontSize: "var(--regular18-)",
                      }}
                    />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </Box>
        <div className={classes.row2}>
          <TransactionDetails data={data?.session} />
          <NotesBox notes={data?.session?.Notes} />
          <StudentDetailsBox data={data?.session} />
          <AttendanceDetails data={data?.session} />
        </div>
      </div>
      <EditSessionModal
        modalOpen={editModal}
        handleClose={() => handleModalClose("edit")}
        heading={"Edit Class "}
        subHeading="Fill out the form in order to edit the class "
        handleUpdate={(payload) => handleUpdate?.mutate(payload)}
        data={(data && data?.session?.conclusion_type) || ""}
        loading={handleUpdate?.isPending}
        type={editSessionModalType}
        durationIni={(data && data?.session?.duration) || null}
      />
      <DeleteModal
        modalOpen={deleteModal}
        handleClose={() => handleModalClose("delete")}
        subHeading="Are you sure you want to delete this session? This action is permanent."
        heading="Are You Sure?"
        handleDelete={() => {
          handleDelete?.mutate(id);
        }}
        loading={handleDelete?.isPending}
      />
      <DeleteModal
        modalOpen={reviewModal}
        handleClose={() => handleModalClose("review")}
        subHeading="Are you sure you want to mark this session as reviewed?"
        heading="Review This Session!"
        handleDelete={() => {
          handleSessionReview?.mutate(id);
        }}
        loading={handleSessionReview?.isPending}
        buttonText="Confirm"
        icon="/assets/svgs/like.svg"
        inlineIconBackgroundStyles={{
          backgroundColor: "var(--main-blue-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
        }}
      >
        {["No Show", "Teacher Absent", "Student Absent"].includes(
          data?.session?.conclusion_type || "",
        ) && (
          <div className={classes.fields}>
            <Typography variant="body2">Add Reason</Typography>
            <TextBox
              value={reviewReason}
              onChange={(val: string) => setReviewReason(val)}
              placeholder={`Enter reason for ${data?.session?.conclusion_type}`}
              inlineTextAreaStyles={{
                boxShadow: "var(--main-inner-boxShadow-color)",
              }}
            />
          </div>
        )}
      </DeleteModal>
      <DeleteModal
        modalOpen={sessionPaymentupdateMoal?.openModal}
        handleClose={() => handleModalClose("payment")}
        subHeading="Are you sure to mark this session as paid?"
        heading="Mark as Paid"
        handleDelete={() => {
          const { openModal, ...rest } = sessionPaymentupdateMoal;
          handleSessionPaymentStatus?.mutate({ ...rest });
        }}
        loading={handleSessionPaymentStatus?.isPending}
        buttonText="Confirm"
        icon="/assets/svgs/like.svg"
        inlineIconBackgroundStyles={{
          backgroundColor: "var(--main-blue-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
        }}
      />
      <TeacherDurationUpdateModal {...teacherDurationUpdateModalProps} />
    </>
  );
};

export default SessionDetailForm;

const TransactionDetails = ({ data }: { data: any }) => {
  return (
    <div className={classes.sections}>
      <p className={classes.sectionHeading}>Transaction Details</p>
      <div className={classes.mainContentBoxes}>
        {data?.sessionTransaction && data?.sessionTransaction?.length > 0 ? (
          data?.sessionTransaction
            .sort(
              (a: any, b: any) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            )
            ?.map((item: any) => {
              const isStudent =
                item?.user_id ===
                data?.session?.sessionEnrollment?.studentsGroups?.[0]?.user?.id;
              return (
                <Box key={item.id} className={classes.transactions}>
                  <div className={classes.userProfile}>
                    <span className={classes.imageBox}>
                      <Image
                        src={
                          item?.transactions?.profileImageUrl ||
                          `${BASE_URL}/public/uploads/profileImage-1736857222520-815563740-dummy-pic.png`
                        }
                        alt={item?.transactions?.name || "User"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </span>
                    <span className={classes.profileContainer}>
                      {item?.transactions?.name
                        ? item?.transactions?.name
                            .trim()
                            ?.split(" ")
                            .slice(0, 2)
                            .join(" ")
                        : "No Show"}

                      {item?.session_id && (
                        <span
                          className={classes.role}
                          style={{
                            backgroundColor: isStudent
                              ? "var(--green-background-color4)"
                              : "var(--purple-background-color1)",
                            color: isStudent
                              ? "var(--green-text-color4)"
                              : "var(--purple-text-color1)",
                          }}
                        >
                          {isStudent ? "Student" : "Teacher"}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className={classes.transactionDetails}>
                    <span className={classes.cost}>
                      {item?.isReverted ? "(Reverted)" : ""}
                    </span>
                    <span className={classes.cost}>{item?.cost ?? "0"} </span>
                    <span
                      className={classes.transactionType}
                      style={{
                        background:
                          item?.type === "Debit"
                            ? "var(--red-color)"
                            : "var(--green-color)",
                      }}
                    >
                      {item?.type || "No Show"}
                    </span>
                    <span className={classes.cost}>
                      {new Date(item.createdAt || "").toLocaleString()}
                    </span>
                  </div>
                </Box>
              );
            })
        ) : (
          <ErrorBox />
        )}
      </div>
    </div>
  );
};

const NotesBox = ({ notes }: { notes: any[] }) => {
  return (
    <div className={`${classes.sections}`}>
      <p className={classes.sectionHeading}>Notes</p>
      <Box className={`${classes.mainContentBoxes} ${classes.notesBoxWrapper}`}>
        {!notes || notes.length === 0 ? (
          <ErrorBox />
        ) : (
          <Box className={classes.notesBox} sx={{ gap: 2 }}>
            {notes?.map((note: any, indx: number) => (
              <Box
                key={note?.id || indx}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  pb: 1,
                  borderBottom:
                    indx !== notes.length - 1
                      ? "1px solid var(--grey-color1)"
                      : "none",
                }}
              >
                <div className={classes.notesText}>
                  {indx + 1}. <p>{String(note?.reason)}</p>
                </div>
                {note?.user && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      pl: 2.5,
                    }}
                  >
                    <Image
                      src={
                        note.user.profileImageUrl ||
                        "/assets/images/demmyPic.png"
                      }
                      alt="User Profile"
                      width={24}
                      height={24}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--regular14-)",
                        color: "var(--text-grey)",
                        fontFamily: "var(--leagueSpartan-medium-500)",
                      }}
                    >
                      {note.user.name} •{" "}
                      {moment
                        .utc(note.createdAt)
                        .local()
                        .format("Do MMM YYYY, h:mm A")}
                    </p>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </div>
  );
};

const StudentDetailsBox = ({ data }: { data: any }) => {
  return (
    <Box className={classes.sections}>
      <p className={classes.sectionHeading}>Student Details</p>
      <Box className={classes.mainContentBoxes}>
        {data?.groupSessionTime?.length === 0 ? (
          <ErrorBox />
        ) : (
          data?.groupSessionTime?.map((item: any) => (
            <Box key={item.id} className={classes.child}>
              <div className={classes.childLeft}>
                <div className={classes.imageBox}>
                  <Image
                    src={
                      findById(
                        item?.student_id,
                        data?.session?.sessionEnrollment?.studentsGroups,
                      )?.user?.profileImageUrl || "/assets/images/demmyPic.png"
                    }
                    alt="profile"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className={classes.childInfo}>
                  <p className={classes.attendanceUserName}>Student</p>
                  <p className={classes.attendanceUserRole}>
                    {findById(
                      item?.student_id,
                      data?.session?.sessionEnrollment?.studentsGroups,
                    )?.user?.name || item?.display_name + "*"}
                  </p>
                </div>
              </div>
              <div className={classes.childRight}>
                <div className={classes.childLogoBox}>
                  <AccessTimeOutlinedIcon className={classes.childLogoIcon} />
                </div>
                <div className={classes.childInfo}>
                  <p className={classes.attendanceUserRole}>Student Duration</p>
                  <p className={classes.attendanceUserName}>
                    {MinutesToHours(item?.class_duration_time)}
                  </p>
                </div>
              </div>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

const AttendanceDetails = ({ data }: { data: any }) => {
  return (
    <Box className={classes.sections}>
      <p className={classes.sectionHeading}>Attendance</p>
      <Box className={classes.mainContentBoxes}>
        <Box className={classes.section4ChildHead}>
          <p className={classes.section4HeadCellBordered}>Name</p>
          <p className={classes.section4HeadCellBordered}>In</p>
          <p className={classes.section4HeadCell}>Out</p>
        </Box>
        <Box className={classes.section4ChildBody}>
          {data?.conferences?.length === 0 ? (
            <ErrorBox />
          ) : (
            data?.conferences?.map((item: any) => (
              <Box key={item.id} className={classes.attendanceBodyChild}>
                <div className={classes.attendanceNameCell}>
                  <div className={classes.attendanceUserWrapper}>
                    <div className={classes.imageBox}>
                      <Image
                        src={
                          item?.user_id == data?.tutor?.id
                            ? data?.tutor?.profileImageUrl ||
                              "/assets/images/demmyPic.png"
                            : findById(
                                item?.user_id,
                                data?.sessionEnrollment?.studentsGroups,
                              )?.user?.profileImageUrl ||
                              "/assets/images/demmyPic.png"
                        }
                        alt="profile"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className={classes.attendanceUserInfo}>
                      <p className={classes.attendanceUserName}>
                        {item?.user_id == data?.tutor?.id
                          ? data?.tutor?.name?.split(" ").slice(0, 2).join(" ")
                          : findById(
                              item?.user_id,
                              data?.sessionEnrollment?.studentsGroups,
                            )
                              ?.user?.name?.split(" ")
                              .slice(0, 2)
                              .join(" ") ||
                            item?.display_name
                              ?.split(" ")
                              .slice(0, 2)
                              .join(" ")}
                      </p>
                      <p className={classes.attendanceUserRole}>
                        {item?.user_id == data?.tutor?.id ? "Tutor" : "Student"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className={classes.attendanceInCell}>
                  <div className={classes.attendanceTimeWrapper}>
                    <LoginIcon
                      className={classes.attendanceTimeIcon}
                      sx={{
                        width: "var(--regular20-)",
                        height: "var(--regular20-)",
                      }}
                    />
                    <div>
                      {item?.startTime
                        ? moment.unix(item?.startTime).local().format("hh:mm A")
                        : "No Show"}
                    </div>
                  </div>
                </div>
                <div className={classes.attendanceOutCell}>
                  <div className={classes.attendanceTimeWrapper}>
                    <LogoutIcon
                      className={classes.attendanceTimeIcon}
                      sx={{
                        width: "var(--regular20-)",
                        height: "var(--regular20-)",
                      }}
                    />
                    <div>
                      {item?.endTime
                        ? moment.unix(item?.endTime).local().format("hh:mm A")
                        : "No Show"}
                    </div>
                  </div>
                </div>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Box>
  );
};
