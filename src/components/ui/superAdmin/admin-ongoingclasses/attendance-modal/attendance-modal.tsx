import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Box, Modal } from "@mui/material";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import Button from "@/components/global/button/button";
import classes from "./attendance-modal.module.css";
import { ClassScheduleWithStudents } from "@/types/class-schedule/getOngoingClasses.types";
import { CreateTicket_Payload_Type } from "@/types/ticket/ticket.types";
import { useParams } from "next/navigation";
import CheckBox from "@/components/global/checkbox/checkbox";

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

const AttendanceModal: React.FC<BasicModalProps> = ({
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
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Get all student IDs
  const allStudentIds = useMemo(() => {
    return (
      modalOpen?.item?.enrollment?.studentsGroups?.map((item) => item?.id) || []
    );
  }, [modalOpen?.item?.enrollment?.studentsGroups]);

  // Check if all students are selected
  const isAllSelected = useMemo(() => {
    return (
      allStudentIds.length > 0 &&
      allStudentIds.every((id) => selectedStudents.includes(id))
    );
  }, [allStudentIds, selectedStudents]);

  // Handle individual student checkbox
  const handleStudentToggle = useCallback((studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  }, []);

  // Handle select all checkbox
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allStudentIds);
    }
  }, [isAllSelected, allStudentIds]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!modalOpen?.open) {
      setSelectedStudents([]);
    }
  }, [modalOpen?.open]);

  const handleFormSubmit = useCallback(() => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    // Handle form submission with selectedStudents
    console.log("Selected students:", selectedStudents);
  }, [selectedStudents]);

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
          {/* Select All Checkbox */}
          <div className={classes.selectAllBox}>
            <CheckBox
              label="Select All"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
          </div>

          <ol className={classes.studentListBox}>
            {modalOpen?.item?.enrollment?.studentsGroups?.map((item, indx) => (
              <li key={item?.id} className={classes.studentItem}>
                {indx + 1}.&nbsp;{item?.user?.name}
                <CheckBox
                  checked={selectedStudents.includes(item?.id)}
                  onChange={() => handleStudentToggle(item?.id)}
                />
              </li>
            ))}
          </ol>

          <Button
            loading={loading}
            disabled={loading || selectedStudents.length === 0}
            text="Generate"
            clickFn={handleFormSubmit}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(AttendanceModal);
