import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./add-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import { toast } from "react-toastify";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  activeTab: string;
  handleAdd: any;
  loading: boolean;
}

const AddModal: React.FC<BasicModalProps> = ({
  loading,
  modalOpen,
  handleClose,
  heading,
  subHeading,
  activeTab,
  handleAdd,
}) => {
  const [newResource, setNewResource] = useState<string>("");
  // Clear input when success becomes true
  useEffect(() => {
    if (loading) {
      setNewResource("");
    }
  }, [loading]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewResource(e.target.value);
  };

  // Submit handler with validation
  const handleSubmit = useCallback(() => {
    if (!newResource) {
      toast.error(`Please enter a ${activeTab.slice(0, -1).toLowerCase()}.`);
    } else {
      handleAdd(newResource.trim());
    }
  }, [newResource]);

  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={classes.mainBox}>
        <div className={classes.headingBox}>
          <Typography>{heading}</Typography>
          {subHeading && <Typography>{subHeading}</Typography>}
        </div>
        <div className={classes.section2}>
          <div className={classes.contentBox}>
            <div className={classes.mainContent}>
              <div className={classes.fields}>
                <p>{activeTab}</p>
                <InputField
                  inputBoxStyles={styles.inputStyles}
                  placeholder={`Enter ${activeTab}`}
                  changeFunc={handleInputChange}
                  value={newResource}
                />
              </div>
            </div>
          </div>
          <Button
            loading={loading}
            inlineStyling={{ width: "100%" }}
            text="Add"
            clickFn={handleSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

// Extracted styles for better readability

export default memo(AddModal);

const styles = {
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
};
