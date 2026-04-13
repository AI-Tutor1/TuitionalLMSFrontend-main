import React, { useState, memo, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./instantClass-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";

interface InstantClassModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean;
  success?: boolean;
}

const InstantClassModal: React.FC<InstantClassModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
}) => {
  const [duration, setDuration] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset form when success is true
  useEffect(() => {
    if (success) {
      setDuration("");
      setValidationError(null);
    }
  }, [success]);

  // Reset form when modal closes
  useEffect(() => {
    if (!modalOpen) {
      setDuration("");
      setValidationError(null);
    }
  }, [modalOpen]);

  // Handle duration input change
  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setDuration(value);

      if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
        setValidationError("Please enter a valid positive number");
      } else {
        setValidationError(null);
      }
    },
    [],
  );

  // Handle form submission
  const handleFormSubmit = useCallback(() => {
    if (!duration) {
      setValidationError("Duration is required");
      return;
    }

    const durationNum = Number(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      setValidationError("Please enter a valid positive number");
      return;
    }

    handleAdd?.({
      duration: durationNum || null,
    });
  }, [duration, handleAdd]);

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && (
            <Typography variant="h6">
              {heading.endsWith("s") ? heading.slice(0, -1) : heading}
            </Typography>
          )}
          {subHeading && <Typography variant="body2">{subHeading}</Typography>}
        </div>
        <div className={classes.section2}>
          <form
            className={classes.contentBox}
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit();
            }}
          >
            <InputField
              inputBoxStyles={styles.inputStyles}
              placeholder="Enter duration in minutes"
              value={duration}
              changeFunc={handleDurationChange}
            />
          </form>
          <Button
            inlineStyling={{ width: "100%" }}
            text="Add"
            clickFn={handleFormSubmit}
            loading={loading}
            disabled={loading}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(InstantClassModal);
const styles = {
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
};
