import React, { useState, useCallback, memo, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import Button from "@/components/global/button/button";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import classes from "./relation-modal.module.css";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import InputField from "@/components/global/input-field/input-field";
import { UserByGroup_Object } from "@/services/dashboard/superAdmin/users/users.type";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  parents?: any[];
  students?: any[];
  loading?: boolean;
  success?: boolean;
}

const initialState = {
  guardianName: "",
  studentIds: [] as number[],
  relation: "",
};

type FormDataType = typeof initialState;

const validateFormData = ({ guardianName, studentIds }: FormDataType) => {
  if (studentIds.length === 0) return "Select at least one student";
  if (guardianName.trim() === "") return "Guardian Name is required";
  return null;
};

const RelationModal: React.FC<BasicModalProps> = memo(
  ({
    modalOpen,
    handleClose,
    heading,
    subHeading,
    handleAdd,
    students = [],
    loading = false,
    success = false,
    parents = [],
  }) => {
    const [formData, setFormData] = useState<FormDataType>(initialState);
    const handleInputChange = useCallback((name: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }, []);

    const handleFormSubmit = useCallback(() => {
      const validationError = validateFormData(formData);

      if (validationError) {
        toast.error(validationError);
        return;
      }

      const payload = {
        parentId: JSON.parse(formData.guardianName).id,
        studentIds: formData.studentIds,
        relation: formData.relation,
      };
      if (handleAdd) {
        handleAdd(payload);
      }
    }, [formData, handleAdd]);

    const resetFormState = useCallback(() => {
      setFormData(initialState);
    }, []);

    // Reset form when success or modalOpen changes
    useEffect(() => {
      if (success) {
        resetFormState();
      }
    }, [success, resetFormState]);

    // Reset form when modal opens
    useEffect(() => {
      if (modalOpen) {
        resetFormState();
      }
    }, [modalOpen, resetFormState]);

    return (
      <Modal
        open={modalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className={classes.mainBox}>
          <div className={classes.headingBox}>
            {heading && (
              <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
            )}
            {subHeading && <p>{subHeading}</p>}
          </div>
          <div className={classes.section2}>
            <form
              className={classes.contentBox}
              onSubmit={(e) => {
                e.preventDefault();
                handleFormSubmit();
              }}
            >
              <div className={classes.fields}>
                Guardian Name
                <DropDown
                  placeholder="Select Guardian"
                  data={parents.map((i) => JSON.stringify(i)) || []}
                  handleChange={(value: any) => {
                    const selectedOption = JSON.parse(value.target.value);
                    handleInputChange(
                      "guardianName",
                      JSON.stringify(selectedOption) || "",
                    );
                  }}
                  value={formData?.guardianName}
                  inlineDropDownStyles={styles.dropDownStyles}
                />
              </div>
              <div className={classes.fields}>
                Student Name
                <MultiSelectDropDown
                  placeholder="Select Students"
                  data={students || []}
                  handleChange={(event: any, selectedOptions: any[]) =>
                    handleInputChange(
                      "studentIds",
                      selectedOptions?.map((student) => student?.id),
                    )
                  }
                  value={students?.filter((student) =>
                    formData.studentIds.includes(student?.id),
                  )}
                  inlineDropDownStyles={{
                    ...styles.dropDownStyles,
                    overflowX: "auto",
                  }}
                />
              </div>
              <div className={classes.fields}>
                Relation
                <InputField
                  placeholder="Enter Relation"
                  value={formData?.relation}
                  changeFunc={(e) =>
                    handleInputChange("relation", e.target.value)
                  }
                  inputBoxStyles={styles?.inputStyles}
                />
              </div>

              <Button
                loading={loading}
                disabled={loading}
                inlineStyling={styles.buttonStyles}
                text="Add Relation"
                type="submit"
                clickFn={handleFormSubmit}
              />
            </form>
          </div>
        </Box>
      </Modal>
    );
  },
);

// Add display name for better debugging
RelationModal.displayName = "RelationModal";

const styles = {
  buttonStyles: {
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  inputStyles: {
    width: "100%",
    background: "var(--main-white-color)",
    boxShadow: "var(--main-inner-boxShadow-color) ",
  },
  dropDownStyles: {
    width: "100%",
    backgroundColor: "var(--main-white-color) !important",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
  },
} as const;

export default RelationModal;
