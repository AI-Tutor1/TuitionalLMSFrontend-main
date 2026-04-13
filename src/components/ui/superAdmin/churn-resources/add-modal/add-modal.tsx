import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import styles from "./add-modal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import { toast } from "react-toastify";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  activeTab: string;
  handleAdd: (data: { reason?: string; question?: string }) => void;
  loading: boolean;
  isSuccess: boolean;
}

// Constants moved outside component to prevent recreation
const MAIN_DIV_STYLES: React.CSSProperties = {
  width: "100%",
  border: "none",
  backgroundColor: "#FFF",
};

const BUTTON_STYLES: React.CSSProperties = {
  width: "100%",
};

const AddModal: React.FC<BasicModalProps> = memo(
  ({
    loading,
    modalOpen,
    handleClose,
    heading,
    subHeading,
    activeTab,
    handleAdd,
    isSuccess,
  }) => {
    const [newResource, setNewResource] = useState<string>("");
    const [reasonCategory, setReasonCategory] = useState<string>("");

    // Clear input when modal closes or success
    useEffect(() => {
      if (isSuccess || !modalOpen) {
        setNewResource("");
        setReasonCategory("");
      }
    }, [isSuccess, modalOpen]);

    // Memoized computed values
    const { singularTab, placeholder, errorMessage } = useMemo(() => {
      const singular = activeTab.slice(0, -1);
      return {
        singularTab: singular,
        placeholder: `Enter ${activeTab}`,
        errorMessage: `Please enter a ${singular.toLowerCase()}.`,
      };
    }, [activeTab]);

    const isReasonsTab = useMemo(() => activeTab === "Reasons", [activeTab]);

    // Input change handler
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewResource(e.target.value);
      },
      []
    );

    const handleReasonCategory = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setReasonCategory(e.target.value);
      },
      []
    );

    // Submit handler with validation
    const handleSubmit = useCallback(
      (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const trimmedValue = newResource.trim();
        const trimmedCategory = reasonCategory.trim();

        if (!trimmedValue) {
          toast.error(errorMessage);
          return;
        }

        if (isReasonsTab && !trimmedCategory) {
          toast.error("Please enter a category.");
          return;
        }
        const payload = isReasonsTab
          ? { reason: trimmedValue, category: reasonCategory }
          : { question: trimmedValue };

        handleAdd(payload);
      },
      [newResource, reasonCategory, errorMessage, isReasonsTab, handleAdd]
    );

    return (
      <Modal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={styles.mainBox}>
          <div className={styles.headingBox}>
            <Typography id="modal-modal-title">{heading}</Typography>
            {subHeading && (
              <Typography id="modal-modal-description">{subHeading}</Typography>
            )}
          </div>

          <form className={styles.contentBox} onSubmit={handleSubmit}>
            <div className={styles.mainContent}>
              {activeTab === "Reasons" && (
                <div className={styles.fields}>
                  <p>Reason Category</p>
                  <InputField
                    inputBoxStyles={MAIN_DIV_STYLES}
                    placeholder={placeholder}
                    changeFunc={handleReasonCategory}
                    value={reasonCategory}
                  />
                </div>
              )}
              <div className={styles.fields}>
                <p>{singularTab}</p>
                <InputField
                  inputBoxStyles={MAIN_DIV_STYLES}
                  placeholder={placeholder}
                  changeFunc={handleInputChange}
                  value={newResource}
                />
              </div>
            </div>

            <Button
              loading={loading}
              disabled={loading}
              inlineStyling={BUTTON_STYLES}
              text="Add"
              clickFn={handleSubmit}
            />
          </form>
        </Box>
      </Modal>
    );
  }
);

AddModal.displayName = "AddModal";

export default AddModal;
