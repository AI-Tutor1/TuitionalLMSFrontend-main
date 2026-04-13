import React, { memo, useCallback, useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./updateFeedBack-modal.module.css";
import Button from "@/components/global/button/button";
import { toast } from "react-toastify";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import {
  getAllChurnReasons,
  getAllChurnQuestions,
} from "@/services/dashboard/superAdmin/churn-resources/churn-resources";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import TextBox from "@/components/global/text-box/text-box";
import InputField from "@/components/global/input-field/input-field";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { MyAxiosError } from "@/services/error.type";

interface QuestionAnswer {
  question_id: number;
  answer_text: string; // ✅ Changed from answer to answer_text
}

interface UpdateChurnFeedbackPayload {
  user_id: number;
  churn_id: number | null;
  reason_ids: number[];
  answers: {
    question_id: number;
    answer_text: string; // ✅ Changed from answer to answer_text
  }[];
  additional_notes?: string;
}

interface BasicModalProps {
  modalValues: { open: boolean; feedback: any | null };
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleUpdateFeedback?: (payload: UpdateChurnFeedbackPayload) => void;
  loading?: boolean;
  success?: any;
}

const UpdateFeedbackModal: React.FC<BasicModalProps> = memo(
  ({
    modalValues,
    handleClose,
    heading,
    subHeading,
    handleUpdateFeedback,
    loading = false,
    success,
  }) => {
    console.log(modalValues);
    const { user, token } = useAppSelector((state: any) => state?.user);
    const [selectedReasons, setSelectedReasons] = useState<number[]>([]);
    const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>(
      [],
    );
    const [additionalNotes, setAdditionalNotes] = useState<string>("");

    // Initialize form with existing feedback data
    useEffect(() => {
      if (modalValues?.feedback) {
        const feedback = modalValues.feedback;

        // Pre-fill reasons
        if (feedback.feedbackReasons && feedback.feedbackReasons.length > 0) {
          const reasonIds = feedback.feedbackReasons.map(
            (fr: any) => fr.reason.id,
          );
          setSelectedReasons(reasonIds);
        }

        // Pre-fill question answers - use answer_text from API
        if (feedback.feedbackAnswers && feedback.feedbackAnswers.length > 0) {
          const answers = feedback.feedbackAnswers.map((fa: any) => ({
            question_id: fa.question.id,
            answer_text: fa.answer_text || "", // ✅ Changed to answer_text
          }));
          setQuestionAnswers(answers);
        }

        // Pre-fill additional notes if available
        if (feedback.additional_notes) {
          setAdditionalNotes(feedback.additional_notes);
        }
      }
    }, [modalValues?.feedback]);

    const handleSelectedReason = useCallback(
      (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
        const reasonIds = selectedOptions.map((item) => item.id);
        setSelectedReasons(reasonIds);
      },
      [],
    );

    const handleAnswerChange = useCallback(
      (questionId: number, answer: string) => {
        setQuestionAnswers((prev) => {
          const existingIndex = prev.findIndex(
            (qa) => qa.question_id === questionId,
          );

          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = {
              question_id: questionId,
              answer_text: answer, // ✅ Changed to answer_text
            };
            return updated;
          } else {
            return [...prev, { question_id: questionId, answer_text: answer }]; // ✅ Changed to answer_text
          }
        });
      },
      [],
    );

    const {
      data: allChurnReasons,
      error: allChurnReasonsError,
      isLoading: allChurnReasonsLoading,
    } = useQuery({
      queryKey: ["getAllChurnReasons"],
      queryFn: () => getAllChurnReasons({ token }),
      refetchOnWindowFocus: false,
      staleTime: 30000,
      enabled: !!token,
    });

    const {
      data: allChurnQuestions,
      error: allChurnQuestionsError,
      isLoading: allChurnQuestionsLoading,
    } = useQuery({
      queryKey: ["getAllChurnQuestions"],
      queryFn: () => getAllChurnQuestions({ token }),
      refetchOnWindowFocus: false,
      staleTime: 30000,
      enabled: !!token,
    });

    const isValidNumber = (value: string): boolean => {
      const trimmed = value.trim();
      return (
        trimmed !== "" && !isNaN(Number(trimmed)) && isFinite(Number(trimmed))
      );
    };

    const handleClosing = useCallback(() => {
      setSelectedReasons([]);
      setQuestionAnswers([]);
      setAdditionalNotes("");
      handleClose();
    }, [handleClose]);

    const displayHeading = useMemo(
      () => (heading?.endsWith("s") ? heading.slice(0, -1) : heading),
      [heading],
    );

    const selectedReasonValues = useMemo(() => {
      if (!allChurnReasons || !selectedReasons || selectedReasons.length === 0)
        return [];
      return allChurnReasons.filter((reason: any) =>
        selectedReasons.includes(reason.id),
      );
    }, [allChurnReasons, selectedReasons]);

    const getAnswerValue = useCallback(
      (questionId: number) => {
        return (
          questionAnswers.find((qa) => qa.question_id === questionId)
            ?.answer_text || "" // ✅ Changed to answer_text
        );
      },
      [questionAnswers],
    );

    const handleFormSubmit = useCallback(
      (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!selectedReasons || selectedReasons.length === 0) {
          toast.error("Please select at least one reason");
          return;
        }

        const unansweredQuestions = allChurnQuestions?.filter(
          (q: any) =>
            !questionAnswers
              .find((qa) => qa.question_id === q.id)
              ?.answer_text?.trim(), // ✅ Changed to answer_text
        );

        if (unansweredQuestions && unansweredQuestions.length > 0) {
          toast.error("Please answer all questions");
          return;
        }

        if (allChurnQuestions && allChurnQuestions.length > 0) {
          const firstQuestionId = allChurnQuestions[0].id;
          const firstAnswer = questionAnswers.find(
            (qa) => qa.question_id === firstQuestionId,
          )?.answer_text; // ✅ Changed to answer_text

          if (firstAnswer && !isValidNumber(firstAnswer)) {
            toast.error("First question answer must be a valid number");
            return;
          }
        }

        if (!modalValues?.feedback?.id) {
          toast.error("Feedback ID is missing");
          return;
        }

        const payload: UpdateChurnFeedbackPayload = {
          reason_ids: selectedReasons,
          answers: questionAnswers,
          user_id: user?.id, // ✅ Fixed: was using churn_id
          churn_id: modalValues?.feedback?.churn_id || null, // ✅ Fixed: was using user.id
          additional_notes: additionalNotes.trim() || undefined,
        };

        console.log(payload, "update payload");
        handleUpdateFeedback?.(payload);
      },
      [
        selectedReasons,
        questionAnswers,
        additionalNotes,
        allChurnQuestions,
        handleUpdateFeedback,
        user?.id,
        modalValues?.feedback,
      ],
    );

    useEffect(() => {
      if (success) {
        setSelectedReasons([]);
        setQuestionAnswers([]);
        setAdditionalNotes("");
      }
    }, [success]);

    useEffect(() => {
      if (allChurnQuestionsError || allChurnReasonsError) {
        const axiosError = (allChurnQuestionsError ||
          allChurnReasonsError) as MyAxiosError;
        toast.error(
          axiosError?.response?.data.message ||
            axiosError?.response?.data.error ||
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}` ||
            "An unexpected error occurred",
        );
      }
    }, [allChurnQuestionsError, allChurnReasonsError]);

    return (
      <Modal
        open={modalValues?.open}
        onClose={handleClosing}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.mainBox}>
          <div className={classes.headingBox}>
            {displayHeading && <p>{displayHeading}</p>}
            {subHeading && <p>{subHeading}</p>}
          </div>

          <form className={classes.contentBox} onSubmit={handleFormSubmit}>
            <div className={classes.fieldBox}>
              <div className={classes.field}>
                <label>Reasons</label>
                <MultiSelectDropDown
                  loading={allChurnReasonsLoading}
                  data={allChurnReasons}
                  inlineBoxStyles={{ ...styles.dropDownStyles }}
                  inputStyles={{ marginLeft: "10px" }}
                  placeholder="Select Reason"
                  handleChange={handleSelectedReason}
                  value={selectedReasonValues}
                />
              </div>
              <div className={classes.field}>
                <label>Questions</label>
                <div className={classes.questionAnswersBox}>
                  {allChurnQuestionsLoading ? (
                    <LoadingBox />
                  ) : (
                    allChurnQuestions?.map((item: any, index: number) => (
                      <div className={classes.field} key={item.id || index}>
                        <p>{item?.question}</p>
                        {index === 0 ? (
                          <InputField
                            placeholder="Enter a number..."
                            inputBoxStyles={{
                              ...styles.inputStyles,
                            }}
                            value={getAnswerValue(item.id)}
                            changeFunc={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => handleAnswerChange(item.id, e.target.value)}
                          />
                        ) : (
                          <TextBox
                            placeholder="Enter your answer here..."
                            value={getAnswerValue(item.id)}
                            onChange={(newValue: string) =>
                              handleAnswerChange(item.id, newValue)
                            }
                            inputBoxStyles={{
                              ...styles.inputStyles,
                              borderRadius: "10px",
                            }}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className={classes.field}>
                <label>Additional Notes (Optional)</label>
                <TextBox
                  placeholder="Enter additional notes..."
                  value={additionalNotes}
                  onChange={(newValue: string) => setAdditionalNotes(newValue)}
                  inputBoxStyles={{
                    ...styles.inputStyles,
                    borderRadius: "10px",
                  }}
                />
              </div>
            </div>

            <Button
              inlineStyling={styles.buttonStyles}
              text={"Update Feedback"}
              clickFn={handleFormSubmit}
              loading={loading}
              disabled={loading}
            />
          </form>
        </Box>
      </Modal>
    );
  },
);

UpdateFeedbackModal.displayName = "UpdateFeedbackModal";

export default UpdateFeedbackModal;

const styles = {
  buttonStyles: {
    position: "relative" as const,
    zIndex: 2,
    width: "calc(100% - 30px)",
    margin: "15px",
  },
  inputStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color)",
    boxShadow: "var(--cards--boxShadow-color)",
    border: "1px solid var(--color-dashboard-border)",
  },
  dropDownStyles: {
    width: "100%",
    background: "var(--main-white-color) !important",
    boxShadow: "var(--cards--boxShadow-color) !important",
  },
} as const;
