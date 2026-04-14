import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import classes from "./add-modal.module.css";
import { Create_New_Billing_Payload_Type } from "@/services/dashboard/superAdmin/billing/billing.types";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: Create_New_Billing_Payload_Type) => void;
  loading?: boolean;
  success?: boolean;
}

interface FormDataType {
  selectedStudent: string | null;
  amount: number | null;
  type: string;
}

const validateFormData = ({
  selectedStudent,
  amount,
}: {
  selectedStudent: string | null;
  amount: number | null;
}) => {
  if (!selectedStudent) return "Please select a student.";
  if (!amount) return "Amount is required.";
  if (amount < 0) return "Enter a valid amount.";
  return null;
};

const InitialState: FormDataType = {
  selectedStudent: null,
  amount: null,
  type: "",
};

const AddModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
}) => {
  const { students } = useAppSelector((state) => state?.usersByGroup);
  const [formData, setFormData] = useState<FormDataType>(InitialState);
  const transactionTypes = useMemo(
    () => ["Debit", "Credit"],
    [students?.users]
  );
  const filteredStudents = useMemo(
    () => students?.users?.map((item: any) => JSON.stringify(item)) || [],
    [students?.users]
  );

  const handleFormChange = useCallback(
    (field: keyof FormDataType, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleFormSubmit = useCallback(() => {
    const validationError = validateFormData({
      selectedStudent: formData?.selectedStudent,
      amount: formData?.amount,
    });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!formData?.selectedStudent) return;

    const payload: Create_New_Billing_Payload_Type = {
      user_id: JSON.parse(formData?.selectedStudent)?.id,
      amount: Number(formData?.amount),
      status: "1",
      type: formData?.type,
    };

    if (handleAdd) {
      handleAdd(payload);
    }
  }, [formData, handleAdd]);

  const resetFormState = useCallback(() => {
    setFormData(InitialState);
  }, []);

  useEffect(() => {
    if (success) {
      resetFormState();
    }
  }, [success, resetFormState]);

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
          <form className={classes.contentBox}>
            <div className={classes.mainContent}>
              <div className={classes.fields}>
                Amount
                <InputField
                  inputBoxStyles={styles.inputStyles}
                  inputStyles={{ fontSize: "var(--normal-text-size)" }}
                  placeholder="Enter amount"
                  value={
                    formData?.amount === null ? "" : String(formData?.amount)
                  }
                  changeFunc={(e) => handleFormChange("amount", e.target.value)}
                />
              </div>

              <div className={classes.fields}>
                Students
                <DropDown
                  placeholder="Select Student"
                  data={filteredStudents}
                  handleChange={(e: any) =>
                    handleFormChange("selectedStudent", e.target.value)
                  }
                  value={
                    formData?.selectedStudent === null
                      ? ""
                      : formData?.selectedStudent
                  }
                  inlineDropDownStyles={styles.dropDownStyles}
                />
              </div>
              <div className={classes.fields}>
                Type
                <DropDownSimple
                  placeholder="Select Transaction Type"
                  data={transactionTypes}
                  handleChange={(value) => handleFormChange("type", value)}
                  value={formData?.type ? formData?.type : ""}
                  externalStyles={styles.dropDownStyles}
                />
              </div>
            </div>
          </form>
          <Button
            loading={loading}
            disabled={loading}
            inlineStyling={styles.buttonStyles}
            text="Add"
            clickFn={handleFormSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(AddModal);

const styles = {
  dropDownStyles: {
    width: "100%",
    background: "var(--white-color) !important",
    boxShadow: "none !important",
    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
  },
  buttonStyles: {
    width: "100%",
    filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
  },
  inputStyles: {
    width: "100%",
    backgroundColor: "var(--white-color)",
    boxShadow: "none",
    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
  },
};
