import { useState, memo, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Onboarding_Requests_Parsed,
  JsonData,
} from "@/services/dashboard/superAdmin/tutor-request/tutor-request.types";
import PaginationComponent from "@/components/global/pagination/pagination";
import classes from "./tutorRequest-table.module.css";
import moment from "moment";
import { useParams } from "next/navigation";

const dummyPic = "/assets/images/dummyPic.png";

const headData: { id: number; name: string; width: string }[] = [
  { id: 1, name: "Profile", width: "15%" },
  { id: 2, name: "Email Address", width: "23%" },
  { id: 3, name: "Country", width: "15%" },
  { id: 4, name: "Subjects", width: "41%" },
  { id: 5, name: "Date", width: "11%" },
  { id: 6, name: "Status", width: "10%" },
];

interface CustomizedTablesProps {
  data: any;
  inlineStyling?: React.CSSProperties;
}

const TutorRequestTable = ({ data, inlineStyling }: CustomizedTablesProps) => {
  const router = useRouter();
  const { role } = useParams();

  // Combine `page` and `paginatedUsers` in a single state
  const [pagination, setPagination] = useState({
    page: 1,
    rowsPerPage: 10,
  });

  const handleUser = useCallback(
    (id: number, event: React.MouseEvent) => {
      const targetPath = `/${role}/tutor-profile/${id}`;
      if (event.ctrlKey || event.metaKey) {
        window.open(targetPath, "_blank");
      } else {
        router.push(targetPath);
      }
    },
    [router, role],
  );

  const handleChangePage = useCallback(
    (event: React.ChangeEvent<unknown>, newPage: number) => {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
    },
    [],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setPagination({
        page: 1,
        rowsPerPage: parseInt(event.target.value, 10),
      });
    },
    [],
  );

  // Memoize paginated data to only recalculate when dependencies change
  const paginatedUsers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.rowsPerPage;
    const endIndex = startIndex + pagination.rowsPerPage;
    return data?.slice(startIndex, endIndex) || [];
  }, [data, pagination.page, pagination.rowsPerPage]);

  return (
    <div className={classes.table} style={inlineStyling}>
      <div className={classes.tableChild}>
        <div className={classes.tableHead}>
          {headData?.map((item) => (
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
          {paginatedUsers?.map((item: Onboarding_Requests_Parsed) => {
            const userData: JsonData = item?.parsed_jsonData;
            return (
              <div
                key={item.id}
                className={classes.tableRow}
                onClick={(event) => handleUser(item.id, event)}
              >
                <div
                  className={classes.tableCell}
                  style={{
                    width: headData[0]?.width,
                    // maxWidth: "200px",
                  }}
                >
                  <span className={classes.imageBox}>
                    <Image
                      src={userData?.profileImage || dummyPic}
                      alt={`${userData?.firstName} ${userData?.lastName}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </span>
                  <span
                    style={{ marginLeft: "10px", width: "70%" }}
                  >{`${userData?.firstName
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")}`}</span>
                </div>
                <div
                  className={`${classes.tableCell} ${classes.emailCell}`}
                  style={{ width: headData[1]?.width }}
                >
                  {userData?.email}
                </div>
                <div
                  className={classes.tableCell}
                  style={{ width: headData[2]?.width }}
                >
                  {userData.country}
                </div>
                <div
                  className={classes.tableCell}
                  style={{
                    width: headData[3]?.width,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {userData?.subjects?.map((subject: any, index: number) => (
                    <span key={index}>{subject?.name},</span>
                  ))}
                </div>
                <div
                  className={classes.tableCell}
                  style={{ width: headData[4]?.width }}
                >
                  {item?.createdAt
                    ? moment.utc(item?.createdAt).local().format("Do-MMM-YYYY")
                    : "N/A"}
                </div>
                <div
                  className={classes.tableCell}
                  style={{ width: headData[5]?.width }}
                >
                  <div
                    style={{
                      width: "max-content",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      color:
                        item?.status === "Pending"
                          ? "var(--orange-text-color1)"
                          : item?.status === "Approved"
                            ? "var(--green-text-color4)"
                            : "var(--red-color)",
                      backgroundColor:
                        item?.status === "Pending"
                          ? "var(--orange-background-color1)"
                          : item?.status === "Approved"
                            ? "var(--green-background-color4)"
                            : "var(--red-background-color1)",
                    }}
                  >
                    {item?.status || "Rejected"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <PaginationComponent
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        totalEntries={(data?.length as number) || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[10, 15, 20]}
        inlineStyles={{
          padding: "5px 10px",
          borderTop: "1px solid var(--color-dashboard-border)",
        }}
      />
    </div>
  );
};

export default memo(TutorRequestTable);
