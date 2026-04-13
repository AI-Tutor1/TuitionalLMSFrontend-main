import React, { useState, memo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./add-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import { toast } from "react-toastify";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean | any;
  success?: any;
}

const AddModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
}) => {
  const [roleName, setRoleName] = useState<string>("");

  const handleFormSubmit = () => {
    // Validation
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    // Submit the form
    handleAdd?.({ name: roleName.trim() });
  };

  useEffect(() => {
    if (success) {
      setRoleName("");
    }
  }, [success]);

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            borderBottom: "1px solid #e2e2e2",
          }}
        >
          <div className={classes.headingBox}>
            {heading && (
              <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
            )}
            {subHeading && <p>{subHeading}</p>}
          </div>
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.fields}>
              <Typography variant="body2">Role Name</Typography>
              <InputField
                inputBoxStyles={styles.inputStyles}
                placeholder="Enter role name"
                value={roleName}
                changeFunc={(e) => setRoleName(e.target.value)}
              />
            </div>
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

export default memo(AddModal);

const styles = {
  inputStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color)",
  },
};
