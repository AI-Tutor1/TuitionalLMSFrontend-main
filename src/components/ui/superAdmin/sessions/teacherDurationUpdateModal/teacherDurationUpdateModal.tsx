import React, { useState, memo, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./teacherDurationUpdateModal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";

const styles = {
  inputStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color)",
  },
} as const;

interface ModalState {
  open: boolean;
  id?: number | null;
  tutor_class_time?: number | string | null;
}

interface UpdatePayload {
  tutor_class_time: number | string | null;
}

interface TeacherDurationUpdateModalProps {
  modalOpen: ModalState;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleUpdate?: (payload: UpdatePayload) => void;
  loading?: boolean;
  success?: boolean;
}

const formatHeading = (heading: string): string =>
  heading.endsWith("s") ? heading.slice(0, -1) : heading;

const validateDuration = (value: string): string | null => {
  if (!value) return null;
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return "Please enter a valid positive number";
  }
  return null;
};

const TeacherDurationUpdateModal: React.FC<TeacherDurationUpdateModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleUpdate,
  loading = false,
  success = false,
}) => {
  const [duration, setDuration] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const isOpen = modalOpen?.open ?? false;
  const initialDuration = modalOpen?.tutor_class_time;

  // Prefetch value when modal opens
  useEffect(() => {
    if (isOpen && initialDuration != null) {
      setDuration(String(initialDuration));
      setValidationError(null);
    }
  }, [isOpen, initialDuration]);

  // Reset form when modal closes or on success
  // useEffect(() => {
  //   if (!isOpen || success) {
  //     setDuration("");
  //     setValidationError(null);
  //   }
  // }, [isOpen, success]);

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log(e.target.value);
      const value = e.target.value;
      // Only allow numeric input
      // if (value && !/^\d*\.?\d*$/.test(value)) return;
      setDuration(value);
      setValidationError(validateDuration(value));
    },
    [],
  );

  const handleFormSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!duration) {
        setValidationError("Duration is required");
        return;
      }

      const error = validateDuration(duration);
      if (error) {
        setValidationError(error);
        return;
      }

      // Send as number if valid, otherwise as string
      const durationNum = Number(duration);
      handleUpdate?.({
        tutor_class_time: isNaN(durationNum) ? duration : durationNum,
      });
    },
    [duration, handleUpdate],
  );

  const formattedHeading = heading ? formatHeading(heading) : "";
  const isSubmitDisabled = loading || !duration || !!validationError;

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="teacher-duration-modal-title"
      aria-describedby="teacher-duration-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {formattedHeading && <p>{formattedHeading}</p>}
          {subHeading && <p>{subHeading}</p>}
        </div>

        <div className={classes.section2}>
          <form className={classes.contentBox} onSubmit={handleFormSubmit}>
            <InputField
              inputBoxStyles={styles.inputStyles}
              placeholder="Update teacher duration in minutes"
              value={duration}
              changeFunc={handleDurationChange}
              type="text"
            />
            {validationError && (
              <p className={classes.errorText}>{validationError}</p>
            )}
            <button type="submit" hidden />
          </form>
          <Button
            inlineStyling={{ width: "100%" }}
            text={loading ? "Updating..." : "Update"}
            clickFn={handleFormSubmit}
            loading={loading}
            disabled={isSubmitDisabled}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(TeacherDurationUpdateModal);
