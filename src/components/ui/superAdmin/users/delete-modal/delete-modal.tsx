import React, { CSSProperties, memo } from "react";
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
  modalOpen: boolean;
  handleDelete: any;
  handleClose: any;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties | undefined;
  loading?: boolean;
}

const DeleteModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  handleDelete,
  heading,
  subHeading,
  inlineDropDownBox,
  loading,
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
          <Typography>{heading}</Typography>
          <Typography>{subHeading}</Typography>
        </div>
        <div className={styles.buttonBox}>
          <Button
            inlineStyling={{
              width: "100%",
              backgroundColor: "transparent",
              border: "1px solid var(--main-blue-color)",
              color: "var(--main-blue-color) !important",
            }}
            text="Cancel"
            clickFn={handleClose}
          />
          <Button
            text="Delete"
            clickFn={handleDelete}
            loading={loading}
            inlineStyling={{
              width: "100%",
            }}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(DeleteModal);
