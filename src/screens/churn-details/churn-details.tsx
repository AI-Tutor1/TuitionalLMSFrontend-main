"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import moment from "moment";
import Image from "next/image";
import { Tooltip } from "@mui/material";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { MyAxiosError } from "@/services/error.type";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import Button from "@/components/global/button/button";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import {
  getChurnById,
  createChurnFeedback,
  updateChurnFeedback,
  deleteChurnFeedback,
} from "@/services/dashboard/superAdmin/churn/churn";
import AddMoreFeedbackModal from "@/components/ui/superAdmin/churn/addMoreFeedback-modal/addMoreFeedback-modal";
import UpdateFeedbackModal from "@/components/ui/superAdmin/churn/updateFeedBack-modal/updateFeedBack-modal";
import DeleteFeedbackModal from "@/components/ui/superAdmin/churn/deleteFeedback-modal/deleteFeedback-modal";
import classes from "./churn-details.module.css";

const ChurnDetails = () => {
  const { role, id } = useParams<{ role: string; id: string }>();
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state?.user);

  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Set<number>>(
    new Set()
  );
  const [addMoreFeedbackModal, setAddMoreFeedbackModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const [editFeedbackModal, setEditFeedbackModal] = useState<{
    open: boolean;
    feedback: null | any;
  }>({
    open: false,
    feedback: null,
  });
  const [deleteFeedbackModal, setDeleteFeedbackModal] = useState<{
    open: boolean;
    feedbackId: number | null;
  }>({
    open: false,
    feedbackId: null,
  });

  const { data, error, isLoading, refetch } = useQuery<any>({
    queryKey: ["getChurnById", id],
    queryFn: () => {
      return getChurnById(Number(id), { token });
    },
    enabled: !!token && !!id,
    staleTime: 30000,
  });

  const toggleFeedback = useCallback((feedbackId: number) => {
    setExpandedFeedbacks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  }, []);

  const handleMoreFeedbackModal = useCallback((id: number) => {
    setAddMoreFeedbackModal({ open: true, id: id });
  }, []);

  const handleAddMoreFeedbackModalClose = useCallback(() => {
    setAddMoreFeedbackModal({ open: false, id: null });
  }, []);

  const handleEditFeedbackModal = useCallback((feedback: any) => {
    setEditFeedbackModal({ open: true, feedback: { ...feedback } });
  }, []);

  const handleEditFeedbackModalClose = useCallback(() => {
    setEditFeedbackModal({ open: false, feedback: null });
  }, []);

  const handleDeleteFeedbackModal = useCallback((feedbackId: number) => {
    setDeleteFeedbackModal({ open: true, feedbackId });
  }, []);

  const handleDeleteFeedbackModalClose = useCallback(() => {
    setDeleteFeedbackModal({ open: false, feedbackId: null });
  }, []);

  const handleAddMoreFeedback = useMutation({
    mutationFn: (payload: {
      user_id: number;
      churn_id: number | null;
      reason_ids: number[];
      answers: {
        question_id: number;
        answer_text: string;
      }[];
      additional_notes?: string;
    }) =>
      createChurnFeedback(payload, {
        token,
      }),
    onSuccess: (data) => {
      setAddMoreFeedbackModal({ open: false, id: null });
      toast.success(`Feedback Added Successfully`);
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleUpdateFeedback = useMutation({
    mutationFn: (payload: {
      user_id: number;
      churn_id: number | null;
      reason_ids: number[];
      answers: {
        question_id: number;
        answer_text: string;
      }[];
      additional_notes?: string;
    }) =>
      updateChurnFeedback(editFeedbackModal?.feedback?.id, payload, {
        token,
      }),
    onSuccess: (data) => {
      setEditFeedbackModal({ open: false, feedback: null });
      toast.success(`Feedback Updated Successfully`);
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleDeleteFeedbackMutation = useMutation({
    mutationFn: (feedbackId: number) =>
      deleteChurnFeedback(feedbackId, {
        token,
      }),
    onSuccess: (data) => {
      setDeleteFeedbackModal({ open: false, feedbackId: null });
      toast.success(`Feedback Deleted Successfully`);
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  // Helper function to parse enrollment name
  const parseEnrollmentName = useCallback((name: string) => {
    if (!name)
      return {
        studentName: "N/A",
        tutorName: "N/A",
        curriculum: "N/A",
        board: "N/A",
        grade: "N/A",
        subject: "N/A",
      };

    const parts = name?.split(" | ").map((part) => part.trim());
    const studentAndTutor = parts[0]?.split("/")?.map((part) => part.trim());
    return {
      studentName:
        studentAndTutor?.[0].split(" ").slice(0, 2).join(" ") || "N/A",
      tutorName: studentAndTutor?.[1]?.replace(" -", "").trim() || "N/A",
      curriculum: parts[1] || "N/A",
      board: parts[2] || "N/A",
      grade: parts[3] || "N/A",
      subject: parts[4] || "N/A",
    };
  }, []);

  const addMoreFeedbackModalProps = useMemo(
    () => ({
      modalValues: addMoreFeedbackModal,
      handleClose: handleAddMoreFeedbackModalClose,
      heading: "Add feedback to this churn",
      subHeading:
        "Please provide additional feedback or details about why this enrollment churned",
      handleAddMoreFeedback: (payload: {
        user_id: number;
        churn_id: number | null;
        reason_ids: number[];
        answers: {
          question_id: number;
          answer_text: string;
        }[];
        additional_notes?: string;
      }) => handleAddMoreFeedback.mutate(payload),
      loading: handleAddMoreFeedback?.isPending,
      success: handleAddMoreFeedback?.isSuccess,
    }),
    [
      addMoreFeedbackModal,
      handleAddMoreFeedbackModalClose,
      handleAddMoreFeedback,
    ]
  );

  const updateFeedbackModalProps = useMemo(
    () => ({
      modalValues: editFeedbackModal,
      handleClose: handleEditFeedbackModalClose,
      heading: "Update feedback for this churn",
      subHeading: "Update the feedback details for this churn",
      handleUpdateFeedback: (payload: {
        user_id: number;
        churn_id: number | null;
        reason_ids: number[];
        answers: {
          question_id: number;
          answer_text: string;
        }[];
        additional_notes?: string;
      }) => {
        handleUpdateFeedback.mutate(payload);
      },
      loading: handleUpdateFeedback?.isPending,
      success: handleUpdateFeedback?.isSuccess,
    }),
    [editFeedbackModal, handleEditFeedbackModalClose, handleUpdateFeedback]
  );

  const deleteFeedbackModalProps = useMemo(
    () => ({
      modalOpen: deleteFeedbackModal.open,
      handleClose: handleDeleteFeedbackModalClose,
      subHeading:
        "Are you sure you want to delete this feedback? This action is permanent.",
      heading: "Delete Feedback?",
      handleDelete: () => {
        if (deleteFeedbackModal.feedbackId) {
          handleDeleteFeedbackMutation.mutate(deleteFeedbackModal.feedbackId);
        }
      },
      loading: handleDeleteFeedbackMutation?.isPending,
    }),
    [
      deleteFeedbackModal,
      handleDeleteFeedbackModalClose,
      handleDeleteFeedbackMutation,
    ]
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

  // Memoized values
  const item = useMemo(() => data, [data]);

  const enrollmentInfo = useMemo(
    () => parseEnrollmentName(item?.enrollment?.name),
    [item?.enrollment?.name, parseEnrollmentName]
  );

  const churnId = useMemo(() => item?.id, [item?.id]);

  return (
    <div className={classes.container}>
      {isLoading ? (
        <LoadingBox />
      ) : (
        <>
          <div className={classes.container}>
            <div key={item?.id} className={classes.churnItem}>
              <div className={classes.enrollmentInfo}>
                <p className={classes.enrollmentInfoField}>
                  Student Name: <span>{enrollmentInfo.studentName} </span>
                </p>
                <p className={classes.enrollmentInfoField}>
                  Tutor Name: <span> {enrollmentInfo.tutorName}</span>
                </p>
                <p className={classes.enrollmentInfoField}>
                  Subject: <span> {enrollmentInfo.subject}</span>
                </p>
                <p className={classes.enrollmentInfoField}>
                  Curriculum: <span> {enrollmentInfo.curriculum}</span>
                </p>
                <p className={classes.enrollmentInfoField}>
                  Board: <span> {enrollmentInfo.board}</span>
                </p>
                <p className={classes.enrollmentInfoField}>
                  Grade: <span> {enrollmentInfo.grade}</span>
                </p>
              </div>
              <div className={classes.feedbackBox}>
                {item?.feedbacks && item.feedbacks.length > 0 && (
                  <div className={classes.mainBox}>
                    <div className={classes.feedbacksHighlight}>
                      <p className={classes.enrollmentInfoField}>
                        Churn Id: <span>{item.id}</span>
                      </p>
                      <p className={classes.enrollmentInfoField}>
                        Churned At:
                        <span>
                          {" "}
                          {moment.utc(item.churned_at).format("Do-MMM-YY")}
                        </span>
                      </p>
                    </div>
                    {item.feedbacks.map((feedback: any) => {
                      const isExpanded = expandedFeedbacks.has(feedback.id);
                      return (
                        <div key={feedback.id} className={classes.feedback}>
                          <div
                            className={`${classes.feedbackHeader}  ${
                              isExpanded ? classes.expand : ""
                            }`}
                            onClick={() => toggleFeedback(feedback.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <p className={classes.enrollmentInfoFieldFeedBy}>
                              Feedback By:{" "}
                              <span
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  width: "max-content",
                                  padding: "5px 7.5px",
                                  borderRadius: "5px",
                                  color:
                                    user?.roleId === 1
                                      ? "#653838"
                                      : user?.roleId === 2
                                      ? "#653838"
                                      : user?.roleId === 3
                                      ? "#286320"
                                      : user?.roleId === 4
                                      ? "#2D2D2D"
                                      : user?.roleId === 5
                                      ? "#2F3282"
                                      : "#653838",
                                  backgroundColor:
                                    user?.roleId === 1
                                      ? "#FFACAC"
                                      : user?.roleId === 2
                                      ? "#FFACAC"
                                      : user?.roleId === 3
                                      ? "#96EFCF"
                                      : user?.roleId === 4
                                      ? "#FFFAA0"
                                      : user?.roleId === 5
                                      ? "#DBDCFF"
                                      : "#FFACAC",
                                }}
                              >
                                {" "}
                                {feedback.user.name}
                              </span>
                            </p>
                            <div className={classes.feebBackActions}>
                              <Tooltip title={"Edit Feedback"} arrow>
                                <span
                                  className={classes.iconBox}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFeedbackModal(feedback);
                                  }}
                                >
                                  <Image
                                    src="/assets/svgs/edit.svg"
                                    alt="edit"
                                    width={0}
                                    height={0}
                                    style={{
                                      width:
                                        "clamp(0.75rem, 0.7rem + 0.25vw, 1rem)",
                                      height:
                                        "clamp(0.75rem, 0.7rem + 0.25vw, 1rem)",
                                    }}
                                  />
                                </span>
                              </Tooltip>
                              <Tooltip title={"Delete Feedback"} arrow>
                                <span
                                  className={classes.iconBox}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFeedbackModal(feedback.id);
                                  }}
                                >
                                  <Image
                                    src="/assets/svgs/delete.svg"
                                    alt="delete"
                                    width={0}
                                    height={0}
                                    style={{
                                      width:
                                        "clamp(0.75rem, 0.7rem + 0.25vw, 1rem)",
                                      height:
                                        "clamp(0.75rem, 0.7rem + 0.25vw, 1rem)",
                                    }}
                                  />
                                </span>
                              </Tooltip>
                              <div
                                className={`${classes.chevronIcon} ${
                                  isExpanded ? classes.chevronExpanded : ""
                                }`}
                              >
                                {isExpanded ? <ChevronUp /> : <ChevronDown />}
                              </div>
                            </div>
                          </div>

                          <div
                            className={`${classes.reasonsQuestionBox} ${
                              isExpanded ? classes.expanded : classes.collapsed
                            }`}
                          >
                            <div className={classes.reasonsQuestionBoxContent}>
                              <div className={classes.reasons}>
                                <p className={classes.enrollmentInfoField}>
                                  Reasons:
                                </p>
                                <div className={classes.reasonBox}>
                                  {feedback.feedbackReasons.map(
                                    (fr: any, index: number) => (
                                      <div
                                        key={fr.id}
                                        className={classes.reason}
                                      >
                                        <span>{index + 1}. </span>
                                        {fr.reason.reason}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                              <div className={classes.reasons}>
                                <p className={classes.enrollmentInfoField}>
                                  QnA:
                                </p>
                                <div className={classes.reasonBox}>
                                  {feedback.feedbackAnswers.map(
                                    (fr: any, index: number) => (
                                      <div
                                        key={fr.id}
                                        className={classes.qnaBox}
                                      >
                                        <div className={classes.question}>
                                          <span>{index + 1}. </span>
                                          {fr.question.question}
                                        </div>
                                        <div className={classes.reason}>
                                          <span>Ans. </span>
                                          {fr.answer_text || "No Show"}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Tooltip title={"Add Feedback"} arrow>
                  <div className={classes.actionBox}>
                    <Button
                      inlineStyling={{
                        borderRadius: "50%",
                        height: "clamp(1.875rem, 1.3636rem + 2.2727vw, 3rem)",
                        width: "clamp(1.875rem, 1.3636rem + 2.2727vw, 3rem)",
                        minHeight: "0px",
                        alignSelf: "flex-end",
                        filter:
                          "drop-shadow(2px 2px 4px rgba(56, 182, 255, 0.40))",
                      }}
                      icon={
                        <Plus
                          style={{
                            height:
                              "clamp(1.25rem, 0.8665rem + 1.7045vw, 2rem)",
                            width: "clamp(1.25rem, 0.8665rem + 1.7045vw, 2rem)",
                          }}
                        />
                      }
                      clickFn={() => handleMoreFeedbackModal(churnId)}
                    />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
          <AddMoreFeedbackModal {...addMoreFeedbackModalProps} />
          <UpdateFeedbackModal {...updateFeedbackModalProps} />
          <DeleteFeedbackModal {...deleteFeedbackModalProps} />
        </>
      )}
    </div>
  );
};

export default ChurnDetails;
