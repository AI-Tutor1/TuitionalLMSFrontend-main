"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import classes from "./editFeedback-modal.module.css";
import Button from "@/components/global/button/button";
import Modal from "@mui/material/Modal";
import TextBox from "@/components/global/text-box/text-box";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

// Teacher reasons (shown when teacher is logged in)
const TEACHER_REASONS = [
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

export interface FeedbacEditkData {
  id?: number;
  rating: number;
  feeling: number;
  comment: string;
  concerns: string;
}

interface EditFeedbackModalProps {
  isOpen: boolean;
  onSubmit: (feedback: FeedbacEditkData) => void;
  heading?: string;
  subHeading?: string;
  loading?: boolean;
  isSuccess?: boolean;
  handleClose?: () => void;
  feedbackData?: FeedbacEditkData | null; // ADD: existing feedback data for editing
}

const EditFeedbackModal: React.FC<EditFeedbackModalProps> = ({
  isOpen,
  onSubmit,
  heading = "We'd Love Your Feedback!",
  subHeading = "Help us improve your experience",
  loading,
  isSuccess,
  handleClose,
  feedbackData, // ADD: receive existing data
}) => {
  console.log(feedbackData);
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

  // Helper function to parse concerns string back to reason objects
  const parseConcernsToReasons = useCallback(
    (concernsString: string, reasonsList: typeof TEACHER_REASONS) => {
      if (!concernsString) return [];
      const concernNames = concernsString.split(", ").map((c) => c.trim());
      return reasonsList.filter((reason) => concernNames.includes(reason.name));
    },
    [],
  );

  // Pre-populate form when feedbackData changes or modal opens
  useEffect(() => {
    if (isOpen && feedbackData) {
      setRating(feedbackData.rating || 0);
      setComment(feedbackData.comment || "");

      // Parse concerns back to selected reasons
      if (feedbackData.concerns) {
        const teacherReasons = parseConcernsToReasons(
          feedbackData.concerns,
          TEACHER_REASONS,
        );
        const studentReasons = parseConcernsToReasons(
          feedbackData.concerns,
          STUDENT_REASONS,
        );
        setSelectedTeacherReasons(teacherReasons);
        setSelectedStudentReasons(studentReasons);
      }
    }
  }, [isOpen, feedbackData, parseConcernsToReasons]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setHoveredRating(0);
      setSelectedTeacherReasons([]);
      setSelectedStudentReasons([]);
      setComment("");
    }
  }, [isOpen]);

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
      toast.error("Please select a rating");
      return;
    }

    const allReasons = [...selectedTeacherReasons, ...selectedStudentReasons];
    if (allReasons.length === 0) {
      toast.error("Please select at least one reason");
      return;
    }

    // FIXED: Include id and use sessionId from feedbackData
    onSubmit({
      id: feedbackData?.id, // Include ID for update operation
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
    feedbackData,
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
    >
      <div
        className={classes.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={classes.headingBox}>
          <h2>{heading}</h2>
          <p>{subHeading}</p>
        </div>
        <div className={classes.feedbackForm}>
          {/* Rating Section */}
          <div className={classes.ratingSection}>
            <label className={classes.sectionLabel}>Rate Your Experience</label>
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
            {rating > 0 && (
              <p className={classes.ratingText}>
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
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
            <label className={classes.sectionLabel} htmlFor="feedback-comment">
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

          <div className={classes.buttonBox}>
            <Button
              inlineStyling={styles.buttonStyles1}
              text="Cancel"
              clickFn={handleClose}
            />
            <Button
              loading={loading}
              disabled={loading}
              inlineStyling={{ width: styles.buttonStyles1.width }}
              text="Update Feedback"
              clickFn={handleSubmit}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditFeedbackModal;

const styles = {
  buttonStyles1: {
    width: "100%",
    backgroundColor: "transparent",
    color: "var(--main-blue-color) !important",
    border: "1px solid var(--main-blue-color) !important",
  },
  dropDownStyles: {
    minWidth: "320px",
    flex: "1",
    background: "var(--main-white-color)",
  },
};
