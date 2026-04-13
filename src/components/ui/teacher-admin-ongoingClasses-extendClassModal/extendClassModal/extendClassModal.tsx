import React, { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./extendClassModal.module.css";
import Button from "@/components/global/button/button";
import DropDown from "@/components/global/dropDown-simple/dropDown-simple";
import { toast } from "react-toastify";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (extendDuration: number) => void;
  loading?: boolean | any;
  success?: any;
  duration: number | null;
}

const ExtendClassModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
  duration,
}) => {
  const [extendTime, setExtendTime] = useState<string | null>(null);

  const handleFormSubmit = () => {
    if (!extendTime && Number(extendTime) !== 0) {
      toast.error("Extension time is required");
      return;
    }
    const extendTimeNum = Number(extendTime);
    if (isNaN(extendTimeNum)) {
      toast.error("Extension time must be a valid number");
      return;
    }
    handleAdd?.(Number(duration) + extendTimeNum);
  };

  const handleCloseModal = () => {
    setExtendTime(null);
    handleClose();
  };

  useEffect(() => {
    if (success) {
      setExtendTime(null);
    }
  }, [success]);

  return (
    <Modal
      open={modalOpen}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          {heading && (
            <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
          )}
          {subHeading && <p>{subHeading}</p>}
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <DropDown
              placeholder="Add Duration"
              data={["+30", "+60", "+120"]}
              handleChange={(value: any) => setExtendTime(value.slice(1))}
              value={extendTime || ""}
              externalStyles={styles?.dropDownStyles}
            />
            {extendTime ? (
              <p>
                Extended New Class Duration:{" "}
                <span>{`${Number(duration) + Number(extendTime)}`}</span>
              </p>
            ) : (
              <p>
                Duration: <span>{`${duration}`}</span>
              </p>
            )}
          </form>
          <Button
            text="Confirm"
            clickFn={handleFormSubmit}
            loading={loading}
            disabled={loading}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(ExtendClassModal);

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
