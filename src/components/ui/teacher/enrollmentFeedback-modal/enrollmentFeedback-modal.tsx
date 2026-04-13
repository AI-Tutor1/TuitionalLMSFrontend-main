import React, { useState, memo, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./enrollmentFeedback-modal.module.css";
import Button from "@/components/global/button/button";
import { toast } from "react-toastify";
import TextBox from "@/components/global/text-box/text-box";

interface EnrollmentDetails {
  enrollment_name?: string;
  student_name?: string;
  teacher_name?: string;
  subject?: string;
  grade?: string;
  board?: string;
  curriculum?: string;
  hourly_rate?: string | number;
}

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  enrollmentDetails?: EnrollmentDetails;
  loading?: boolean | any;
  success?: any;
}

const EnrollmentFeedbackModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  enrollmentDetails,
  loading,
  success,
}) => {
  const [topicsCovered, setTopicsCovered] = useState<string>("");
  const [testDetails, setTestDetails] = useState<string>("");
  const [goalsNext8Classes, setGoalsNext8Classes] = useState<string>("");
  const [improvementPoints, setImprovementPoints] = useState<string>("");

  const handleFormSubmit = () => {
    if (!topicsCovered.trim()) {
      toast.error("Please enter topics covered");
      return;
    }
    if (!testDetails.trim()) {
      toast.error("Please enter test details");
      return;
    }
    if (!goalsNext8Classes.trim()) {
      toast.error("Please enter goals for next 8 classes");
      return;
    }
    if (!improvementPoints.trim()) {
      toast.error("Please enter points for improvement");
      return;
    }

    const formData = {
      enrollment_details: enrollmentDetails,
      topics_covered: topicsCovered,
      test_details: testDetails,
      goals_next_8_classes: goalsNext8Classes,
      improvement_points: improvementPoints,
    };

    // Submit the form
    handleAdd?.(formData);
  };

  const resetForm = () => {
    setTopicsCovered("");
    setTestDetails("");
    setGoalsNext8Classes("");
    setImprovementPoints("");
  };

  useEffect(() => {
    if (success) {
      resetForm();
    }
  }, [success]);

  const handleModalClose = () => {
    resetForm();
    handleClose();
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && <h2>{heading}</h2>}
          {subHeading && <p>{subHeading}</p>}
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            {/* Enrollment Details Section */}
            <div className={classes.fields}>
              <p className={classes.feedbackLabel}>
                Enrollment Name: <span className={classes.required}>*</span>
              </p>
              <span className={classes.detailValue}>
                {enrollmentDetails?.enrollment_name || "N/A"}
              </span>
            </div>

            {/* Topics Covered */}
            <div className={classes.fields}>
              <p className={classes.feedbackLabel}>
                What are the topics we have done uptil now?{" "}
                <span className={classes.required}>*</span>
              </p>
              <TextBox
                placeholder="List all topics covered so far (e.g., Algebra basics, Linear equations, Quadratic equations...)"
                value={topicsCovered}
                onChange={(value: string) => setTopicsCovered(value)}
                rows={6}
                maxLength={1000}
              />
            </div>

            {/* Test Details */}
            <div className={classes.fields}>
              <p className={classes.feedbackLabel}>
                Any test done with student? If yes, mention test date, marks and
                topic? <span className={classes.required}>*</span>
              </p>
              <TextBox
                placeholder="Enter test details: Date - DD/MM/YYYY, Topic - Subject Name, Marks - XX/100 (If no test, write 'No test conducted')"
                value={testDetails}
                onChange={(value: string) => setTestDetails(value)}
                rows={6}
                maxLength={1000}
              />
            </div>

            {/* Goals for Next 8 Classes */}
            <div className={classes.fields}>
              <p className={classes.feedbackLabel}>
                What are the goals for the next 8 classes?{" "}
                <span className={classes.required}>*</span>
              </p>
              <TextBox
                placeholder="Outline learning objectives and milestones for upcoming 8 sessions (e.g., Complete chapter 5, Practice 20 problems, Master trigonometry basics...)"
                value={goalsNext8Classes}
                onChange={(value: string) => setGoalsNext8Classes(value)}
                rows={6}
                maxLength={1000}
              />
            </div>

            {/* Points for Improvement */}
            <div className={classes.fields}>
              <p className={classes.feedbackLabel}>
                Points for improvements{" "}
                <span className={classes.required}>*</span>
              </p>
              <TextBox
                placeholder="Specify areas where student needs improvement (e.g., Problem-solving speed, Concept clarity, Homework completion...)"
                value={improvementPoints}
                onChange={(value: string) => setImprovementPoints(value)}
                rows={6}
                maxLength={1000}
              />
            </div>
          </form>
          <div className={classes.buttonBox}>
            <Button
              inlineStyling={styles?.buttonStyles1}
              text="Cancel"
              clickFn={handleModalClose}
            />
            <Button
              inlineStyling={styles?.buttonStyles}
              text="Submit"
              clickFn={handleFormSubmit}
              loading={loading}
              disabled={loading}
            />
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default memo(EnrollmentFeedbackModal);

const styles = {
  buttonStyles: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
  },
  buttonStyles1: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    backgroundColor: "transparent",
    color: "var(--main-color)",
    border: "1px solid var(--main-color)",
    filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
  },
};
