import React, { memo, useCallback, useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import moment, { Moment } from "moment";
import classes from "./enrollment-pause-modal.module.css";
import Button from "@/components/global/button/button";
import {
  Curriculum_Type,
  Board_Type,
  Subject_Type,
  Grade_Type,
} from "@/services/dashboard/superAdmin/curriulums/curriulums.type";
import { User } from "@/services/dashboard/superAdmin/users/users.type";
import CheckBox from "@/components/global/checkbox/checkbox";
import { toast } from "react-toastify";
import DatePicker from "@/components/global/date-picker/date-picker";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import {
  getAllChurnReasons,
  getAllChurnQuestions,
} from "@/services/dashboard/superAdmin/churn-resources/churn-resources";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import TextBox from "@/components/global/text-box/text-box";
import NotStartedOutlinedIcon from "@mui/icons-material/NotStartedOutlined";
import InputField from "@/components/global/input-field/input-field";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { MyAxiosError } from "@/services/error.type";
import { Padding } from "@mui/icons-material";

interface ModalValues {
  open: boolean;
  id: number | null;
  name: string;
  on_break: boolean | null;
  is_permanent: boolean | null;
}

interface BasicModalProps {
  modalValues: ModalValues;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleEnrollmentPause?: (data: EnrollmentPausePayload) => void;
  subject?: Subject_Type[];
  board?: Board_Type[];
  curriculum?: Curriculum_Type[];
  grades?: Grade_Type[];
  students?: User[];
  teachers?: User[];
  loading?: boolean;
  success?: any;
}

interface QuestionAnswer {
  question_id: number;
  answer: string;
}

interface EnrollmentPausePayload {
  id: number | null;
  on_break: boolean | null;
  is_permanent: boolean;
  pause_starts_at?: string;
  pause_ends_at?: string;
  reason_ids?: number[];
  answers?: QuestionAnswer[];
  user_id?: number;
}

interface PauseState {
  pauseType: "temporary" | "permanent" | null;
  pauseStartDate: Moment | null;
  pauseEndDate: Moment | null;
}

const INITIAL_STATE: PauseState = {
  pauseType: null,
  pauseStartDate: null,
  pauseEndDate: null,
};

const EnrollmentPauseModal: React.FC<BasicModalProps> = memo(
  ({
    modalValues,
    handleClose,
    heading,
    subHeading,
    handleEnrollmentPause,
    loading = false,
  }) => {
    const { user, token } = useAppSelector((state: any) => state?.user);
    const [pauseState, setPauseState] = useState<PauseState>(INITIAL_STATE);
    const [selectedReasons, setSelectedReasons] = useState<number[]>([]);
    const [questionAnswers, setQuestionAnswers] = useState<QuestionAnswer[]>(
      [],
    );

    const handleSelectedReason = useCallback(
      (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
        const reasonIds = selectedOptions.map((item) => item.id);
        setSelectedReasons([...reasonIds]);
      },
      [],
    );

    // Generic handler for all question answers
    const handleAnswerChange = useCallback(
      (questionId: number, answer: string) => {
        setQuestionAnswers((prev) => {
          const existingIndex = prev.findIndex(
            (qa) => qa.question_id === questionId,
          );

          if (existingIndex !== -1) {
            // Update existing answer
            const updated = [...prev];
            updated[existingIndex] = { question_id: questionId, answer };
            return updated;
          } else {
            // Add new answer
            return [...prev, { question_id: questionId, answer }];
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
      staleTime: 300000,
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
      staleTime: 300000,
      enabled: !!token,
    });

    const isValidNumber = (value: string): boolean => {
      const trimmed = value.trim();
      return (
        trimmed !== "" && !isNaN(Number(trimmed)) && isFinite(Number(trimmed))
      );
    };

    const handleTemporaryChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setPauseState((prev) => ({
          pauseType: e.target.checked ? "temporary" : null,
          pauseStartDate: e.target.checked ? prev.pauseStartDate : null,
          pauseEndDate: e.target.checked ? prev.pauseEndDate : null,
        }));
      },
      [],
    );

    const handlePermanentChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setPauseState({
          pauseType: e.target.checked ? "permanent" : null,
          pauseEndDate: null,
          pauseStartDate: null,
        });
      },
      [],
    );

    const handleStartDateChange = useCallback((value: string | null) => {
      setPauseState((prev) => ({
        ...prev,
        pauseStartDate: value ? moment(value) : null,
      }));
    }, []);

    const handleEndDateChange = useCallback((value: string | null) => {
      setPauseState((prev) => ({
        ...prev,
        pauseEndDate: value ? moment(value) : null,
      }));
    }, []);

    const handleClosing = useCallback(() => {
      handleClose();
    }, [handleClose]);

    // Memoized computed values
    const displayHeading = useMemo(
      () => (heading?.endsWith("s") ? heading.slice(0, -1) : heading),
      [heading],
    );

    const buttonText = useMemo(
      () => (modalValues.on_break ? "Unpause" : "Pause"),
      [modalValues.on_break],
    );

    const showDatePicker = useMemo(
      () => pauseState.pauseType === "temporary",
      [pauseState.pauseType],
    );

    const selectedReasonValues = useMemo(() => {
      if (!allChurnReasons || !selectedReasons) return [];
      return allChurnReasons.filter((reason: any) =>
        selectedReasons.includes(reason.id),
      );
    }, [allChurnReasons, selectedReasons]);

    // Get answer value for a specific question
    const getAnswerValue = useCallback(
      (questionId: number) => {
        return (
          questionAnswers.find((qa) => qa.question_id === questionId)?.answer ||
          ""
        );
      },
      [questionAnswers],
    );

    const handleFormSubmit = useCallback(
      (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validation for temporary pause
        if (
          modalValues?.on_break === false &&
          pauseState.pauseType === "temporary"
        ) {
          if (!pauseState.pauseStartDate || !pauseState.pauseEndDate) {
            toast.error("Please select both start and end dates");
            return;
          }

          const today = moment().startOf("day");
          const startDate = moment(pauseState.pauseStartDate).startOf("day");
          const endDate = moment(pauseState.pauseEndDate).startOf("day");

          if (startDate.isBefore(today)) {
            toast.error("Pause start date must be today or after");
            return;
          }

          if (endDate.isSameOrBefore(startDate)) {
            toast.error("Pause end date must be after start date");
            return;
          }
        }

        // Validation for permanent pause
        if (
          modalValues?.on_break === false &&
          pauseState.pauseType === "permanent"
        ) {
          if (!selectedReasons || selectedReasons.length === 0) {
            toast.error("Please select at least one reason");
            return;
          }

          // Check if all questions are answered
          const unansweredQuestions = allChurnQuestions?.filter(
            (q: any) =>
              !questionAnswers
                .find((qa) => qa.question_id === q.id)
                ?.answer?.trim(),
          );

          if (unansweredQuestions && unansweredQuestions.length > 0) {
            toast.error("Please answer all questions");
            return;
          }

          // Validate first question answer is a number
          if (allChurnQuestions && allChurnQuestions.length > 0) {
            const firstQuestionId = allChurnQuestions[0].id;
            const firstAnswer = questionAnswers.find(
              (qa) => qa.question_id === firstQuestionId,
            )?.answer;

            if (firstAnswer && !isValidNumber(firstAnswer)) {
              toast.error("First question answer must be a valid number");
              return;
            }
          }
        }

        const payload: EnrollmentPausePayload = {
          id: modalValues.id,
          on_break: !modalValues?.on_break,
          is_permanent: pauseState.pauseType === "permanent",
          user_id: user?.id,
        };

        // Add dates only for temporary pause when pausing (not unpausing)
        if (!modalValues?.on_break && pauseState.pauseType === "temporary") {
          payload.pause_starts_at = moment(pauseState.pauseStartDate).format(
            "YYYY-MM-DD",
          );
          payload.pause_ends_at = moment(pauseState.pauseEndDate).format(
            "YYYY-MM-DD",
          );
        }

        // Add reasons and answers for permanent pause
        if (!modalValues?.on_break && pauseState.pauseType === "permanent") {
          payload.reason_ids = selectedReasons;
          payload.answers = questionAnswers;
        }

        // console.log("Payload:", payload);
        handleEnrollmentPause?.(payload);
      },
      [
        modalValues.id,
        modalValues.on_break,
        pauseState.pauseType,
        pauseState.pauseStartDate,
        pauseState.pauseEndDate,
        selectedReasons,
        questionAnswers,
        allChurnQuestions,
        handleEnrollmentPause,
      ],
    );
    // Reset state when modal closes
    useEffect(() => {
      if (!modalValues.open) {
        setPauseState(INITIAL_STATE);
        setSelectedReasons([]);
        setQuestionAnswers([]);
      }
    }, [modalValues.open]);

    useEffect(() => {
      if (allChurnQuestionsError || allChurnReasonsError) {
        const axiosError = (allChurnQuestionsError ||
          allChurnReasonsError) as MyAxiosError;
        toast.error(
          axiosError?.response?.data.message ||
            axiosError?.response?.data.error ||
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}` ||
            "An unexpected error occured",
        );
      }
    }, [allChurnQuestionsError, allChurnReasonsError]);

    return (
      <Modal
        open={modalValues.open}
        onClose={handleClosing}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.mainBox}>
          <div className={classes.headingBox}>
            {displayHeading && <p>{displayHeading}</p>}
            {subHeading && <p>{subHeading}</p>}
          </div>

          {modalValues.on_break && (
            <div className={classes.deleteLogoBox}>
              <NotStartedOutlinedIcon
                sx={{
                  height: "7vw",
                  width: "7vw",
                  color: "var(--main-white-color)",
                }}
              />
            </div>
          )}

          <form className={classes.contentBox} onSubmit={handleFormSubmit}>
            {pauseState.pauseType !== "permanent" &&
              modalValues.on_break === false && (
                <CheckBox
                  label={`${
                    modalValues?.on_break ? "Unpause" : "Pause"
                  } temporarily`}
                  checked={pauseState.pauseType === "temporary"}
                  onChange={handleTemporaryChange}
                />
              )}

            {showDatePicker && modalValues.on_break === false && (
              <div className={classes.durationBox}>
                <DatePicker
                  width="100%"
                  value={
                    pauseState.pauseStartDate
                      ? pauseState.pauseStartDate.format("YYYY-MM-DD")
                      : ""
                  }
                  changeFn={handleStartDateChange}
                  background={styles.inputStyles.background}
                  boxShadow={styles.inputStyles.boxShadow}
                  placeholder="Start Date"
                />
                -{" "}
                <DatePicker
                  value={
                    pauseState.pauseEndDate
                      ? pauseState.pauseEndDate.format("YYYY-MM-DD")
                      : ""
                  }
                  changeFn={handleEndDateChange}
                  background={styles.inputStyles.background}
                  boxShadow={styles.inputStyles.boxShadow}
                  placeholder="End Date"
                />
              </div>
            )}

            {pauseState.pauseType !== "temporary" &&
              modalValues.on_break === false && (
                <CheckBox
                  label={`${
                    modalValues?.on_break ? "Unpause" : "Pause"
                  } permanently`}
                  checked={pauseState.pauseType === "permanent"}
                  onChange={handlePermanentChange}
                />
              )}

            {pauseState.pauseType === "permanent" && (
              <div className={classes.fieldBox}>
                <div className={classes.field}>
                  <label>Reasons</label>
                  <MultiSelectDropDown
                    loading={allChurnReasonsLoading}
                    data={allChurnReasons}
                    inlineBoxStyles={{
                      backgroundColor: "var(--main-white-color)",
                      boxShadow: styles.inputStyles.boxShadow,
                      paddingLeft: "10px 15px",
                    }}
                    innerBoxShadow={"none"}
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
                                backgroundColor: "var(--main-white-color)",
                                boxShadow: styles.inputStyles.boxShadow,
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
                              inlineTextAreaStyles={{
                                boxShadow: styles.inputStyles.boxShadow,
                              }}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              inlineStyling={{ width: "100%" }}
              text={buttonText}
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

EnrollmentPauseModal.displayName = "EnrollmentPauseModal";

export default EnrollmentPauseModal;

const styles = {
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
  dropDownStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color) !important",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
  },
};
