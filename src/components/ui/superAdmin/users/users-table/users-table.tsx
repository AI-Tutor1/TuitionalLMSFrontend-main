import { memo, useCallback, useState, useMemo, CSSProperties } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User_Object_Type } from "@/services/dashboard/superAdmin/uers/users.type";
import PaginationComponent from "@/components/global/pagination/pagination";
import moment from "moment";
import classes from "./user-table.module.css";
import { useParams } from "next/navigation";
import { Tooltip } from "@mui/material";
import defaultClasses from "@/styles/table-styles.module.css";
import TeacherProfile from "@/components/ui/superAdmin/teacher-profile/teacher-profile";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface UsersTablesProps {
  data?: User_Object_Type[];
  handleDeactivateModal: any;
  handleDeleteModal: any;
  handleEditModal?: any;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  inlineStyling?: CSSProperties;
}

interface Column {
  id: number;
  name: string;
  width: string;
}

const iconProps = {
  width: 0,
  height: 0,
  style: {
    width: "var(--regular16-)",
    height: "var(--regular16-)",
  },
} as const;

const headData: Column[] = [
  { id: 0, name: "", width: "4%" },
  { id: 1, name: "User_id", width: "7%" },
  { id: 2, name: "Profile", width: "25%" },
  { id: 3, name: "User Type", width: "12%" },
  { id: 4, name: "Email Address", width: "20%" },
  { id: 5, name: "Created At", width: "13%" },
  { id: 6, name: "Status", width: "8%" },
  { id: 7, name: "Is_synced", width: "12%" },
];

const UsersTable = memo(function UsersTable({
  currentPage,
  totalPages,
  totalCount,
  data,
  handleDeactivateModal,
  handleDeleteModal,
  handleEditModal,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  inlineStyling,
}: UsersTablesProps) {
  const { role } = useParams();
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const canDelete = useMemo(
    () => role === "superAdmin" || role === "manager",
    [role],
  );

  const toggleRow = useCallback((id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleRoute = useCallback(
    (id: number, roleId: number, event: React.MouseEvent) => {
      event.stopPropagation();
      const targetPath = `/${role}/counselling/${id}?roleId=${roleId}`;
      if (event.ctrlKey || event.metaKey) {
        window.open(targetPath, "_blank");
      } else {
        router.push(targetPath);
      }
    },
    [router, role],
  );

  return (
    <>
      <div className={defaultClasses.tableContainer} style={inlineStyling}>
        <div className={defaultClasses.tableChild}>
          <div className={defaultClasses.tableHead}>
            {headData?.map((item: Column) => (
              <p
                className={defaultClasses.tableHeadCell}
                key={item.id}
                style={{
                  width: item.width,
                }}
              >
                {item.name}
              </p>
            ))}
          </div>

          <div className={defaultClasses.tableBody}>
            {data?.map((item: User_Object_Type) => {
              const {
                id,
                profileImageUrl,
                name,
                roleId,
                email,
                status,
                createdAt,
                isSync,
                pseudo_name,
              } = item;

              const isExpanded = expandedRow === id;

              return (
                <div key={id} className={classes.collapsibleWrapper}>
                  {/* Main Row */}
                  <div className={defaultClasses.tableRow}>
                    {/* Expand/Collapse Toggle */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{
                        width: headData[0]?.width,
                        justifyContent: "center",
                      }}
                    >
                      <span
                        className={defaultClasses.iconBox}
                        onClick={(e) => toggleRow(id, e)}
                        style={{
                          padding: "3px",
                        }}
                      >
                        {isExpanded ? (
                          <KeyboardArrowUpIcon
                            sx={{
                              fontSize: "var(--regular18-)",
                              color: "var(--pure-black-color)",
                            }}
                          />
                        ) : (
                          <KeyboardArrowDownIcon
                            sx={{
                              fontSize: "var(--regular18-)",
                              color: "var(--pure-black-color)",
                            }}
                          />
                        )}
                      </span>
                    </div>

                    {/* User ID */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{ width: headData[1]?.width }}
                    >
                      {id}
                    </div>

                    {/* Profile */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{
                        width: headData[2]?.width,
                        maxWidth: headData[2]?.width,
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "6px",
                      }}
                    >
                      <TeacherProfile tutor={{ name, profileImageUrl }} />
                      <p
                        className={`${defaultClasses.ellipsisCol} ${classes.seudoNameClass}`}
                      >{`${pseudo_name}`}</p>
                    </div>

                    {/* User Type */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{ width: headData[3]?.width }}
                    >
                      <p className={classes.roleBadge} data-role-id={roleId}>
                        {item?.role?.name}
                      </p>
                    </div>

                    {/* Email Address */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{ width: headData[4]?.width }}
                    >
                      <p className={defaultClasses.ellipsisCol}>{email}</p>
                    </div>

                    {/* Created At */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{ width: headData[5]?.width }}
                    >
                      {item?.createdAt
                        ? moment.utc(createdAt).local().format("Do-MMM-YYYY")
                        : "N/A"}
                    </div>

                    {/* Status */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{ width: headData[6]?.width }}
                    >
                      <p className={classes.statusDot} data-status={status}></p>
                    </div>

                    {/* Is Synced */}
                    <div
                      className={defaultClasses.tableCell}
                      style={{ width: headData[7]?.width }}
                    >
                      <p className={classes.syncBadge} data-synced={isSync}>
                        {isSync ? "Synced" : "Not Synced"}
                      </p>
                    </div>
                  </div>
                  {/* Collapsible Content - Outside the main row */}
                  {isExpanded && (
                    <div className={classes.collapseWrapper}>
                      {/* Spacer for toggle column */}
                      <div
                        style={{
                          width: headData[0].width,
                          maxWidth: headData[0].width,
                        }}
                      ></div>
                      {/* Actions */}
                      <div className={classes.detailItem}>
                        <span className={classes.detailLabel}>Actions</span>
                        <div className={classes.detailValue}>
                          <span className={classes.iconsContainer}>
                            <Tooltip
                              title={"Activate/Deactivate"}
                              placement="bottom"
                              arrow
                            >
                              <span
                                className={defaultClasses.iconBox}
                                onClick={(e: any) =>
                                  handleDeactivateModal(e, item)
                                }
                              >
                                <Image
                                  src="/assets/svgs/active1.svg"
                                  alt="active"
                                  {...iconProps}
                                />
                              </span>
                            </Tooltip>

                            <Tooltip title={"Update"} placement="bottom" arrow>
                              <span
                                className={defaultClasses.iconBox}
                                onClick={(e: any) => handleEditModal(e, item)}
                              >
                                <Image
                                  src="/assets/svgs/edit.svg"
                                  alt="edit"
                                  {...iconProps}
                                />
                              </span>
                            </Tooltip>

                            {canDelete && (
                              <Tooltip
                                title={"Delete"}
                                placement="bottom"
                                arrow
                              >
                                <span
                                  className={defaultClasses.iconBox}
                                  onClick={(e: any) => handleDeleteModal(e, id)}
                                >
                                  <Image
                                    src="/assets/svgs/delete.svg"
                                    alt="delete"
                                    {...iconProps}
                                  />
                                </span>
                              </Tooltip>
                            )}

                            <Tooltip
                              title={`Navigate to Counselling`}
                              placement="bottom"
                              arrow
                            >
                              <span
                                className={defaultClasses.iconBox}
                                onClick={(event) =>
                                  handleRoute(id, roleId, event)
                                }
                              >
                                <Image
                                  src="/assets/svgs/counselling.svg"
                                  alt="counselling"
                                  {...iconProps}
                                />
                              </span>
                            </Tooltip>
                          </span>
                        </div>
                      </div>
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
          dropDownValues={[50, 100, 200]}
          inlineStyles={{
            padding: "5px 10px",
            borderTop: "1px solid var(--color-dashboard-border)",
          }}
        />
      </div>
    </>
  );
});

export default UsersTable;
