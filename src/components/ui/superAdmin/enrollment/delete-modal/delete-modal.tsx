import React, { CSSProperties, memo } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./delete-modal.module.css";
import Button from "@/components/global/button/button";
import Image from "next/image";
import deleteModal from "../../resources/delete-modal/delete-modal";

type DropdownItem = {
  text: string;
  dropDown: React.ReactNode;
};
interface BasicModalProps {
  modalOpen: boolean;
  handleDelete: () => any;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  modalArr?: DropdownItem[];
  inlineDropDownBox?: CSSProperties | undefined;
  loading?: boolean;
  buttonText?: string;
  icon?: string;
  inlineIconBackgroundStyles?: CSSProperties | undefined;
  children?: React.ReactNode;
}

const DeleteModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  handleDelete,
  heading,
  subHeading,
  loading,
  icon,
  buttonText = "Delete",
  inlineIconBackgroundStyles,
  children,
}) => {
  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div
          className={classes.deleteLogoBox}
          style={inlineIconBackgroundStyles}
        >
          {icon ? (
            <Image
              src={icon}
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "var(--xLarge44-)",
                height: "var(--xLarge44-)",
                filter: "var(--icon-filter)",
              }}
              alt="deleteLogo"
            />
          ) : (
            <Image
              src={"/assets/svgs/deleteModal.svg"}
              layout="fill"
              objectFit="cover"
              alt="deleteLogo"
            />
          )}
        </div>
        <div className={classes.headingBox}>
          <h1>{heading}</h1>
          <p>{subHeading}</p>
        </div>
        {children}
        <div className={classes.buttonBox}>
          <Button
            inlineStyling={{
              width: "100%",
              backgroundColor: "transparent",
              border: "1px solid var(--main-color)",
              color: "var(--main-blue-color) !important",
            }}
            text="Cancel"
            clickFn={handleClose}
          />
          <Button
            inlineStyling={{
              width: "100%",
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
