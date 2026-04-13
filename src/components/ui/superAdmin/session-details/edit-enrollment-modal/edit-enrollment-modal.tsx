import React, { useState, memo, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./edit-enrollment-modal.module.css";
import Button from "@/components/global/button/button";
import { toast } from "react-toastify";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import InputField from "@/components/global/input-field/input-field";
import TextBox from "@/components/global/text-box/text-box";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleUpdate?: (data: any) => void;
  loading?: boolean;
  data?: string;
  type: string;
  durationIni?: number | null;
}

const EditEnrollmentModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleUpdate,
  loading,
  data,
  type,
  durationIni,
}) => {
  console.log(type);
  const [conclusion_type, setConclusion_type] = useState("");
  const [duration, setDuration] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const handleChange = useCallback((value: string) => {
    setConclusion_type(value);
  }, []);

  const handleFormSubmit = () => {
    if (!conclusion_type) {
      toast.error("Please select a conclusion type.");
      return;
    }
    if (!reason) {
      toast.error("Please provide a reason.");
      return;
    }
    const formData = {
      ...(conclusion_type && { conclusion_type }),
      ...(reason && { reason }),
    };
    // console.log(formData);
    handleUpdate?.(formData);
  };
  const handleDurationFormSubmit = () => {
    if (!duration) {
      toast.error("Please provide a duration.");
      return;
    }
    const durationNumber = Number(duration);
    if (isNaN(durationNumber) || durationNumber <= 0) {
      toast.error("Please provide a valid positive number for duration.");
      return;
    }
    const formData = {
      duration: durationNumber || durationIni,
    };
    handleUpdate?.(formData);
  };

  useEffect(() => {
    if (type && type === "duration" && durationIni) {
      setDuration(String(durationIni));
    } else {
      setConclusion_type(data ?? "");
    }
  }, [data, durationIni, type]);

  const formattedHeading = heading.endsWith("s")
    ? heading.slice(0, -1)
    : heading;

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
              {formattedHeading}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Typography>
          )}
          {subHeading && (
            <Typography variant="subtitle1">{`${subHeading} ${type}.`}</Typography>
          )}
        </div>

        <div className={classes.section2}>
          <form className={classes.contentBox}>
            {type === "conclusion_type" && (
              <div className={classes.fields}>
                <Typography variant="body2">Conclusion Type</Typography>
                <DropDownSimple
                  externalStyles={styles.dropDownStyles}
                  placeholder="Select Conclusion Type"
                  value={conclusion_type}
                  handleChange={handleChange}
                  data={[
                    "No Show",
                    "Conducted",
                    "Cancelled",
                    "Student Absent",
                    "Teacher Absent",
                  ]}
                  aria-label="Conclusion type dropdown"
                />
              </div>
            )}
            {type === "duration" && (
              <div className={classes.fields}>
                <Typography variant="body2">Duration</Typography>
                <InputField
                  placeholder="Change Duration"
                  value={String(duration) ?? ""}
                  changeFunc={(e) => setDuration(e.target.value)}
                  aria-label="Change Duration Input"
                  inputBoxStyles={{
                    ...styles.dropDownStyles,
                  }}
                />
              </div>
            )}
            <div className={classes.fields}>
              <Typography variant="body2">Add Reason</Typography>
              <TextBox
                placeholder="Add Reason"
                value={reason}
                onChange={(value) => setReason(value)}
                inlineTextAreaStyles={{
                  boxShadow: styles.dropDownStyles?.boxShadow,
                }}
              />
            </div>
          </form>
          <Button
            inlineStyling={{ width: "100%" }}
            text="Update"
            clickFn={
              type === "duration" ? handleDurationFormSubmit : handleFormSubmit
            }
            loading={loading}
            disabled={loading}
            aria-label="Update conclusion type"
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(EditEnrollmentModal);
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
