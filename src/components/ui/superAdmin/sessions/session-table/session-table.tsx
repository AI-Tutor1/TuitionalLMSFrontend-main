import { memo, useMemo, useState, useCallback } from "react";
import moment from "moment";
import Image from "next/image";
import { useRouter } from "next/navigation";
import classes from "./session-table.module.css";
import defaultClasses from "@/styles/table-styles.module.css";
import PaginationComponent from "@/components/global/pagination/pagination";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { MinutesToHours } from "@/utils/helpers/convert-minutes-to-hours";
import {
  getConclusionTypeStyles,
  getTagTypeStyles,
} from "@/utils/helpers/sessionType-styles";
import { useParams } from "next/navigation";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import { Tooltip, Checkbox } from "@mui/material";
import { getTooltipStyles } from "@/components/global/tooltip/tooltip";
import EmergencyRecordingRoundedIcon from "@mui/icons-material/EmergencyRecordingRounded";
import StudentDisplay from "@/components/ui/superAdmin/student-profile/student-profile";
import TutorDisplay from "@/components/ui/superAdmin/teacher-profile/teacher-profile";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface Column {
  id: number;
  name: string;
  width: string;
}

interface ColumnWidths {
  adminRole: Column[];
  nonAdminRole: Column[];
}

interface SessionTablesProps {
  data: any[];
  currentPage: number;
  totalPages: number;
  totalSessions: number;
  rowsPerPage: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  handleDeleteModal?: any;
  handleReload?: any;
  handleReloadLoading?: boolean;
  inlineStyling?: any;
  sessionsMonthlyTagData?: {
    Conducted?: number;
    Cancelled?: number;
    TeacherAbsent?: number;
    StudentAbsent?: number;
    NoShow?: number;
    totalConductedHours?: number;
    totalConductedDuration?: number;
  };
  sessionsMonthlyTagDataLoading?: boolean;
  handleTeacherDurationUpdateModal?: (data: {
    session_id: number;
    tutor_class_time: number | string;
  }) => void;
}

const iconProps = {
  width: 0,
  height: 0,
  style: {
    width: "var(--regular14-)",
    height: "var(--regular14-)",
  },
} as const;

const columnWidths: ColumnWidths = {
  adminRole: [
    { id: 0, name: "", width: "3%" },
    { id: 1, name: "En_id", width: "5%" },
    { id: 2, name: "Tutor Profile", width: "15%" },
    { id: 3, name: "Student Profile", width: "15%" },
    { id: 4, name: "Subjects", width: "12%" },
    { id: 5, name: "Date Added", width: "11%" },
    { id: 6, name: "Duration", width: "6%" },
    { id: 7, name: "Student Duration", width: "11%" },
    { id: 8, name: "Teacher Duration", width: "11%" },
    { id: 9, name: "Type", width: "11%" },
  ],
  nonAdminRole: [
    { id: 0, name: "Tutor Profile", width: "15%" },
    { id: 1, name: "Student Profile", width: "15%" },
    { id: 2, name: "Subjects", width: "14%" },
    { id: 3, name: "Date Added", width: "13%" },
    { id: 4, name: "Duration", width: "10%" },
    { id: 5, name: "Student Duration", width: "11%" },
    { id: 6, name: "Teacher Duration", width: "11%" },
    { id: 7, name: "Type", width: "11%" },
  ],
};

function SessionTable({
  data,
  currentPage,
  totalPages,
  totalSessions,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleDeleteModal,
  handleReload,
  handleReloadLoading,
  inlineStyling,
  sessionsMonthlyTagData,
  sessionsMonthlyTagDataLoading,
  handleTeacherDurationUpdateModal,
}: SessionTablesProps) {
  const router = useRouter();
  const params = useParams();
  const { role } = params;
  const [refreshId, setRefreshId] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const headData = useMemo(
    () =>
      columnWidths[
        role === "teacher" || role === "student" ? "nonAdminRole" : "adminRole"
      ],
    [role],
  );

  const isAdminRole = useMemo(
    () =>
      role === "superAdmin" ||
      role === "admin" ||
      role === "manager" ||
      role === "counsellor" ||
      role === "hr",
    [role],
  );

  const canManageSession = useMemo(
    () => role === "superAdmin" || role === "admin" || role === "manager",
    [role],
  );

  const handleRoute = useCallback(
    (id: number, event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        window.open(`/${role}/session-details/${id}`, "_blank");
      } else {
        router.push(`/${role}/session-details/${id}`);
      }
    },
    [router, role],
  );

  const toggleRow = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleReloadClick = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      setRefreshId(id);
      handleReload?.(e, id);
    },
    [handleReload],
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, id: number) => {
      e.stopPropagation();
      setRefreshId(id);
      handleDeleteModal?.(e, id);
    },
    [handleDeleteModal],
  );

  const countItems = useMemo(
    () => [
      {
        label: "Conducted",
        count: sessionsMonthlyTagData?.Conducted,
        color: "var(--green-text-color4)",
        background: "var(--green-background-color4)",
      },
      {
        label: "Cancelled",
        count: sessionsMonthlyTagData?.Cancelled,
        color: "var(--red-text-color1)",
        background: "var(--red-background-color2)",
      },
      {
        label: "Teacher Absent",
        count: sessionsMonthlyTagData?.TeacherAbsent,
        color: "var(--purple-text-color1)",
        background: "var(--purple-background-color1)",
      },
      {
        label: "Student Absent",
        count: sessionsMonthlyTagData?.StudentAbsent,
        color: "var(--blue-text-color1)",
        background: "var(--blue-background-color1)",
      },
      {
        label: "No Show",
        count: sessionsMonthlyTagData?.NoShow,
        color: "var(--orange-text-color1)",
        background: "var(--orange-background-color1)",
      },
      {
        label: "Duration",
        count: sessionsMonthlyTagData?.totalConductedHours?.toFixed(2),
        color: "var(--green-text-color1)",
        background: "var(--green-background-color1)",
      },
      {
        label: "Student Duration",
        count: sessionsMonthlyTagData?.totalConductedDuration?.toFixed(2),
        color: "var(--green-text-color1)",
        background: "var(--green-background-color1)",
      },
    ],
    [sessionsMonthlyTagData],
  );

  return (
    <div className={defaultClasses.tableContainer} style={inlineStyling}>
      <div className={defaultClasses.tableChild}>
        <div className={defaultClasses.tableHead}>
          {headData?.map((item) => (
            <p
              className={defaultClasses.tableHeadCell}
              key={item.id}
              style={{ width: item.width }}
            >
              {item?.name}
            </p>
          ))}
        </div>
        <div className={defaultClasses.tableBody}>
          {data?.map((item: any, indx: number) => {
            const isExpanded = expandedRow === item?.id;
            return (
              <div key={indx} className={classes.collapsibleWrapper}>
                {/* Main Row */}
                <div
                  className={defaultClasses.tableRow}
                  onClick={
                    isAdminRole
                      ? (event) => handleRoute(item?.id, event)
                      : undefined
                  }
                  style={{
                    cursor: isAdminRole ? "pointer" : "default",
                  }}
                >
                  {/* Expand/Collapse Toggle - Admin Only */}
                  {isAdminRole && (
                    <div
                      className={defaultClasses.tableCell}
                      style={{
                        width: headData[0].width,
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className={defaultClasses.iconBox}
                        style={{
                          padding: "3px",
                        }}
                        onClick={(e) => toggleRow(item?.id, e)}
                      >
                        {isExpanded ? (
                          <KeyboardArrowUpIcon
                            sx={{
                              fontSize: "var(--regular16-)",
                              color: "var(--pure-black-color)",
                            }}
                          />
                        ) : (
                          <KeyboardArrowDownIcon
                            sx={{
                              fontSize: "var(--regular16-)",
                              color: "var(--pure-black-color)",
                            }}
                          />
                        )}
                      </span>
                    </div>
                  )}

                  {/* En_id - Admin Only */}
                  {isAdminRole && (
                    <p
                      className={defaultClasses.tableCell}
                      style={{ width: headData[1].width }}
                    >
                      {item?.sessionEnrollment?.id}
                    </p>
                  )}

                  {/* Tutor Profile */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{
                      width: headData[isAdminRole ? 2 : 0].width,
                      gap: "5px",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <TutorDisplay tutor={item?.tutor} />
                    <span style={getTagTypeStyles(item?.tag)}>{item?.tag}</span>
                  </div>

                  {/* Student Profile */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{
                      width: headData[isAdminRole ? 3 : 1].width,
                    }}
                  >
                    <StudentDisplay
                      studentsArray={
                        item?.ClassSchedule?.enrollment?.studentsGroups ||
                        item?.students ||
                        item?.ClassSchedule ||
                        []
                      }
                    />
                  </div>

                  {/* Subjects */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{
                      width: headData[isAdminRole ? 4 : 2].width,
                    }}
                  >
                    <p className={defaultClasses.ellipsisCol}>
                      {item?.ClassSchedule?.enrollment?.subject?.name ||
                        item?.sessionEnrollment?.subject?.name ||
                        "No Show"}
                    </p>
                  </div>

                  {/* Date Added */}
                  <div
                    className={`${defaultClasses.tableCell} ${classes.cellDateColumn}`}
                    style={{ width: headData[isAdminRole ? 5 : 3].width }}
                  >
                    <span>
                      {moment
                        .utc(item?.created_at)
                        .local()
                        .format("Do-MMM-YYYY") || "No Show"}
                    </span>
                    <span>
                      {moment.utc(item?.created_at).local().format("h:mm a") ||
                        "No Show"}
                    </span>
                  </div>

                  {/* Duration */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{
                      width: headData[isAdminRole ? 6 : 4].width,
                    }}
                  >
                    {MinutesToHours(item?.duration) || "No Show"}
                  </p>

                  {/* Student Duration */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{
                      width: headData[isAdminRole ? 7 : 5].width,
                    }}
                  >
                    {item?.groupSessionTime && item?.groupSessionTime.length > 0
                      ? item.groupSessionTime.map(
                          (session: any, index: number) => (
                            <span key={index}>
                              {MinutesToHours(session.class_duration_time)}
                              {item.groupSessionTime.length > 1 &&
                                index === 0 && <span>,&nbsp;</span>}
                            </span>
                          ),
                        )
                      : "-"}
                  </p>

                  {/* Teacher Duration */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{
                      width: headData[isAdminRole ? 8 : 6].width,
                      justifyContent: "space-between",
                      padding: "10px 20px 7.5px 10px",
                    }}
                  >
                    {item?.conclusion_type === "No Show"
                      ? "-"
                      : MinutesToHours(item?.tutor_class_time) || "-"}
                    {canManageSession && (
                      <>
                        &nbsp;
                        <Tooltip
                          title="Update Teacher Duration"
                          arrow
                          slotProps={getTooltipStyles()}
                        >
                          <span
                            className={defaultClasses.iconBox}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTeacherDurationUpdateModal?.({
                                session_id: item.id || 0,
                                tutor_class_time: item?.tutor_class_time
                                  ? MinutesToHours(item?.tutor_class_time)
                                  : "-",
                              });
                            }}
                          >
                            <UpgradeIcon
                              sx={{
                                color: "var(--pure-black-color)",
                                fontSize: "var(--regular14-)",
                              }}
                            />
                          </span>
                        </Tooltip>
                      </>
                    )}
                  </div>

                  {/* Type */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{
                      width: headData[isAdminRole ? 9 : 7].width,
                    }}
                  >
                    <span
                      style={getConclusionTypeStyles(item?.conclusion_type)}
                    >
                      {item?.conclusion_type || "-"}
                    </span>
                  </div>
                </div>
                {/* Collapsible Content - Outside the main row */}
                {isExpanded && isAdminRole && (
                  <div
                    className={`${classes.collapsibleContent} ${classes.collapsibleContentExpanded}`}
                  >
                    <div className={classes.collapseWrapper}>
                      {/* Spacer for toggle column */}
                      <div
                        style={{
                          width: headData[0].width,
                          maxWidth: headData[0].width,
                        }}
                      ></div>

                      {/* Review Status */}
                      <div className={classes.detailItem}>
                        <span className={classes.detailLabel}>
                          Review Status
                        </span>
                        <div className={classes.detailValue}>
                          <Checkbox
                            checked={
                              item?.is_reviewed !== "Pending" &&
                              item?.is_reviewed !== ""
                            }
                            sx={{
                              padding: "4px",
                              "& .MuiSvgIcon-root": {
                                fontSize: "var(--regular18-)",
                                borderRadius: "50%",
                              },
                              "&.Mui-checked": {
                                color:
                                  item?.is_reviewed === "Admin"
                                    ? "var(--main-blue-color)"
                                    : item?.is_reviewed === "Manager"
                                      ? "var(--main-blue-color)"
                                      : item?.is_reviewed === "Both"
                                        ? "var(--green-text-color4)"
                                        : "var(--main-blue-color)",
                              },
                              "& .MuiCheckbox-root": {
                                borderRadius: "50%",
                              },
                            }}
                            icon={
                              <span
                                style={{
                                  width: "var(--regular18-)",
                                  height: "var(--regular18-)",
                                  borderRadius: "50%",
                                  border: "2px solid var(--black-color)",
                                  display: "inline-block",
                                }}
                              />
                            }
                            checkedIcon={
                              <span
                                style={{
                                  width: "var(--regular18-)",
                                  height: "var(--regular18-)",
                                  borderRadius: "50%",
                                  border: `2px solid ${
                                    item?.is_reviewed === "Admin"
                                      ? "var(--main-blue-color)"
                                      : item?.is_reviewed === "Manager"
                                        ? "var(--main-blue-color)"
                                        : item?.is_reviewed === "Both"
                                          ? "var(--green-text-color4)"
                                          : "var(--main-blue-color)"
                                  }`,
                                  backgroundColor:
                                    item?.is_reviewed === "Admin"
                                      ? "var(--main-blue-color)"
                                      : item?.is_reviewed === "Manager"
                                        ? "var(--main-blue-color)"
                                        : item?.is_reviewed === "Both"
                                          ? "var(--green-text-color4)"
                                          : "var(--main-blue-color)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontSize: "var(--regular18-)",
                                }}
                              >
                                ✓
                              </span>
                            }
                          />
                          <span style={{ marginLeft: "8px" }}>
                            {item?.is_reviewed || "Pending"}
                          </span>
                        </div>
                      </div>
                      {/* Actions - Only for roles that can manage */}
                      {canManageSession && (
                        <div className={classes.detailItem}>
                          <span className={classes.detailLabel}>Actions</span>
                          <div className={classes.detailValue}>
                            <span className={classes.iconsContainer}>
                              {handleReloadLoading && refreshId === item?.id ? (
                                <LoadingBox
                                  loaderStyling={{
                                    width: "var(--regular14-) !important",
                                    height: "var(--regular14-) !important",
                                  }}
                                />
                              ) : (
                                <Tooltip
                                  title="Reload Session"
                                  slotProps={getTooltipStyles()}
                                  arrow
                                >
                                  <span
                                    className={defaultClasses.iconBox}
                                    onClick={(e) =>
                                      handleReloadClick(e, item?.id)
                                    }
                                  >
                                    <Image
                                      src="/assets/svgs/reload.svg"
                                      alt="reload"
                                      {...iconProps}
                                    />
                                  </span>
                                </Tooltip>
                              )}

                              <Tooltip
                                title="Delete Session"
                                arrow
                                slotProps={getTooltipStyles()}
                              >
                                <span
                                  className={defaultClasses.iconBox}
                                  onClick={(e) =>
                                    handleDeleteClick(e, item?.id)
                                  }
                                >
                                  <Image
                                    src="/assets/svgs/delete.svg"
                                    alt="delete"
                                    {...iconProps}
                                  />
                                </span>
                              </Tooltip>

                              {item?.meet_recording ? (
                                <Tooltip
                                  title="Session Recording"
                                  arrow
                                  slotProps={getTooltipStyles()}
                                >
                                  <span
                                    className={defaultClasses.iconBox}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.open(
                                        JSON.parse(item?.meet_recording)[0],
                                        "_blank",
                                      );
                                    }}
                                  >
                                    <EmergencyRecordingRoundedIcon
                                      sx={{
                                        fontSize: "var(--regular14-)",
                                        color: "var(--pure-black-color)",
                                      }}
                                    />
                                  </span>
                                </Tooltip>
                              ) : (
                                <span>-</span>
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className={classes.countBox}>
        {countItems?.map((item, index) => (
          <div
            key={index}
            className={classes.countItem}
            style={{ backgroundColor: item.background, color: item?.color }}
          >
            <div className={classes.countLabel}>
              {item.label}:{" "}
              {sessionsMonthlyTagDataLoading ? (
                <LoadingBox
                  inlineStyling={{
                    height: "max-content",
                    width: "max-content",
                  }}
                  loaderStyling={{
                    height: "var(--regular14-) !important",
                    width: "var(--regular14-) !important",
                    color: `${item?.color}`,
                  }}
                />
              ) : (
                <strong>{item.count || 0}</strong>
              )}
            </div>
          </div>
        ))}
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        totalEntries={totalSessions || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[15, 30, 50]}
        inlineStyles={{
          padding: "5px 10px",
          borderTop: "1px solid var(--color-dashboard-border)",
        }}
      />
    </div>
  );
}

export default memo(SessionTable);
