import { useMemo, useState, CSSProperties, useCallback } from "react";
import { useRouter } from "next/navigation";
import PaginationComponent from "@/components/global/pagination/pagination";
import classes from "./enrollment.module.css";
import moment from "moment";
import BasicSwitches from "@/components/global/toggle-button/toggle-button";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { ROLE_IDS } from "@/const/dashboard/role_ids_names";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Tooltip } from "@mui/material";
import { toast } from "react-toastify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { getTooltipStyles } from "@/components/global/tooltip/tooltip";
import defaultClasses from "@/styles/table-styles.module.css";

interface Column {
  id: number;
  name: string;
  width: string;
}
interface EnrollmentTablesProps {
  data: any;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  handleDeleteModal?: any;
  handleEditModal?: any;
  handleInstantClassModal?: any;
  handleExtraClassModal?: any;
  handleSwitch?: any;
  breakLoading?: boolean;
  inlineStyling?: CSSProperties;
}

const ADMIN_COLUMNS: Column[] = [
  { id: 0, name: "", width: "4%" },
  { id: 1, name: "En_id", width: "5%" },
  { id: 2, name: "Tutor Profile", width: "16%" },
  { id: 3, name: "Student Profile", width: "16%" },
  { id: 4, name: "Subjects", width: "15%" },
  { id: 5, name: "Date", width: "10%" },
  { id: 6, name: "Lead", width: "7%" },
  { id: 7, name: "Priority", width: "10%" },
  { id: 8, name: "Rate", width: "7%" },
  { id: 9, name: "On Break", width: "10%" },
];

const NON_ADMIN_COLUMNS: Column[] = [
  { id: 0, name: "En_id", width: "9%" },
  { id: 1, name: "Tutor Profile", width: "19%" },
  { id: 2, name: "Student Profile", width: "19%" },
  { id: 3, name: "Subjects", width: "14%" },
  { id: 4, name: "Curriculum", width: "17%" },
  { id: 5, name: "Date", width: "10%" },
  { id: 6, name: "Rate", width: "12%" },
];

const ADMIN_ROLES = new Set([
  "superAdmin",
  "admin",
  "counsellor",
  "hr",
  "manager",
]);

export default function EnrollmentTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  handleDeleteModal,
  handleEditModal,
  handleInstantClassModal,
  handleExtraClassModal,
  breakLoading,
  handleSwitch,
  inlineStyling,
}: EnrollmentTablesProps) {
  const params = useParams();
  const router = useRouter();
  const { role } = params;
  const { roleId } = useAppSelector((state) => state?.user?.user!);
  const isAdminRole = useMemo(() => ADMIN_ROLES.has(role as string), [role]);
  const headData = useMemo(() => {
    return isAdminRole ? ADMIN_COLUMNS : NON_ADMIN_COLUMNS;
  }, [isAdminRole]);
  const isRowClickable = useMemo(
    () =>
      role === "superAdmin" ||
      role === "admin" ||
      role === "counsellor" ||
      role === "hr",
    [role],
  );
  const canToggleBreak = useMemo(() => ADMIN_ROLES.has(role as string), [role]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleRoute = (id: number, event: React.MouseEvent) => {
    if (!isRowClickable) return;

    const targetPath = `/${role}/enrollment-details/${id}`;

    if (event.ctrlKey || event.metaKey) {
      window.open(targetPath, "_blank");
    } else {
      router.push(targetPath);
    }
  };

  const getRate = (item: any) => {
    if (roleId === ROLE_IDS.TEACHER) {
      return item.tutor_hourly_rate ?? "No Show";
    }
    return item.hourly_rate ?? "No Show";
  };

  const getColumnWidth = (columnName: string): string => {
    const column = headData.find((col) => col.name === columnName);
    return column?.width ?? "auto";
  };

  return (
    <div className={defaultClasses.tableContainer} style={inlineStyling}>
      <div className={defaultClasses.tableChild}>
        <div className={defaultClasses.tableHead}>
          {headData?.map((item: Column) => (
            <p
              className={defaultClasses.tableHeadCell}
              key={item.id}
              style={{ width: item.width }}
            >
              {item.name}
            </p>
          ))}
        </div>

        <div className={defaultClasses.tableBody}>
          {data?.map((item: any, indx: number) => {
            const {
              createdAt,
              id,
              tutor,
              studentsGroups,
              subject,
              curriculum,
              on_break,
              google_chat_space_id,
              google_chat_space_name,
              name,
              is_permanent,
            } = item;
            const isExpanded = expandedRow === id;
            return (
              <div key={indx} className={classes.collapsibleWrapper}>
                {/* Main Row */}
                <div
                  className={defaultClasses.tableRow}
                  onClick={
                    isRowClickable
                      ? (event) => handleRoute(id, event)
                      : undefined
                  }
                  style={{ cursor: isRowClickable ? "pointer" : "default" }}
                >
                  {/* Expand/Collapse Toggle */}
                  {isAdminRole && (
                    <div
                      className={defaultClasses.tableCell}
                      style={{
                        width: getColumnWidth(""),
                        maxWidth: getColumnWidth(""),
                        justifyContent: "center",
                      }}
                    >
                      <span
                        onClick={(e) => toggleRow(id, e)}
                        className={defaultClasses.iconBox}
                        style={{
                          padding: "3px",
                        }}
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
                  {/* ID */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{
                      width: getColumnWidth("En_id"),
                      maxWidth: getColumnWidth("En_id"),
                    }}
                  >
                    {id}
                  </div>
                  {/* Tutor Profile */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{ width: getColumnWidth("Tutor Profile") }}
                  >
                    <span className={classes.imageBox}>
                      <Image
                        src={
                          tutor?.profileImageUrl ||
                          "/assets/images/dummyPic.png"
                        }
                        alt={tutor?.name ?? "Tutor"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </span>
                    <p style={{ marginLeft: "5px", width: "80%" }}>
                      {tutor?.name
                        ?.trim()
                        ?.split(" ")
                        ?.slice(0, 3)
                        ?.join(" ") || "No Show"}
                    </p>
                  </div>
                  {/* Student Profile */}
                  <div
                    className={defaultClasses.tableCell}
                    style={{ width: getColumnWidth("Student Profile") }}
                  >
                    <div className={classes.studentsBox}>
                      <div className={classes.imagesBox}>
                        {studentsGroups
                          ?.slice(0, 2)
                          .map((student: any, index: number) => (
                            <div className={classes.imageBox} key={index}>
                              <Image
                                src={
                                  student?.user?.profileImageUrl ||
                                  "/assets/images/dummyPic.png"
                                }
                                alt={student?.user?.name ?? "Student"}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          ))}
                      </div>
                      <p>
                        {studentsGroups?.[0]?.user?.name
                          .trim()
                          .split(" ")
                          .slice(0, 2)
                          .join(" ") || "No Show"}
                        {studentsGroups?.[1] &&
                          `, ${studentsGroups[1].user.name
                            .trim()
                            .split(" ")
                            .slice(0, 2)
                            .join(" ")}`}
                      </p>
                      {studentsGroups?.length > 2 && (
                        <p>+{studentsGroups.length - 2} more</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{
                      width: getColumnWidth("Subjects"),
                      maxWidth: getColumnWidth("Subjects"),
                    }}
                  >
                    {subject?.name
                      ? (() => {
                          const words = subject.name.split(" ");
                          return words.length > 3
                            ? `${words.slice(0, 3).join(" ")}...`
                            : subject.name;
                        })()
                      : "No Show"}
                  </p>

                  {(role === "student" || role === "teacher") && (
                    <p
                      className={defaultClasses.tableCell}
                      style={{
                        width: getColumnWidth("Curriculum"),
                        maxWidth: getColumnWidth("Curriculum"),
                      }}
                    >
                      {curriculum?.name
                        ? (() => {
                            const words = curriculum.name.split(" ");
                            return words.length > 3
                              ? `${words.slice(0, 3).join(" ")}...`
                              : curriculum.name;
                          })()
                        : "No Show"}
                    </p>
                  )}

                  {/* Date */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: getColumnWidth("Date") }}
                  >
                    {createdAt
                      ? moment.utc(createdAt).local().format("DD-MMM-YYYY")
                      : "N/A"}
                  </p>

                  {/* Lead - Only for Admin Roles */}
                  {isAdminRole && (
                    <p
                      className={defaultClasses.tableCell}
                      style={{ width: getColumnWidth("Lead") }}
                    >
                      {item?.lead_generator || "N/A"}
                    </p>
                  )}

                  {/* Priority - Only for Admin Roles */}
                  {isAdminRole && (
                    <p
                      className={defaultClasses.tableCell}
                      style={{ width: getColumnWidth("Priority") }}
                    >
                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "5px",
                          color:
                            item?.priority === "Low"
                              ? "var(--green-text-color3)"
                              : item?.priority === "Moderate"
                                ? "var(--orange-text-color1)"
                                : item?.priority === "High"
                                  ? "var(--red-text-color1)"
                                  : "",
                          backgroundColor:
                            item?.priority === "Low"
                              ? "var(--green-background-color4)"
                              : item?.priority === "Moderate"
                                ? "var(--orange-background-color1)"
                                : item?.priority === "High"
                                  ? "var(--red-background-color2)"
                                  : "",
                        }}
                      >
                        {item?.priority || "N/A"}
                      </span>
                    </p>
                  )}

                  {/* Session Rate */}
                  <p
                    className={defaultClasses.tableCell}
                    style={{ width: getColumnWidth("Rate") }}
                  >
                    AED {getRate(item)}
                  </p>
                  {/* Curriculum */}
                  {role !== "student" && role !== "teacher" && (
                    <p
                      className={defaultClasses.tableCell}
                      style={{
                        width: getColumnWidth("On Break"),
                        maxWidth: getColumnWidth("On Break"),
                      }}
                    >
                      <BasicSwitches
                        background={is_permanent === true ? "red" : undefined}
                        value={on_break}
                        handleToggle={
                          canToggleBreak && !is_permanent
                            ? (e: any) =>
                                handleSwitch(e, {
                                  id: id || null,
                                  name: name || "",
                                  on_break: on_break,
                                  is_permanent: is_permanent,
                                })
                            : undefined
                        }
                      />
                    </p>
                  )}
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className={classes.collapseWrapper}>
                    <div
                      style={{
                        width: headData[0].width,
                        maxWidth: headData[0].width,
                      }}
                    ></div>
                    {isAdminRole && (
                      <div className={classes.detailItem}>
                        {/* Break Switch - Only for Admin Roles */}
                        <span className={classes.detailLabel}>Curriculum</span>
                        <div className={classes.detailValue}>
                          {" "}
                          {curriculum?.name
                            ? (() => {
                                const words = curriculum.name.split(" ");
                                return words.length > 3
                                  ? `${words.slice(0, 3).join(" ")}...`
                                  : curriculum.name;
                              })()
                            : "No Show"}
                        </div>
                      </div>
                    )}
                    {isAdminRole && (
                      <div className={classes.detailItem}>
                        <span className={classes.detailLabel}>Actions</span>
                        <div className={classes.detailValue}>
                          <span className={classes.iconsContainer}>
                            <Tooltip
                              title="Copy Chat Link"
                              arrow
                              slotProps={getTooltipStyles()}
                            >
                              <span className={defaultClasses.iconBox}>
                                <ContentCopyIcon
                                  sx={{
                                    color: "var(--pure-black-color)",
                                    fontSize: "var(--regular16-)",
                                  }}
                                  onClick={(e: any) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      `https://mail.google.com/chat/u/0/#chat/space/${google_chat_space_id}` ||
                                        "",
                                    );
                                    toast.success(
                                      "Google chat link copied to clipboard!",
                                    );
                                  }}
                                />
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={"Start an instant class"}
                              arrow
                              slotProps={getTooltipStyles()}
                            >
                              <span
                                className={defaultClasses.iconBox}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInstantClassModal(e, item);
                                }}
                              >
                                <Image
                                  src="/assets/svgs/setting.svg"
                                  alt="instant class"
                                  width={0}
                                  height={0}
                                  style={{
                                    width: "var(--regular16-)",
                                    height: "var(--regular16-)",
                                  }}
                                />
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={"Edit Enrollment"}
                              arrow
                              slotProps={getTooltipStyles()}
                            >
                              <span
                                className={defaultClasses.iconBox}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditModal(e, item);
                                }}
                              >
                                <Image
                                  src="/assets/svgs/edit.svg"
                                  alt="edit"
                                  width={0}
                                  height={0}
                                  style={{
                                    width: "var(--regular16-)",
                                    height: "var(--regular16-)",
                                  }}
                                />
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={"Delete Enrollment"}
                              arrow
                              slotProps={getTooltipStyles()}
                            >
                              <span
                                className={defaultClasses.iconBox}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteModal(e, id);
                                }}
                              >
                                <Image
                                  src="/assets/svgs/delete.svg"
                                  alt="delete"
                                  width={0}
                                  height={0}
                                  style={{
                                    width: "var(--regular16-)",
                                    height: "var(--regular16-)",
                                  }}
                                />
                              </span>
                            </Tooltip>

                            <Tooltip
                              title={"Add Extra Class"}
                              arrow
                              slotProps={getTooltipStyles()}
                            >
                              <span
                                className={defaultClasses.iconBox}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExtraClassModal(e, item);
                                }}
                              >
                                <AddOutlinedIcon
                                  sx={{
                                    color: "var(--pure-black-color)",
                                    fontSize: "var(--regular16-)",
                                  }}
                                />
                              </span>
                            </Tooltip>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={totalCount || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200, 300]}
        inlineStyles={{
          padding: "5px 10px",
          borderTop: "1px solid var(--color-dashboard-border)",
        }}
      />
    </div>
  );
}
