import React, { CSSProperties, memo } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./remove-availableSlots-modal.module.css";
import Button from "@/components/global/button/button";
import { Typography } from "@mui/material";
import Image from "next/image";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};
interface BasicModalProps {
  loading: boolean;
  modalOpen: any;
  handleDelete?: any;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties | undefined;
}

const RemoveAvailableSlotsModal: React.FC<BasicModalProps> = ({
  loading,
  modalOpen,
  handleClose,
  handleDelete,
  heading,
  subHeading,
  inlineDropDownBox,
}) => {
  const handleSubmit = () => {
    const payload = { id: modalOpen?.id };

    if (handleDelete) {
      handleDelete(payload);
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
          <Image
            src="/assets/svg/deleteModal.svg"
            layout="fill"
            objectFit="cover"
            alt="deleteLogo"
          />
        </div>
        <div className={styles.headingBox}>
          <Typography>{heading}</Typography>
          <Typography>{subHeading}</Typography>
        </div>
        <div className={styles.buttonBox}>
          <Button
            inlineStyling={{
              width: "100%",
              height: "5.3vh",
              backgroundColor: "transparent",
              border: "1px solid var(--main-color)",
              color: "var(--main-color)",
            }}
            text="Cancel"
            clickFn={handleClose}
          />
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={{
              width: "100%",
              height: "5.3vh",
              backgroundColor: "var(--main-color)",
              color: "#fff",
              border: "1px solid var(--main-color",
              filter: "drop-shadow(1px 15px 34px rgba(56, 182, 255, 0.40)",
            }}
            text="Delete"
            clickFn={handleSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(RemoveAvailableSlotsModal);
