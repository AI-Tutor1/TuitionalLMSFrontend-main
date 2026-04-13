"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import classes from "./addFeedback-modal.module.css";
import Button from "@/components/global/button/button";
import Modal from "@mui/material/Modal";
import TextBox from "@/components/global/text-box/text-box";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import {
  getConclusionTypeStyles,
  getTagTypeStyles,
} from "@/utils/helpers/sessionType-styles";
import moment from "moment";

// Teacher reasons (shown when teacher is logged in)
const TEACHER_REASONS = [
  { id: 0, name: "No Concerns" },
  { id: 1, name: "Punctuality Non-Compliance" },
  { id: 2, name: "Attendance Irregularity" },
  { id: 3, name: "Excessive Break Requests" },
  { id: 4, name: "Camera Non-Compliance" },
  { id: 5, name: "Assignment Submission Delays" },
  { id: 6, name: "Academic Unpreparedness" },
  { id: 7, name: "Low Classroom Engagement" },
  { id: 8, name: "Delayed Responsiveness" },
  { id: 9, name: "Passive Participation" },
  { id: 10, name: "Connectivity Instability" },
  { id: 11, name: "Audio/Video Disruptions" },
  { id: 12, name: "Environmental Distractions" },
  { id: 13, name: "Learning Readiness Gaps" },
  { id: 14, name: "Comprehension Delays" },
  { id: 15, name: "Behavioral Misconduct" },
];

// Student reasons (shown when student is logged in)
const STUDENT_REASONS = [
  { id: 0, name: "No Concerns" },
  { id: 1, name: "Professional Punctuality Issues" },
  { id: 2, name: "Schedule Non-Adherence" },
  { id: 3, name: "Camera Non-Compliance" },
  { id: 4, name: "Lack of Lesson Structuring" },
  { id: 5, name: "Instructional Planning Deficiency" },
  { id: 6, name: "Curriculum Misalignment" },
  { id: 7, name: "Exam-Board Inconsistency" },
  { id: 8, name: "Low Instructional Engagement" },
  { id: 9, name: "Limited Interactivity" },
  { id: 10, name: "Technical Delivery Issues" },
  { id: 11, name: "Audio/Visual Quality Concerns" },
  { id: 12, name: "Environmental Distractions" },
  { id: 13, name: "Unprofessional Communication" },
  { id: 14, name: "Ineffective Pace Management" },
  { id: 15, name: "Lack of Instructional Adaptability" },
];

export interface FeedbackData {
  sessionId: number;
  rating: number;
  feeling: number;
  comment: string;
  concerns: string;
}

interface FeedbackModalProps {
  isOpen: boolean;
  onSubmit: (feedback: FeedbackData) => void;
  heading?: string;
  subHeading?: string;
  loading?: boolean;
  isSuccess?: boolean;
  handleClose?: () => void;
  sessionData?: any;
  sessionDataLength?: number;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onSubmit,
  heading = "We'd Love Your Feedback!",
  subHeading = "Help us improve your experience",
  loading,
  isSuccess,
  handleClose,
  sessionData,
  sessionDataLength,
}) => {
  const { role } = useParams();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedTeacherReasons, setSelectedTeacherReasons] = useState<any[]>(
    [],
  );
  const [selectedStudentReasons, setSelectedStudentReasons] = useState<any[]>(
    [],
  );
  const [comment, setComment] = useState<string>("");

  // Determine which dropdowns to show
  const showTeacherReasons = useMemo(() => {
    return role === "teacher" || role !== "student";
  }, [role]);

  const showStudentReasons = useMemo(() => {
    return role === "student" || role !== "teacher";
  }, [role]);

  const handleTeacherReasonChange = useCallback(
    (
      e: React.SyntheticEvent,
      selectedOptions: { id: number; name: string }[],
    ) => {
      if (selectedOptions.length > 3) {
        toast.warn("You can only select up to 3 reasons");
        return;
      }
      setSelectedTeacherReasons(selectedOptions);
    },
    [],
  );
  // Handle student reason selection
  const handleStudentReasonChange = useCallback(
    (
      e: React.SyntheticEvent,
      selectedOptions: { id: number; name: string }[],
    ) => {
      if (selectedOptions.length > 3) {
        toast.warn("You can only select up to 3 reasons");
        return;
      }
      setSelectedStudentReasons(selectedOptions);
    },
    [],
  );

  const multiSelectTeacherProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: styles.dropDownStyles,
      placeholder: "Select teacher reasons",
      data: TEACHER_REASONS,
      handleChange: handleTeacherReasonChange,
      value: selectedTeacherReasons,
    }),
    [handleTeacherReasonChange, selectedTeacherReasons],
  );

  const multiSelectStudentProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: styles.dropDownStyles,
      placeholder: "Select student reasons",
      data: STUDENT_REASONS,
      handleChange: handleStudentReasonChange,
      value: selectedStudentReasons,
    }),
    [handleStudentReasonChange, selectedStudentReasons],
  );

  const handleSubmit = useCallback(() => {
    if (rating === 0) {
      toast.warn("Please give rating");
      return;
    }

    const allReasons = [...selectedTeacherReasons, ...selectedStudentReasons];
    // if (allReasons.length === 0) {
    //   toast.warn("Please select at least one reason");
    //   return;
    // }

    onSubmit({
      sessionId: sessionData?.id || null,
      rating,
      feeling: rating,
      comment,
      concerns: allReasons.map((reason) => reason.name).join(", "),
    });
  }, [
    rating,
    selectedTeacherReasons,
    selectedStudentReasons,
    comment,
    onSubmit,
  ]);

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      setRating(0);
      setSelectedTeacherReasons([]);
      setSelectedStudentReasons([]);
      setComment("");
    }
  }, [isSuccess]);

  if (!isOpen) return null;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        zIndex: 20000,
        position: "absolute",
      }}
    >
      <div
        className={classes.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={classes.headingBox}>
          <div className={classes.headingBoxContent}>
            <h2>Class Feedback</h2>
            <p className={classes.sessionDataLength}>
              {moment.utc(sessionData?.created_at).local().format("Do MMMM") ||
                "No Show"}
              &nbsp;
              {moment.utc(sessionData?.created_at).local().format("h:mm a") ||
                "No Show"}
            </p>
          </div>
          <span className={classes.sessionDataLength}>
            Remaining Class Feedbacks:&nbsp;{sessionDataLength}
          </span>
        </div>
        <div className={classes.feedbackForm}>
          {/* Rating Section */}
          <div className={classes.feedbackFormFields}>
            <div className={classes.sessionInfoBox}>
              <div className={classes.field} style={{ gap: "0px" }}>
                <span className={classes.sectionLabel}>Session Tag</span>
                <span style={getTagTypeStyles(sessionData?.tag || "No Show")}>
                  {sessionData?.tag || "No Show"}
                </span>
              </div>
              {role === "teacher" && (
                <div className={classes.field}>
                  <span className={classes.sectionLabel}>Student Name</span>
                  <span className={classes.value}>
                    {sessionData?.sessionEnrollment?.studentsGroups?.length > 0
                      ? sessionData.sessionEnrollment.studentsGroups
                          .map((group: any) => group?.user?.name)
                          .filter(Boolean)
                          .join(", ")
                      : "No Show"}
                  </span>
                </div>
              )}
              {role === "student" && (
                <div className={classes.field}>
                  <span className={classes.sectionLabel}>Tutor Name</span>
                  <span className={classes.value}>
                    {sessionData?.tutor?.name || "No Show"}
                  </span>
                </div>
              )}
              {/* <div className={classes.field}>
                <span className={classes.sectionLabel}>Session Date</span>
                <span className={classes.value}>
                  {moment
                    .utc(sessionData?.created_at)
                    .local()
                    .format("Do-MMM") || "No Show"}
                  &nbsp;
                  {moment
                    .utc(sessionData?.created_at)
                    .local()
                    .format("h:mm a") || "No Show"}
                </span>
              </div> */}
              <div className={classes.field}>
                <span className={classes.sectionLabel}>Subject</span>
                <span className={classes.value}>
                  {sessionData?.subject?.name || "No Show"}
                </span>
              </div>
              <div className={classes.field}>
                <span className={classes.sectionLabel}>Curriculum</span>
                <span className={classes.value}>
                  {sessionData?.subjectCurriculum?.name || "No Show"}
                </span>
              </div>
              <div className={classes.field}>
                <span className={classes.sectionLabel}>Grade</span>
                <span className={classes.value}>
                  {sessionData?.subjectGrade?.name || "No Show"}
                </span>
              </div>
            </div>
            <div className={classes.ratingSection}>
              <label className={classes.sectionLabel}>
                Rate Your Experience
              </label>
              <div className={classes.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${classes.star} ${
                      star <= (hoveredRating || rating) ? classes.active : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher Reasons Section */}
            {showTeacherReasons && (
              <div className={classes.commentSection}>
                <label className={classes.sectionLabel}>
                  Student Related Concerns
                </label>
                <MultiSelectDropDown {...multiSelectTeacherProps} />
              </div>
            )}

            {/* Student Reasons Section */}
            {showStudentReasons && (
              <div className={classes.commentSection}>
                <label className={classes.sectionLabel}>
                  Teacher Related Concerns
                </label>
                <MultiSelectDropDown {...multiSelectStudentProps} />
              </div>
            )}

            {/* Comment Section */}
            <div className={classes.commentSection}>
              <label
                className={classes.sectionLabel}
                htmlFor="feedback-comment"
              >
                Tell Us More
              </label>
              <TextBox
                placeholder="Add Comment"
                value={comment}
                onChange={(value) => setComment(value)}
                inlineTextAreaStyles={{
                  boxShadow: "var(--main-inner-boxShadow-color)",
                }}
              />
            </div>
          </div>
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={{ width: styles.buttonStyles1.width }}
            text="Submit Feedback"
            clickFn={handleSubmit}
          />
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackModal;

const styles = {
  buttonStyles1: {
    width: "100%",
    backgroundColor: "transparent",
    color: "var(--main-blue-color) !important",
    border: "1px solid var(--main-blue-color) !important",
  },
  dropDownStyles: {
    minWidth: "none",
    flex: "1",
    background: "var(--main-white-color)",
  },
};
