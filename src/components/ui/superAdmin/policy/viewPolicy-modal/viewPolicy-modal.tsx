import React, { memo } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import classes from "./viewPolicy-modal.module.css";
import ReactMarkdown from "react-markdown";
import { useParams } from "next/navigation";
import HtmlReviewer from "@/components/global/html-reviewer/html-reviewer";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  values?: any;
}

const ViewPolicyModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  values,
}) => {
  const { role } = useParams();
  const role_to = values?.assigned_to;

  const getRoleStyles = (role: string) => {
    switch (role) {
      case "Super Admin":
      case "Admin":
        return { color: "#653838", backgroundColor: "#FFACAC" };
      case "Teacher":
      case "Parent":
        return { color: "#2F3282", backgroundColor: "#DBDCFF" };
      case "Student":
        return { color: "#286320", backgroundColor: "#96EFCF" };
      default:
        return { color: "#2F3282", backgroundColor: "#DBDCFF" };
    }
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.section1}>
          <div className={classes.header}>
            {values?.title}
            {role !== "teacher" && role !== "student" && (
              <span style={getRoleStyles(role_to)}>{values?.assigned_to}</span>
            )}
          </div>
          <span>{values?.category}</span>
        </div>
        <HtmlReviewer>{values?.policy_content}</HtmlReviewer>
      </Box>
    </Modal>
  );
};

export default memo(ViewPolicyModal);
