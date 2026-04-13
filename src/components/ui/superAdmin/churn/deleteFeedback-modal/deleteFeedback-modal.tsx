import React, { CSSProperties, memo } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./deleteFeedback-modal.module.css";
import Button from "@/components/global/button/button";
import Image from "next/image";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};
interface BasicModalProps {
  modalOpen: boolean;
  handleDelete: any;
  handleClose: any;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties | undefined;
  loading?: boolean;
  buttonText?: string;
}

const DeleteModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  handleDelete,
  heading,
  subHeading,
  inlineDropDownBox,
  loading,
  buttonText = "Delete",
}) => {
  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={styles.mainBox}>
        <div className={styles.deleteLogoBox}>
          <Image
            src="/assets/svgs/deleteModal.svg"
            layout="fill"
            objectFit="cover"
            alt="deleteLogo"
          />
        </div>
        <div className={styles.headingBox}>
          <h1>{heading}</h1>
          <p>{subHeading}</p>
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
            inlineStyling={{
              width: "100%",
              height: "5.3vh",
              backgroundColor: "var(--main-color)",
              color: "#fff",
              border: "1px solid var(--main-color",
              filter: "drop-shadow(1px 15px 34px rgba(56, 182, 255, 0.40)",
            }}
            text={buttonText}
            clickFn={handleDelete}
            loading={loading}
            disabled={loading}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(DeleteModal);
