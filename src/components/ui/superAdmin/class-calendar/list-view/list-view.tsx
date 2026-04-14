import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import PaginationComponent from "@/components/global/pagination/pagination";
import ErrorBox from "@/components/global/error-box/error-box";
import classes from "./listView.module.css";
import moment from "moment";
import enrollment from "@/screens/student-teacher-dashboard/components/enrollment/enrollment";

interface Column {
  id: number;
  name: string;
  width: string;
}

interface HandleNormalSlotProps {
  open: boolean;
  day: string;
  startTime: string;
  endTime: string;
  ids: number[];
  enrollment_id: number | null;
}

interface ClassCalenderViewProps {
  events: any[];
  handleCancelledSchedulledSlot?: (data: { id: number; open: boolean }) => void;
  handleNormalSlot?: (data: HandleNormalSlotProps) => void;
  role?: string;
  externalPagination?: {
    currentPage: number;
    rowsPerPage: number;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
  };
}

interface TeacherSchedule {
  start_time: string;
  session_duration: number;
}

interface Enrollment {
  id: number;
  on_break?: boolean;
  subject?: {
    name: string;
  };
  tutor?: {
    name: string;
    profileImageUrl: string;
  };
  students?: {
    name: string;
    profileImageUrl: string;
  }[];
}

interface SlotData {
  id: number;
  class_status?: "CANCELLED" | "SCHEDULED" | "OTHER_STATUS";
  enrollment?: Enrollment;
  teacherSchedule?: TeacherSchedule;
  DateTime?: string;
  duration?: number;
}

interface Event {
  id: number;
  slotData: SlotData;
  title?: string;
  status?: boolean | string;
  start: Date;
  end: Date;
  duration?: number;
}

const ListView = ({
  events,
  handleCancelledSchedulledSlot,
  handleNormalSlot,
  role,
  externalPagination,
}: ClassCalenderViewProps) => {
  // Column headers data - adjusted widths to accommodate Enroll ID
  const headData = [
    { id: 0, width: "6%", name: "Enroll Id" },
    { id: 1, width: "12%", name: "Slot Type" },
    { id: 2, width: "15%", name: "Tutor Profile" },
    { id: 3, width: "19%", name: "Student Profile" },
    { id: 4, width: "12%", name: "Date" },
    { id: 5, width: "9%", name: "Start Time" },
    { id: 6, width: "9%", name: "End Time" },
    { id: 7, width: "8%", name: "Duration" },
    { id: 8, width: "10%", name: "Status" },
  ];

  // Internal pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Use external pagination if provided, otherwise use internal state
  const page = externalPagination?.currentPage ?? currentPage;
  const itemsPerPage = externalPagination?.rowsPerPage ?? rowsPerPage;

  // Calculate pagination values
  const totalCount = events?.length || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Paginate the events
  const paginatedEvents = useMemo(() => {
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return events?.slice(startIndex, endIndex) || [];
  }, [events, page, itemsPerPage]);

  // Pagination handlers
  const handleChangePage = useCallback(
    (event: React.ChangeEvent<unknown>, newPage: number) => {
      if (externalPagination?.onPageChange) {
        externalPagination.onPageChange(newPage);
      } else {
        setCurrentPage(newPage);
      }
    },
    [externalPagination]
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newRowsPerPage = parseInt(event.target.value, 10);
      if (externalPagination?.onRowsPerPageChange) {
        externalPagination.onRowsPerPageChange(newRowsPerPage);
      } else {
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(0);
      }
    },
    [externalPagination]
  );

  const handleEventClick = useCallback(
    (e: Event) => {
      const isCancelledOrScheduled =
        e?.slotData?.class_status === "CANCELLED" ||
        e?.slotData?.class_status === "SCHEDULED";

      if (isCancelledOrScheduled && handleCancelledSchedulledSlot) {
        handleCancelledSchedulledSlot({
          id: e.id,
          open: true,
        });
      } else if (handleNormalSlot) {
        handleNormalSlot({
          open: true,
          day: moment(e.start).format("dddd"),
          startTime: moment(e.start).format("hh:mmA"),
          endTime: moment(e.end).format("hh:mmA"),
          ids: [e.id],
          enrollment_id: e?.slotData?.enrollment?.id ?? null,
        });
      }
    },
    [handleCancelledSchedulledSlot, handleNormalSlot]
  );

  // Reset to first page if events change
  useEffect(() => {
    if (!externalPagination) {
      setCurrentPage(0);
    }
  }, [events, externalPagination]);

  // Table styles
  const tableStyles = {
    display: "block !important",
    flex: "0 1 calc(100% - 10px)",
    minHeight: "0",
    background: "transparent !important",
    position: "relative !important",
    border: "none !important",
    userSelect: "none !important",
    overflowY: "auto !important",
    overflowX: "hidden !important",
    padding: "5px 10px !important",
    "&::-webkit-scrollbar": {
      width: "5px !important",
      margin: "12px !important",
      position: "relative !important",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
      display: "none",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#9c9c9c",
      borderRadius: "6px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "#555",
      cursor: "pointer",
    },
  };

  const tableBodyStyles = {
    display: "block !important",
    borderRadius: "10px",
    border: "1px solid #d4d4d4",
    position: "relative",
    height: "100%",
  };

  // Show empty state if no events
  if (!events || events.length === 0) {
    return (
      <div className={classes.tableBox}>
        {/* Table Header */}
        <div className={classes.tableHead}>
          {headData?.map((item: Column) => (
            <div
              className={classes.tableHeadCell}
              key={item.id}
              style={{ width: item.width }}
            >
              {item.name}
            </div>
          ))}
        </div>
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#666",
            border: "1px solid #d4d4d4",
            borderRadius: "10px",
            marginTop: "10px",
          }}
        >
          No events to display
        </div>
      </div>
    );
  }

  return (
    <div className={classes.tableBox}>
      {/* Table Header */}
      <div className={classes.tableHead}>
        {headData?.map((item: Column) => (
          <div
            className={classes.tableHeadCell}
            key={item.id}
            style={{ width: item.width }}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* Conditional rendering outside of table */}
      {paginatedEvents.length === 0 ? (
        <ErrorBox />
      ) : (
        /* Table Body */
        <Table sx={tableStyles}>
          <TableBody sx={tableBodyStyles} className={classes.tableBody}>
            {paginatedEvents.map((event: any, index: number) => {
              const { slotData, start, end, type, status } = event;

              // Status checks
              const isInactive = status === false || status === "CANCELLED";
              const isScheduled = status === "SCHEDULED";
              const isOnBreak = slotData?.enrollment?.on_break === true;

              // Row styles based on status
              const rowStyles = {
                backgroundColor: isInactive
                  ? "#FECDCD"
                  : isScheduled
                  ? "#DAFFF0"
                  : "var(--light-blue)",
                ...(isOnBreak || isInactive
                  ? {
                      opacity: 0.7,
                      filter: "blur(0.5px)",
                      backdropFilter: "blur(2px)",
                    }
                  : {}),
              };

              // Formatted dates
              const formattedDate = moment(start).format("Do-MMM-YYYY");
              const formattedStartTime = moment(start).format("hh:mm A");
              const formattedEndTime = moment(end).format("hh:mm A");

              // Tutor data
              const tutorName = slotData?.enrollment?.tutor?.name || "No Show";
              const tutorImageUrl =
                slotData?.enrollment?.tutor?.profileImageUrl ||
                "/assets/images/dummyPic.png";

              // Student data
              const studentsGroups = slotData?.enrollment?.studentsGroups || [];
              const students = slotData?.enrollment?.students || [];
              const allStudents = [...studentsGroups, ...students];
              const displayStudents = allStudents.slice(0, 2);
              const firstName =
                studentsGroups[0]?.user?.name || students[0]?.name || "No Show";
              const secondName =
                studentsGroups[1]?.user?.name || students[1]?.name;
              const totalStudentCount = allStudents.length;
              const hasMoreStudents = allStudents.length > 2;

              return (
                <TableRow
                  key={`${page}-${index}`}
                  sx={{
                    ...rowStyles,
                    "&:hover": {
                      opacity: 0.9,
                    },
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  {/* Enroll Id - Column 0 */}
                  <TableCell align="left" width={headData[0].width}>
                    {slotData?.enrollment?.id || "N/A"}
                  </TableCell>

                  {/* Slot Type - Column 1 */}
                  <TableCell align="left" width={headData[1].width}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor:
                          type === "extra slot" && isInactive
                            ? "#FFF3E0"
                            : type == "extra slot"
                            ? "#E8F5E8"
                            : "rgba(227, 242, 253, 0.8)",
                        color:
                          type === "extra slot" && isInactive
                            ? "#E65100"
                            : type === "extra slot"
                            ? "#2E7D32"
                            : "var(--main-color)",
                        fontFamily: "var(--leagueSpartan-medium-500)",
                        fontSize: "var(--medium-text-size-vh)",
                        textTransform: "capitalize",
                        opacity: isOnBreak || isInactive ? 0.5 : 1,
                      }}
                    >
                      {type || "Normal Slot"}
                    </span>
                    {isInactive && (
                      <span
                        style={{
                          marginLeft: "5px",
                          color: "#FF0000",
                          fontFamily: "var(--leagueSpartan-medium-500)",
                          fontSize: "var(--medium-text-size-vh)",
                        }}
                      >
                        (Cancelled)
                      </span>
                    )}
                  </TableCell>

                  {/* Tutor Profile - Column 2 */}
                  <TableCell align="left" width={headData[2].width}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span
                        className={classes.imageBox}
                        style={{ opacity: isOnBreak || isInactive ? 0.6 : 1 }}
                      >
                        <Image
                          src={tutorImageUrl}
                          alt={tutorName}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </span>
                      <p
                        style={{
                          marginLeft: "10px",
                          width: "80%",
                          fontWeight: isScheduled ? 500 : 400,
                        }}
                      >
                        {tutorName}
                      </p>
                    </div>
                  </TableCell>

                  {/* Student Profile - Column 3 */}
                  <TableCell align="left" width={headData[3].width}>
                    <span className={classes.studentsBox}>
                      <span
                        className={classes.imagesBox}
                        style={{ opacity: isOnBreak || isInactive ? 0.6 : 1 }}
                      >
                        {displayStudents.map(
                          (student: any, studentIndex: number) => (
                            <div
                              className={classes.imageBox}
                              key={studentIndex}
                            >
                              <Image
                                src={
                                  student?.user?.profileImageUrl ||
                                  student?.profileImageUrl ||
                                  "/assets/images/dummyPic.png"
                                }
                                alt={
                                  student?.user?.name ||
                                  student?.name ||
                                  "Student"
                                }
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          )
                        )}
                      </span>
                      <p
                        style={{
                          fontWeight: isScheduled ? 500 : 400,
                        }}
                      >
                        {firstName}
                        {secondName && `, ${secondName}`}
                      </p>
                      {hasMoreStudents && (
                        <p style={{ fontSize: "12px" }}>
                          +{totalStudentCount - 2} more
                        </p>
                      )}
                    </span>
                  </TableCell>

                  {/* Date - Column 4 */}
                  <TableCell
                    align="left"
                    width={headData[4].width}
                    sx={{
                      fontWeight: isScheduled ? 500 : 400,
                    }}
                  >
                    {formattedDate}
                  </TableCell>

                  {/* Start Time - Column 5 */}
                  <TableCell
                    align="left"
                    width={headData[5].width}
                    sx={{
                      fontWeight: isScheduled ? 500 : 400,
                    }}
                  >
                    {formattedStartTime}
                  </TableCell>

                  {/* End Time - Column 6 */}
                  <TableCell
                    align="left"
                    width={headData[6].width}
                    sx={{
                      fontWeight: isScheduled ? 500 : 400,
                    }}
                  >
                    {formattedEndTime}
                  </TableCell>

                  {/* Duration - Column 7 */}
                  <TableCell width={headData[7].width}>
                    {slotData?.teacherSchedule?.session_duration ||
                      slotData?.duration}{" "}
                    min
                  </TableCell>

                  {/* Status - Column 8 */}
                  <TableCell align="center" width={headData[8].width}>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        background: isOnBreak ? "#FFF3E0" : "#E8F5E8",
                        color: isOnBreak ? "#E65100" : "#2E7D32",
                        fontFamily: "var(--leagueSpartan-medium-500)",
                        fontSize: "var(--medium-text-size-vh)",
                      }}
                    >
                      {isOnBreak ? "On break" : "On going"}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      <PaginationComponent
        totalPages={totalPages}
        page={page}
        rowsPerPage={itemsPerPage}
        totalEntries={totalCount}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[25, 50, 75, 100]}
      />
    </div>
  );
};

export default ListView;
