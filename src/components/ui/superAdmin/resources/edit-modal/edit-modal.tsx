import React, { useMemo, memo, useCallback, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import styles from "./edit-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import { toast } from "react-toastify";

interface BasicModalProps {
  loading: boolean;
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  activeTab: string;
  handleEdit: any;
}

const EditModal: React.FC<BasicModalProps> = ({
  loading,
  modalOpen,
  handleClose,
  heading,
  subHeading,
  activeTab,
  handleEdit,
}) => {
  console.log("edit modal");
  // Memoize the button and input styles
  const buttonStyles = useMemo(
    () => ({
      width: "100%",
      height: "5.3vh",
      fill: "#38B6FF",
      filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
    }),
    []
  );

  const inputBoxStyles = useMemo(
    () => ({
      width: "100%",
      border: "none",
      backgroundColor: "#FFF",
      height: "6.5vh",
    }),
    []
  );

  const [updateResource, setUpdateResource] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUpdateResource(value);
  };

  const handleSubmit = useCallback(() => {
    if (!updateResource) {
      toast.error(`Please enter a ${activeTab?.slice(0, -1).toLowerCase()}.`);
    } else {
      handleEdit(updateResource);
    }
  }, [updateResource]);

  useEffect(() => {
    if (loading) {
      setUpdateResource("");
    }
  }, [loading]);
  return (
    <Modal
      open={modalOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box className={styles.mainBox}>
        <div className={styles.headingBox}>
          {heading && (
            <Typography>
              {heading.endsWith("s") ? heading.slice(0, -1) : heading}
            </Typography>
          )}
          {subHeading && <Typography>{subHeading}</Typography>}
        </div>
        <div className={styles.section2}>
          <div className={styles.contentBox}>
            <div className={styles.mainContent}>
              <div className={styles.fields}>
                {activeTab?.endsWith("s") ? activeTab.slice(0, -1) : activeTab}
                <InputField
                  value={updateResource}
                  inputBoxStyles={inputBoxStyles}
                  placeholder={`Enter ${
                    activeTab?.endsWith("s")
                      ? activeTab.slice(0, -1)
                      : activeTab
                  }`}
                  changeFunc={handleInputChange}
                />
              </div>
            </div>
          </div>
          <Button
            loading={loading}
            inlineStyling={buttonStyles}
            text="Update"
            clickFn={handleSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(EditModal);
