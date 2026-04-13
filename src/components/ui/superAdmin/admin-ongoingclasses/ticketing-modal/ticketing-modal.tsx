import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";
import classes from "./ticketing-modal.module.css";
import { ClassScheduleWithStudents } from "@/types/class-schedule/getOngoingClasses.types";
import { CreateTicket_Payload_Type } from "@/types/ticket/ticket.types";
import { useParams } from "next/navigation";

interface BasicModalProps {
  modalOpen: {
    open: boolean;
    item: ClassScheduleWithStudents | null;
  };
  handleCloseModal: () => void;
  heading: string;
  subHeading?: string;
  handleGenerate?: (data: CreateTicket_Payload_Type) => void;
  loading?: boolean;
  success?: boolean;
}

interface FormDataType {
  role: "";
  subject: string;
  // message: string;
  sendToIds: string[] | null;
  priority: string;
}

const validateFormData = ({
  subject,
  // message,
  sendToIds,
  priority,
}: FormDataType) => {
  if (sendToIds?.length === 0)
    return "Please select at least one student or teacher.";
  if (!priority.trim()) return "Please select a priority.";
  if (!subject.trim()) return "Please enter a subject.";
  // if (!message.trim()) return "Please enter a message.";
  return null;
};

const InitialState: FormDataType = {
  role: "",
  sendToIds: null,
  // message: "",
  subject: "",
  priority: "",
};

const TicketingModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleCloseModal,
  heading,
  subHeading,
  handleGenerate,
  loading,
  success,
}) => {
  const { user } = useAppSelector((state) => state?.user);
  const { role } = useParams();
  const [formData, setFormData] = useState<FormDataType>(InitialState);

  const handleFormChange = useCallback(
    (field: keyof FormDataType, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleFormSubmit = useCallback(() => {
    const sendToIds =
      role === "superAdmin" ||
      role === "admin" ||
      role === "counsellor" ||
      role === "hr"
        ? formData?.role && formData.role === "Teacher"
          ? ([
              String(modalOpen?.item?.enrollment?.tutor?.id) ||
                String(modalOpen?.item?.enrollment_reschedual?.tutor?.id),
            ].filter(Boolean) as string[])
          : formData?.role && formData.role === "Student"
            ? modalOpen?.item?.enrollment?.studentsGroups?.map((item) =>
                String(item?.student_id),
              ) || []
            : []
        : role === "teacher"
          ? modalOpen?.item?.enrollment?.studentsGroups?.map((item) =>
              String(item?.student_id),
            ) || []
          : role === "student"
            ? ([
                String(modalOpen?.item?.enrollment?.tutor?.id) ||
                  String(modalOpen?.item?.enrollment_reschedual?.tutor?.id),
              ].filter(Boolean) as string[])
            : [];

    // Validate form data
    const validationError = validateFormData({
      ...formData,
      sendToIds,
    });

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payload: CreateTicket_Payload_Type = {
      subject: formData?.subject,
      priority: formData?.priority,
      // message: formData?.message,
      created_by_user_id: user?.id || null,
      enrollment_id:
        modalOpen?.item?.enrollment?.id ||
        modalOpen?.item?.enrollment_reschedual?.id ||
        null,
      status: "Open",
      sendToIds,
    };

    if (handleGenerate) {
      handleGenerate(payload);
    }
  }, [formData, handleGenerate, modalOpen, role]);

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
      open={modalOpen?.open}
      onClose={handleCloseModal}
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
            {(role === "superAdmin" ||
              role === "admin" ||
              role === "counsellor" ||
              role === "hr") && (
              <div className={classes.fields}>
                <p>Select Role</p>
                <DropDownSimple
                  placeholder="Select Subject"
                  data={["Student", "Teacher"]}
                  handleChange={(value: string) =>
                    handleFormChange("role", value)
                  }
                  value={formData?.role === null ? "" : formData?.role}
                  externalStyles={styles.dropDownStyles}
                />
              </div>
            )}
            <div className={classes.fields}>
              <p>Priority</p>
              <DropDownSimple
                placeholder="Select Transaction Type"
                data={["Low", "Medium", "High"]}
                handleChange={(value) => handleFormChange("priority", value)}
                value={formData?.priority ? formData?.priority : ""}
                externalStyles={styles.dropDownStyles}
              />
            </div>
            <div className={classes.fields}>
              <p>Subject</p>
              <DropDownSimple
                placeholder="Select Subject"
                data={["Waiting in the class", "Home work not completed"]}
                handleChange={(value: string) =>
                  handleFormChange("subject", value)
                }
                value={formData?.subject === null ? "" : formData?.subject}
                externalStyles={styles.dropDownStyles}
              />
            </div>
            {/* <div className={classes.fields}>
              <p>Message</p>
              <DropDownSimple
                placeholder="Select Category"
                data={["Waiting in the class", "Home work not completed"]}
                handleChange={(value: string) =>
                  handleFormChange("message", value)
                }
                value={formData?.message === null ? "" : formData?.message}
                externalStyles={styles.dropDownStyles}
              />
            </div> */}
          </form>
          <Button
            loading={loading}
            disabled={loading}
            text="Generate"
            clickFn={handleFormSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(TicketingModal);

const styles = {
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
};
