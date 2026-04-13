import React, { CSSProperties, memo } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./slots-confirm-modal.module.css";
import Button from "@/components/global/button/button";
import { Typography } from "@mui/material";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};
interface BasicModalProps {
  loading: boolean;
  modalOpen: any;
  handleConfirmSlot?: any;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties | undefined;
}

const SlotsConfirmModal: React.FC<BasicModalProps> = ({
  loading,
  modalOpen,
  handleClose,
  handleConfirmSlot,
  heading,
  subHeading,
  inlineDropDownBox,
}) => {
  const handleSubmit = () => {
    const payload = {
      teacher_schedule_id: modalOpen?.teacher_schedule_id,
      enrollment_id: modalOpen?.enrollment_id,
    };

    if (handleConfirmSlot) {
      handleConfirmSlot(payload);
    }
  };
  return (
    <Modal
      open={modalOpen?.open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={styles.mainBox}>
        <div className={styles.deleteLogoBox}>
          <AddIcon />
        </div>
        <div className={styles.headingBox}>
          <Typography>{heading}</Typography>
          <Typography>{subHeading}</Typography>
        </div>

        <div className={styles.buttonBox}>
          <Button
            inlineStyling={{
              width: "100%",
              backgroundColor: "transparent",
              border: "1px solid var(--main-blue-color)",
              color: "var(--main-blue-color)",
            }}
            text="Cancel"
            clickFn={handleClose}
          />
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={{
              width: "100%",
            }}
            text="Add"
            clickFn={handleSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(SlotsConfirmModal);
