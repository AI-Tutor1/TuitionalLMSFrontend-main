import { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import PaginationComponent from "@/components/global/pagination/pagination";
import classes from "./enrollment-logs-table.module.css";
import moment from "moment";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { ROLE_IDS } from "@/const/dashboard/role_ids_names";
import { useParams } from "next/navigation";
import Image from "next/image";
import BasicSwitches from "@/components/global/toggle-button/toggle-button";

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
  inlineStyling?: CSSProperties;
}

// Admin columns with widths
const TABLE_COLUMNS: Column[] = [
  { id: 1, name: "En_id", width: "5%" },
  { id: 2, name: "Tutor Profile", width: "15%" },
  { id: 3, name: "Student Profile", width: "15%" },
  { id: 4, name: "Subjects", width: "14%" },
  { id: 5, name: "Paused at", width: "10%" },
  { id: 6, name: "Paused from", width: "10%" },
  { id: 7, name: "Paused till", width: "10%" },
  { id: 8, name: "Break", width: "9%" },
  { id: 9, name: "Paused by", width: "12%" },
];

export default function EnrollmentTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  inlineStyling,
}: EnrollmentTablesProps) {
  const params = useParams();
  const router = useRouter();
  const { role } = params;
  const { roleId } = useAppSelector((state) => state?.user?.user!);

  const isAdminRole =
    roleId === ROLE_IDS.ADMIN || roleId === ROLE_IDS.SUPER_ADMIN;

  const isRowClickable = true;

  const getColumnWidth = (columnName: string): string => {
    return (
      TABLE_COLUMNS.find((col) => col.name === columnName)?.width || "auto"
    );
  };

  const handleRoute = (id: number, event: React.MouseEvent) => {
    if (!isRowClickable) return;
    const targetPath = `/${role}/enrollment-details/${id}`;
    if (event.ctrlKey || event.metaKey) {
      window.open(targetPath, "_blank");
    } else {
      router.push(targetPath);
    }
  };

  return (
    <div className={classes.table} style={inlineStyling}>
      <div className={classes.tableChild}>
        <div className={classes.tableHead}>
          {TABLE_COLUMNS?.map((item: Column) => (
            <div
              className={classes.tableHeadCell}
              key={item.id}
              style={{
                width: item.width,
              }}
            >
              {item.name}
            </div>
          ))}
        </div>

        <div className={classes.tableBody}>
          {data?.map((item: any, indx: number) => {
            const { enrollment, actor } = item;

            return (
              <div
                key={indx}
                className={classes.tableRow}
                onClick={(event) => handleRoute(item?.enrollment_id, event)}
                style={{ cursor: isRowClickable ? "pointer" : "default" }}
              >
                {/* ID */}
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("En_id") }}
                >
                  {enrollment?.id}
                </div>

                {/* Tutor Profile */}
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Tutor Profile") }}
                >
                  <span className={classes.imageBox}>
                    <Image
                      src={
                        enrollment?.tutor?.profileImageUrl ||
                        "/assets/images/dummyPic.png"
                      }
                      alt={enrollment?.tutor?.name ?? "Tutor"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </span>
                  <p style={{ marginLeft: "5px", width: "80%" }}>
                    {enrollment?.tutor?.name
                      ?.trim()
                      ?.split(" ")
                      ?.slice(0, 3)
                      ?.join(" ") || "No Show"}
                  </p>
                </div>

                {/* Student Profile */}
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Student Profile") }}
                >
                  <div className={classes.studentsBox}>
                    <div className={classes.imagesBox}>
                      {enrollment?.studentsGroups
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
                      {enrollment?.studentsGroups?.[0]?.user?.name
                        .trim()
                        .split(" ")
                        .slice(0, 2)
                        .join(" ") || "No Show"}
                      {enrollment?.studentsGroups?.[1] &&
                        `, ${enrollment?.studentsGroups?.[1]?.user?.name
                          .trim()
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")}`}
                    </p>
                    {enrollment?.studentsGroups?.length > 2 && (
                      <p>+{enrollment?.studentsGroups?.length - 2} more</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Subjects") }}
                >
                  {enrollment?.subject?.name || "No Show"}
                </div>

                {/* Created Date */}
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Paused at") }}
                >
                  {enrollment?.createdAt
                    ? moment
                        .utc(enrollment?.createdAt)
                        .local()
                        .format("DD-MMM-YYYY")
                    : "N/A"}
                </div>

                {/* Pause Satrt at Date */}
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Paused from") }}
                >
                  {enrollment?.pause_starts_at
                    ? moment
                        .utc(enrollment?.pause_starts_at)
                        .local()
                        .format("DD-MMM-YYYY")
                    : "N/A"}
                </div>

                {/* Pause ends at Date */}
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Paused till") }}
                >
                  {enrollment?.pause_ends_at
                    ? moment
                        .utc(enrollment?.pause_ends_at)
                        .local()
                        .format("DD-MMM-YYYY")
                    : "N/A"}
                </div>
                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Break") }}
                >
                  <BasicSwitches
                    background={
                      enrollment?.is_permanent === true ? "red" : undefined
                    }
                    value={enrollment?.on_break}
                  />
                </div>

                <div
                  className={classes.tableCell}
                  style={{ width: getColumnWidth("Paused by") }}
                >
                  {actor?.name || "N/A"}
                </div>
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
