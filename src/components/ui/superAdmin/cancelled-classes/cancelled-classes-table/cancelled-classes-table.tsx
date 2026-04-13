import { CSSProperties } from "react";
import PaginationComponent from "@/components/global/pagination/pagination";
import classes from "./cancelled-classes-table.module.css";
import moment from "moment";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { ROLE_IDS } from "@/const/dashboard/role_ids_names";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Column {
  id: number;
  name: string;
  width: string;
}

interface CancelledClassesTableProps {
  data: any;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  inlineStyling?: CSSProperties;
}

// Table columns with widths
const TABLE_COLUMNS: Column[] = [
  { id: 1, name: "En_id", width: "4%" },
  { id: 2, name: "Tutor Profile", width: "14%" },
  { id: 3, name: "Student Profile", width: "14%" },
  { id: 4, name: "Subjects", width: "14%" },
  { id: 5, name: "Curriculum", width: "12%" },
  { id: 6, name: "Grade", width: "12%" },
  { id: 7, name: "Session at", width: "10%" },
  { id: 8, name: "Cancelled at", width: "10%" },
  { id: 9, name: "Cancelled by", width: "10%" },
];

export default function CancelledClassesTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  handleChangeRowsPerPage,
  handleChangePage,
  rowsPerPage,
  inlineStyling,
}: CancelledClassesTableProps) {
  const params = useParams();
  const { roleId } = useAppSelector((state) => state?.user?.user!);

  const isAdminRole =
    roleId === ROLE_IDS.ADMIN || roleId === ROLE_IDS.SUPER_ADMIN;

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
            const { createdAt, enrollment_reschedual, DateTime, cancelBy } =
              item;

            return (
              <div key={indx} className={classes.tableRow}>
                {/* ID */}
                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[0].width }}
                >
                  {enrollment_reschedual?.id || "Null"}
                </div>

                {/* Tutor Profile */}
                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[1].width }}
                >
                  <span className={classes.imageBox}>
                    <Image
                      src={
                        enrollment_reschedual?.tutor?.profileImageUrl ||
                        "/assets/images/demmyPic.png"
                      }
                      alt={enrollment_reschedual?.tutor?.name ?? "Tutor"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </span>
                  <p style={{ marginLeft: "5px", width: "80%" }}>
                    {enrollment_reschedual?.tutor?.name
                      ?.trim()
                      ?.split(" ")
                      ?.slice(0, 3)
                      ?.join(" ") || "No Show"}
                  </p>
                </div>

                {/* Student Profile */}
                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[2].width }}
                >
                  <div className={classes.studentsBox}>
                    <div className={classes.imagesBox}>
                      {enrollment_reschedual?.studentsGroups
                        ?.slice(0, 2)
                        .map((student: any, index: number) => (
                          <div className={classes.imageBox} key={index}>
                            <Image
                              src={
                                student?.user?.profileImageUrl ||
                                "/assets/images/demmyPic.png"
                              }
                              alt={student?.user?.name ?? "Student"}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        ))}
                    </div>
                    <p>
                      {enrollment_reschedual?.studentsGroups?.[0]?.user?.name
                        .trim()
                        .split(" ")
                        .slice(0, 2)
                        .join(" ") || "No Show"}
                      {enrollment_reschedual?.studentsGroups[1] &&
                        `, ${enrollment_reschedual?.studentsGroups[1]?.user?.name
                          .trim()
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")}`}
                    </p>
                    {enrollment_reschedual?.studentsGroups?.length > 2 && (
                      <p>
                        +{enrollment_reschedual?.studentsGroups.length - 2} more
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[3].width }}
                >
                  {enrollment_reschedual?.subject?.name || "No Show"}
                </div>

                {/* Curriculum */}
                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[4].width }}
                >
                  {enrollment_reschedual?.curriculum?.name || "No Show"}
                </div>

                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[5].width }}
                >
                  {enrollment_reschedual?.grade?.name || "No Show"}
                </div>

                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[6].width }}
                >
                  {DateTime
                    ? moment.utc(DateTime).local().format("DD-MMM-YYYY")
                    : "N/A"}
                  <br />
                  {DateTime
                    ? moment.utc(DateTime).local().format("hh:mm A")
                    : "N/A"}
                </div>

                {/* Date */}
                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[7].width }}
                >
                  {createdAt
                    ? moment.utc(createdAt).local().format("DD-MMM-YYYY")
                    : "N/A"}
                  <br />
                  {createdAt
                    ? moment.utc(createdAt).local().format("hh:mm A")
                    : "N/A"}
                </div>

                {/* Session Rate */}
                <div
                  className={classes.tableCell}
                  style={{ width: TABLE_COLUMNS[8].width }}
                >
                  {cancelBy || "N/A"}
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
