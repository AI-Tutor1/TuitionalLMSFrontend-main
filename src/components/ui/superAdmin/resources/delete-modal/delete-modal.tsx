import React, { CSSProperties, useMemo, memo } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import styles from "./delete-modal.module.css";
import Button from "@/components/global/button/button";
import { Typography } from "@mui/material";
import Image from "next/image";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};
interface BasicModalProps {
  loading: boolean;
  modalOpen: boolean;
  handleDelete: () => void;
  handleClose: any;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties | undefined;
}

const DeleteModal: React.FC<BasicModalProps> = ({
  loading,
  modalOpen,
  handleClose,
  handleDelete,
  heading,
  subHeading,
  inlineDropDownBox,
}) => {
  // Memoize the inline styles
  console.log("delte modal");
  const cancelButtonStyles = useMemo<CSSProperties>(
    () => ({
      width: "100%",
      height: "5.3vh",
      backgroundColor: "transparent",
      border: "1px solid var(--main-color)",
      color: "var(--main-color)",
    }),
    []
  );

  const deleteButtonStyles = useMemo<CSSProperties>(
    () => ({
      width: "100%",
      height: "5.3vh",
      backgroundColor: "var(--main-color)",
      color: "#fff",
      border: "1px solid var(--main-color)",
      filter: "drop-shadow(1px 15px 34px rgba(56, 182, 255, 0.40))",
    }),
    []
  );

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
            inlineStyling={cancelButtonStyles}
            text="Cancel"
            clickFn={handleClose}
          />
          <Button
            loading={loading}
            inlineStyling={deleteButtonStyles}
            text="Delete"
            clickFn={handleDelete}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(DeleteModal);
