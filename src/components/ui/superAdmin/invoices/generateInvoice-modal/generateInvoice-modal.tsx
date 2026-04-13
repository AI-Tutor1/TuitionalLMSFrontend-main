import React, { useState, memo, useCallback, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import classes from "./generateInvoice-modalmodal.module.css";
import Button from "@/components/global/button/button";
import InputField from "@/components/global/input-field/input-field";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import { toast } from "react-toastify";
import { getAllEnrollments } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import moment from "moment";
import DatePicker from "@/components/global/date-picker/date-picker";
import Image from "next/image";

interface BasicModalProps {
  modalOpen: boolean;
  handleClose: any;
  heading: string;
  subHeading?: string;
  handleAdd?: (data: any) => void;
  loading?: boolean | any;
  success?: any;
}

const todoListHeadData = ["Enrollment", "Hourly rate", "Classes", "Action"];

const GenerateInvoiceModal: React.FC<BasicModalProps> = ({
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
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [lmsFees, setLmsFees] = useState<string>("");
  const [student, setstudent] = useState<any>(null);
  const [enrollmentId, setEnrollmentId] = useState<any>(null);
  const [numberOfClasses, setnumberOfClasses] = useState<string>("");
  const [validFrom, setValidFrom] = useState<string | null>(null);
  const [validTill, setValidTill] = useState<string | null>(null);
  const [studentList, setStudentList] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["enrollments", "for-invoice-gen", student],
    queryFn: () =>
      getAllEnrollments(
        {
          name: student?.name || "",
          on_break: "",
          is_permanent: "",
        },
        {
          token,
        },
      ),
    enabled: !!token && !!student,
  });

  const stringifyEnrollmentData = useMemo(() => {
    return data?.data?.map((item: any) => JSON.stringify(item));
  }, [data]);

  const filteredStudents = useMemo(() => {
    return students?.users?.map((item: any) => JSON.stringify(item)) || [];
  }, [students]);

  const handleStudentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedStudent: any = JSON.parse(e.target.value);
      setstudent(selectedStudent);
    },
    [],
  );

  const handleEnrollmentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedEnrollment: any = JSON.parse(e.target.value);

      setEnrollmentId(selectedEnrollment);
      setHourlyRate(selectedEnrollment?.hourly_rate);
    },
    [],
  );

  const handleValidFromChange = useCallback(
    (value: string | null | undefined) => {
      if (!value) {
        setValidFrom(null);
        return;
      }
      setValidFrom(value);
    },
    [],
  );

  const handleValidTillChange = useCallback(
    (value: string | null | undefined) => {
      if (!value) {
        setValidTill(null);
        return;
      }

      const newValidTill = moment(value);
      const validFromMoment = moment(validFrom);

      if (validFromMoment.isAfter(newValidTill)) {
        toast.error("Valid Till date cannot be before Valid From date.");
        return;
      }

      if (validFromMoment.isSame(newValidTill)) {
        toast.error("Valid Till date cannot be the same as Valid From date.");
        return;
      }

      setValidTill(value);
    },
    [validFrom],
  );

  const handleAddStudentToList = useCallback(() => {
    // Validate required fields
    if (!hourlyRate || !student || !enrollmentId || !numberOfClasses) {
      toast.error("All fields are required");
      return;
    }
    // // Create a new student object
    const newStudent = {
      id: student?.id,
      hourlyRate: Number(hourlyRate),
      enrollmentName: `${enrollmentId?.subject?.name} | ${enrollmentId?.board?.name} | ${enrollmentId?.grade?.name}`,
      numberOfClasses: Number(numberOfClasses),
      total: Number(hourlyRate) * Number(numberOfClasses),
    };

    // // Add the new student to the list
    setStudentList((prev) => [...prev, newStudent]);
    // // Clear the form fields
    setLmsFees("");
    setHourlyRate("");
    setEnrollmentId(null);
    setnumberOfClasses("");
  }, [hourlyRate, student, enrollmentId, numberOfClasses]);

  const handleDeleteItem = useCallback(
    (enrollmentName: number, hourlyRate: number, numberOfClasses: number) => {
      const filteredList = studentList.filter(
        (item) =>
          item.enrollmentName !== enrollmentName ||
          item.hourlyRate !== hourlyRate ||
          item.numberOfClasses !== numberOfClasses,
      );
      setStudentList(filteredList);
    },
    [studentList],
  );

  const handleFormSubmit = useCallback(() => {
    const isSameStudent = studentList.every(
      (item) => item.id === studentList[0]?.id,
    );

    if (!isSameStudent) {
      toast.error("Invoice can be generated for one student at a time.");
      return;
    }

    // Calculate the total amount
    const total = studentList.reduce((acc, item) => {
      const subtotal = item.hourlyRate * item.numberOfClasses;
      return acc + subtotal;
    }, 0);

    if (lmsFees !== "" && lmsFees !== null && lmsFees !== undefined) {
      const lmsFeesNumber = Number(lmsFees);
      if (isNaN(lmsFeesNumber)) {
        toast.error("Please enter a valid LMS fee amount");
        return;
      }
      if (lmsFeesNumber < 0) {
        toast.error("LMS fee amount cannot be negative");
        return;
      }
    }

    // Validate date fields
    if (!validFrom || !validTill) {
      toast.error("Valid From and Valid Till dates are required");
      return;
    }

    if (validFrom === validTill) {
      toast.error("Valid From and Valid Till dates cannot be the same");
      return;
    }

    if (moment(validTill).isBefore(moment(validFrom))) {
      toast.error("Valid Till date cannot be before Valid From date");
      return;
    }

    // Format dates
    const formattedValidFrom = moment(validFrom).format("YYYY-MM-DD");
    const formattedValidTill = moment(validTill).format("YYYY-MM-DD");
    const dueDate = moment(validFrom).add(7, "days").format("YYYY-MM-DD");

    // Prepare payload
    const payload = {
      dueDate,
      user_id: student?.id,
      startDate: formattedValidFrom,
      endDate: formattedValidTill,
      total,
      lms_fee: Number(lmsFees),
      enrollment: studentList?.map(({ id, ...rest }) => rest),
    };

    // console.log("Payload:", payload);
    handleAdd?.(payload);
  }, [studentList, validFrom, validTill, student, handleAdd]);

  // Reset all states when isSuccess is true
  useEffect(() => {
    if (success) {
      setstudent(null);
      setStudentList([]);
      setValidFrom(null);
      setValidTill(null);
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
        <div className={classes.headingBox}>
          {heading && (
            <p>{heading.endsWith("s") ? heading.slice(0, -1) : heading}</p>
          )}
          {subHeading && <p>{subHeading}</p>}
        </div>
        <div className={classes.section2}>
          <form className={classes.contentBox}>
            <div className={classes.fields}>
              <Typography variant="body2">Select Student</Typography>
              <DropDown
                placeholder="Select student"
                data={filteredStudents}
                handleChange={handleStudentChange}
                value={student ? JSON.stringify(student) : ""}
                inlineDropDownStyles={styles?.fieldStyles}
              />
            </div>
            <div className={classes.addBox}>
              <div className={classes.fields}>
                <Typography variant="body2">Enrollment</Typography>
                <DropDown
                  placeholder="Select enrollment"
                  data={stringifyEnrollmentData || []}
                  handleChange={handleEnrollmentChange}
                  value={enrollmentId ? JSON.stringify(enrollmentId) : ""}
                  inlineDropDownStyles={styles?.fieldStyles}
                  loading={isLoading}
                />
              </div>
              <div className={classes.fields} style={{ width: "14%" }}>
                <Typography variant="body2">Hourly Rate</Typography>
                <InputField
                  inputBoxStyles={styles?.fieldStyles}
                  placeholder="Hourly rate"
                  value={hourlyRate || ""}
                  changeFunc={(e) => setHourlyRate(e.target.value)}
                />
              </div>
              <div className={classes.fields} style={{ width: "14%" }}>
                <Typography variant="body2">No of Classes</Typography>
                <InputField
                  inputBoxStyles={styles?.fieldStyles}
                  placeholder="No of classes"
                  value={numberOfClasses}
                  changeFunc={(e) => setnumberOfClasses(e.target.value)}
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
                    style={{ width: index === 0 ? "35%" : "20%" }}
                  >
                    {item}
                  </p>
                ))}
              </div>
              <div className={classes.todoBody}>
                {studentList?.map((item, index) => (
                  <div key={index} className={classes.todoListRow}>
                    <p
                      className={classes.todoListRowColumn}
                      style={{ width: "35%" }}
                    >
                      {item?.enrollmentName}
                    </p>
                    <p className={classes.todoListRowColumn}>
                      {item?.hourlyRate}
                    </p>
                    <p className={classes.todoListRowColumn}>
                      {item?.numberOfClasses}
                    </p>
                    <p className={classes.todoListRowColumn}>
                      <span
                        className={classes.iconBox}
                        onClick={(e) =>
                          handleDeleteItem(
                            item?.enrollmentName,
                            item?.hourlyRate,
                            item?.numberOfClasses,
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
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <div className={classes.fields}>
                <Typography variant="body2">LMS Fees</Typography>
                <InputField
                  inputBoxStyles={styles?.fieldStyles}
                  placeholder="LMS fees"
                  value={lmsFees || ""}
                  changeFunc={(e) => setLmsFees(e.target.value)}
                />
              </div>
              <div className={classes.fields}>
                <Typography variant="body2">Duration</Typography>
                <div className={classes.durationBox}>
                  <DatePicker
                    width="100%"
                    height="5.5vh"
                    minHeight="40px"
                    value={validFrom}
                    changeFn={handleValidFromChange}
                    background={styles?.fieldStyles?.background}
                    boxShadow={styles?.fieldStyles?.boxShadow}
                  />
                  <span className={classes.hyphen}>-</span>
                  <DatePicker
                    width="100%"
                    height="5.5vh"
                    minHeight="40px"
                    value={validTill}
                    changeFn={handleValidTillChange}
                    background={styles?.fieldStyles?.background}
                    boxShadow={styles?.fieldStyles?.boxShadow}
                  />
                </div>
              </div>
            </div>
          </form>
          <Button
            inlineStyling={{
              ...styles?.buttonStyles,
              width: styles?.fieldStyles?.width,
            }}
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

export default memo(GenerateInvoiceModal);

const styles = {
  buttonStyles: {
    position: "relative",
    zIndex: 2,
    maxHeight: "50px",
  },
  fieldStyles: {
    width: "100%",
    background: "var(--main-white-color) !important",
    boxShadow: "var(--main-inner-boxShadow-color) !important",
  },
};
