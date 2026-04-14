import React, { useState, memo, useCallback, useMemo, useEffect } from "react";
import classes from "./manualPayment-modal.module.css";
import { toast } from "react-toastify";
import moment from "moment";
import Image from "next/image";
import Box from "@mui/material/Box";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import DatePicker from "@/components/global/date-picker/date-picker";
import { getAllusers } from "@/services/dashboard/superAdmin/users/users";
import { getAllEnrollments } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: () => void;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean;
  success?: boolean;
}

interface StudentEnrollment {
  id?: number;
  user_id: string;
  enrollments: Array<{
    enrollmentName: string;
    numberOfClasses: number;
    hourlyRate: number;
    total: number;
  }>;
}

const todoListHeadData = ["Enrollment", "Hourly Rate", "Classes", "Action"];

const ManualPaymentModal: React.FC<BasicModalProps> = ({
  modalOpen,
  handleClose,
  heading,
  subHeading,
  handleAdd,
  loading,
  success,
}) => {
  const { token } = useAppSelector((state) => state?.user);
  const { students } = useAppSelector((state) => state?.usersByGroup);

  // States
  const [formState, setFormState] = useState({
    hourlyRate: "",
    numberOfClasses: "",
    searchName: "",
    validFrom: null as string | null,
    validTill: null as string | null,
  });
  const [parent, setParent] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<any>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<
    StudentEnrollment[]
  >([]);
  // Queries
  const { data: getAllUserData, isLoading: getAllUserLoading } = useQuery({
    queryKey: ["getAllUsers"],
    queryFn: () =>
      getAllusers(
        {
          userType: 4,
          limit: 50,
          page: 1,
        },
        { token }
      ),
    enabled: !!token,
  });

  const { data: getAllEnrollmentsData, isLoading: getAllEnrollmentsLoading } =
    useQuery({
      queryKey: [
        "enrollments",
        "for-manual-payment",
        formState?.searchName?.length >= 3 && formState.searchName,
      ],
      queryFn: () =>
        getAllEnrollments(
          {
            name: student?.name || "",
          },
          {
            token,
          }
        ),
      enabled: !!token && !!student,
    });

  // Memoized values
  const filteredParents = useMemo(() => {
    return (
      getAllUserData?.users?.map((item: any) => JSON.stringify(item)) || []
    );
  }, [getAllUserData]);

  const filteredStudents = useMemo(() => {
    return students?.users?.map((item: any) => JSON.stringify(item)) || [];
  }, [students]);

  const stringifyEnrollmentData = useMemo(() => {
    return (
      getAllEnrollmentsData?.data?.map((item: any) => JSON.stringify(item)) ||
      []
    );
  }, [getAllEnrollmentsData]);

  // Event handlers
  const handleParentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedParent = JSON.parse(e.target.value);
      setParent(selectedParent);
    },
    []
  );

  const handleStudentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedStudent = JSON.parse(e.target.value);
      setStudent(selectedStudent);
    },
    []
  );

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleOnInputChange = useCallback(
    (e: React.ChangeEvent<any>) => {
      handleFormChange("searchName", e?.target?.value);
    },
    [handleFormChange]
  );

  const handleEnrollmentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedEnrollment = JSON.parse(e.target.value);
      setEnrollmentId(selectedEnrollment);
      handleFormChange(
        "hourlyRate",
        selectedEnrollment?.hourly_rate?.toString() || ""
      );
    },
    [handleFormChange]
  );

  const handleDateChange = useCallback(
    (field: "validFrom" | "validTill", value: string | null) => {
      if (!value) {
        setFormState((prev) => ({ ...prev, [field]: null }));
        return;
      }

      if (field === "validTill" && formState.validFrom) {
        const newValidTill = moment(value);
        const validFromMoment = moment(formState.validFrom);

        if (validFromMoment.isAfter(newValidTill)) {
          toast.error("Valid Till date cannot be before Valid From date.");
          return;
        }

        if (validFromMoment.isSame(newValidTill)) {
          toast.error("Valid Till date cannot be the same as Valid From date.");
          return;
        }
      }

      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [formState.validFrom]
  );

  const validateEnrollmentForm = useCallback(() => {
    const { hourlyRate, numberOfClasses } = formState;

    if (!hourlyRate || !student || !enrollmentId || !numberOfClasses) {
      toast.error("All fields are required");
      return false;
    }

    // Validate if hourlyRate and numberOfClasses are valid numbers
    if (isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
      toast.error("Please enter a valid hourly rate");
      return false;
    }

    if (isNaN(Number(numberOfClasses)) || Number(numberOfClasses) <= 0) {
      toast.error("Please enter a valid number of classes");
      return false;
    }

    return true;
  }, [formState, student, enrollmentId]);

  const handleAddStudentToList = useCallback(() => {
    if (!validateEnrollmentForm()) return;

    const { hourlyRate, numberOfClasses } = formState;
    const hourlyRateNum = Number(hourlyRate);
    const numberOfClassesNum = Number(numberOfClasses);

    // Check if student already exists in enrollments
    const existingStudentIndex = studentEnrollments.findIndex(
      (item) => item.user_id === student?.id
    );

    if (existingStudentIndex === -1) {
      // New student entry - without studentName
      const newEnrollment: StudentEnrollment = {
        user_id: String(student?.id),
        enrollments: [
          {
            enrollmentName: `${enrollmentId?.subject?.name} | ${enrollmentId?.board?.name} | ${enrollmentId?.grade?.name}`,
            numberOfClasses: numberOfClassesNum,
            hourlyRate: hourlyRateNum,
            total: hourlyRateNum * numberOfClassesNum,
          },
        ],
      };

      setStudentEnrollments((prev) => [...prev, newEnrollment]);
    } else {
      // Add enrollment to existing student
      setStudentEnrollments((prev) => {
        const updated = [...prev];
        updated[existingStudentIndex].enrollments.push({
          enrollmentName: `${enrollmentId?.subject?.name} | ${enrollmentId?.board?.name} | ${enrollmentId?.grade?.name}`,
          numberOfClasses: numberOfClassesNum,
          hourlyRate: hourlyRateNum,
          total: hourlyRateNum * numberOfClassesNum,
        });
        return updated;
      });
    }

    // Reset form fields
    setEnrollmentId(null);
    handleFormChange("hourlyRate", "");
    handleFormChange("numberOfClasses", "");
  }, [
    formState,
    student,
    enrollmentId,
    validateEnrollmentForm,
    handleFormChange,
    studentEnrollments,
  ]);

  const handleDeleteItem = useCallback(
    (studentId: number, enrollmentIndex: number) => {
      setStudentEnrollments((prev) => {
        const updated = [...prev];
        const studentIndex = updated.findIndex(
          (item) => Number(item?.user_id) === studentId
        );

        if (studentIndex !== -1) {
          // If there's only one enrollment, remove the entire student entry
          if (updated[studentIndex].enrollments.length === 1) {
            return updated.filter((_, index) => index !== studentIndex);
          }

          // Otherwise, remove just the specific enrollment
          updated[studentIndex].enrollments = updated[
            studentIndex
          ].enrollments.filter((_, index) => index !== enrollmentIndex);
        }

        return updated;
      });
    },
    []
  );

  const validateFormSubmission = useCallback(() => {
    const { validFrom, validTill } = formState;

    if (studentEnrollments.length === 0) {
      toast.error("Please add at least one enrollment");
      return false;
    }

    // Validate date fields
    if (!validFrom || !validTill) {
      toast.error("Valid From and Valid Till dates are required");
      return false;
    }

    if (validFrom === validTill) {
      toast.error("Valid From and Valid Till dates cannot be the same");
      return false;
    }

    if (moment(validTill).isBefore(moment(validFrom))) {
      toast.error("Valid Till date cannot be before Valid From date");
      return false;
    }

    if (!parent) {
      toast.error("Please select a parent");
      return false;
    }

    return true;
  }, [formState, studentEnrollments, parent]);

  const handleFormSubmit = useCallback(() => {
    if (!validateFormSubmission()) return;

    const { validFrom, validTill } = formState;

    // Format dates
    const formattedValidFrom = moment(validFrom).format("YYYY-MM-DD");
    const formattedValidTill = moment(validTill).format("YYYY-MM-DD");
    const dueDate = moment(validFrom).add(7, "days").format("YYYY-MM-DD");

    // Calculate total amount for all enrollments
    const total = studentEnrollments?.reduce((acc, student) => {
      const studentTotal = student.enrollments.reduce(
        (sum, enrollment) => sum + enrollment.total,
        0
      );
      return acc + studentTotal;
    }, 0);

    // Prepare payload
    const payload = {
      dueDate: dueDate,
      parent_id: String(parent?.id),
      total: total,
      users: studentEnrollments,
    };

    // Call the handleAdd function passed as prop
    handleAdd?.(payload);
    console.log(payload);
  }, [
    formState,
    parent,
    handleAdd,
    studentEnrollments,
    validateFormSubmission,
  ]);

  // Reset all states when isSuccess is true
  useEffect(() => {
    if (success) {
      setStudent(null);
      setParent(null);
      setEnrollmentId(null);
      setStudentEnrollments([]);
      setFormState({
        hourlyRate: "",
        numberOfClasses: "",
        searchName: "",
        validFrom: null,
        validTill: null,
      });
    }
  }, [success]);

  // Get student name for display purposes
  const getStudentName = useCallback(
    (userId: number) => {
      if (!students?.users) return "";
      const studentData = students?.users?.find(
        (user: any) => user.id === userId
      );
      return studentData?.name || "";
    },
    [students]
  );

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
            <div className={classes.parentStudentBox}>
              <div className={classes.fields}>
                <Typography variant="body2">Select Parent</Typography>
                <DropDown
                  placeholder="Select parents"
                  data={filteredParents}
                  handleChange={handleParentChange}
                  value={parent ? JSON.stringify(parent) : ""}
                  inlineDropDownStyles={{
                    ...styles.inputDropdownStyles,
                    backgroundColor: "var(--white-color) !important",
                  }}
                  loading={getAllUserLoading}
                />
              </div>
              <div
                style={{ width: "calc(50% - 5px)" }}
                className={classes.fields}
              >
                <Typography variant="body2">Select Student</Typography>
                <DropDown
                  placeholder="Select student"
                  data={filteredStudents}
                  handleChange={handleStudentChange}
                  value={student ? JSON.stringify(student) : ""}
                  inlineDropDownStyles={{
                    ...styles.inputDropdownStyles,
                    backgroundColor: "var(--white-color) !important",
                  }}
                />
              </div>
            </div>
            <div className={classes.addBox}>
              <div className={classes.fields} style={{ width: "70%" }}>
                <Typography variant="body2">Enrollment</Typography>
                <DropDown
                  placeholder="Select enrollment"
                  data={stringifyEnrollmentData}
                  handleChange={handleEnrollmentChange}
                  handleOnInputChange={handleOnInputChange}
                  value={enrollmentId ? JSON.stringify(enrollmentId) : ""}
                  inlineDropDownStyles={{
                    ...styles.inputDropdownStyles,
                    backgroundColor: "var(--white-color) !important",
                  }}
                  loading={getAllEnrollmentsLoading}
                />
              </div>
              <div className={classes.fields} style={{ width: "14%" }}>
                <Typography variant="body2">Hourly Rate</Typography>
                <InputField
                  inputBoxStyles={{
                    ...styles.inputDropdownStyles,
                    background: "var(--white-color)",
                  }}
                  placeholder="Enter hourly rate"
                  value={formState.hourlyRate}
                  changeFunc={(e) =>
                    handleFormChange("hourlyRate", e.target.value)
                  }
                />
              </div>
              <div className={classes.fields} style={{ width: "14%" }}>
                <Typography variant="body2">No of Classes</Typography>
                <InputField
                  inputBoxStyles={{
                    ...styles.inputDropdownStyles,
                    background: "var(--white-color)",
                  }}
                  placeholder="Enter no of classes"
                  value={formState.numberOfClasses}
                  changeFunc={(e) =>
                    handleFormChange("numberOfClasses", e.target.value)
                  }
                />
              </div>
              <div className={classes.addButtonBox}>
                <span
                  className={classes.addButton}
                  onClick={handleAddStudentToList}
                >
                  <AddOutlinedIcon
                    sx={{
                      height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                      width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                    }}
                  />
                </span>
              </div>
            </div>
            <div className={classes.todoList}>
              <div className={classes.todoListHead}>
                {todoListHeadData?.map((item, index) => (
                  <p
                    key={index}
                    className={classes.todoListHeadColumn}
                    style={{ width: index === 0 ? "40%" : "20%" }}
                  >
                    {item}
                  </p>
                ))}
              </div>
              <div className={classes.todoBody}>
                {studentEnrollments.map((studentEnrollment) => (
                  <div
                    key={studentEnrollment?.user_id}
                    className={classes.todoListRow}
                  >
                    <p className={classes.todoListRowHeadColumn}>
                      {getStudentName(Number(studentEnrollment?.user_id))}
                    </p>
                    {studentEnrollment?.enrollments.map(
                      (enrollment, enrollmentIndex) => (
                        <div
                          key={enrollmentIndex}
                          className={classes.todoListEnrollmentRow}
                        >
                          <p
                            className={classes.todoListRowColumn}
                            style={{ width: "40%" }}
                          >
                            {enrollment?.enrollmentName}
                          </p>
                          <p className={classes.todoListRowColumn}>
                            {enrollment?.hourlyRate}
                          </p>
                          <p className={classes.todoListRowColumn}>
                            {enrollment?.numberOfClasses}
                          </p>
                          <p className={classes.todoListRowColumn}>
                            <span
                              className={classes.iconBox}
                              onClick={() =>
                                handleDeleteItem(
                                  Number(studentEnrollment?.user_id),
                                  enrollmentIndex
                                )
                              }
                            >
                              <Image
                                src="/assets/svgs/delete.svg"
                                alt="delete"
                                width={0}
                                height={0}
                                style={{
                                  width:
                                    "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                                  height:
                                    "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                                }}
                              />
                            </span>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={classes.fields}>
              <Typography variant="body2">Duration</Typography>
              <div className={classes.durationBox}>
                <DatePicker
                  width="100%"
                  height="5.5vh"
                  minHeight="45px"
                  maxHeight="50px"
                  value={formState.validFrom}
                  changeFn={(value) => handleDateChange("validFrom", value)}
                  background="#fff"
                  boxShadow="0px 1px 4px rgba(0, 0, 0, 0.08)"
                />
                <span className={classes.hyphen}>-</span>{" "}
                <DatePicker
                  width="100%"
                  height="5.5vh"
                  minHeight="45px"
                  maxHeight="50px"
                  value={formState.validTill}
                  changeFn={(value) => handleDateChange("validTill", value)}
                  background="#fff"
                  boxShadow="0px 1px 4px rgba(0, 0, 0, 0.08)"
                />
              </div>
            </div>
          </form>
          <Button
            inlineStyling={styles.buttonStyles}
            text="Add"
            clickFn={handleFormSubmit}
            loading={loading}
            disabled={loading || studentEnrollments.length === 0}
          />
        </div>
      </Box>
    </Modal>
  );
};

export default memo(ManualPaymentModal);

const styles = {
  buttonStyles: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    filter: "drop-shadow(1px 5px 10px rgba(56, 182, 255, 0.40))",
  },
  inputDropdownStyles: {
    width: "100%",
    boxShadow: "none",
    filter: "drop-shadow(0px 1px 4px rgba(0, 0, 0, 0.08))",
  },
};
