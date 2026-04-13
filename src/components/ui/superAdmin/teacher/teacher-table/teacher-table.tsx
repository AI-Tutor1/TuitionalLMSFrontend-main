import { useState, useEffect, memo } from "react";
import Image from "next/image";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/navigation";
import { Teacher_Data } from "@/services/dashboard/superAdmin/teacher/teacher.types";
import PaginationComponent from "@/components/global/pagination/pagination";
import moment from "moment";
import styles from "./teacher.module.css";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";

interface TeacherTablesProps {
  data?: Teacher_Data[];
  handleDeletemodal?: any;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  isLoading?: boolean;
}

const headData: { id: number; name: string; width: string }[] = [
  { id: 1, name: "Profile", width: "20%" },
  { id: 2, name: "Email Address", width: "25%" },
  { id: 3, name: "Country", width: "20%" },
  { id: 4, name: "Status", width: "15%" },
  { id: 5, name: "Date", width: "20%" },
  { id: 6, name: "Actions", width: "15%" },
];
function TeacherTable({
  currentPage,
  totalPages,
  totalCount,
  data,
  handleDeletemodal,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  isLoading,
}: TeacherTablesProps) {
  // console.log("table");
  const router = useRouter();

  return (
    <>
      <div className={styles.tableBox}>
        <div className={styles.tableHead}>
          {headData.map((item) => (
            <div
              className={styles.tableHeadCell}
              key={item.id}
              style={{ width: `${item.width}` }}
            >
              {item.name}
            </div>
          ))}
        </div>

        {isLoading ? (
          <LoadingBox />
        ) : !data || data.length === 0 ? (
          <ErrorBox />
        ) : (
          <Table
            sx={{
              display: "block !important",
              height: "82% !important",
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
            }}
          >
            <TableBody
              sx={{
                display: "block !important",
                borderRadius: "10px",
                border: "1px solid #d4d4d4",
                position: "relative",
              }}
              className={styles.tableBody}
            >
              {data?.map((item: Teacher_Data) => {
                const {
                  id,
                  profileImageUrl,
                  name,
                  email,
                  country,
                  createdAt,
                  status,
                } = item;

                return (
                  <TableRow key={id}>
                    <TableCell width={"20%"}>
                      <div className={styles.imageBox}>
                        <Image
                          src={
                            profileImageUrl ||
                            "/assets/images/static/demmyPin.png"
                          }
                          alt={name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <p
                        style={{
                          marginLeft: "20px",
                          width: "70%",
                          //   border: "1px solid red",
                        }}
                      >{`${name}`}</p>
                    </TableCell>

                    <TableCell className={styles.emailCell} width={"25%"}>
                      {email}
                    </TableCell>
                    <TableCell width={"20%"}>{country || "No Show"}</TableCell>
                    <TableCell width={"15%"}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "55%",
                          padding: "5px 10px",
                          borderRadius: "5px",
                          color: "var(--white-color)",
                          backgroundColor:
                            status === true ? " #31A759" : "#D32121",
                        }}
                      >
                        {status === true ? "Activate" : "Deactivate"}
                      </div>
                    </TableCell>
                    <TableCell width={"20%"}>
                      {createdAt
                        ? moment.utc(createdAt).local().format("DD MMM YYYY")
                        : "N/A"}
                    </TableCell>
                    <TableCell width={"15%"}>
                      <div className={styles.iconsContainer}>
                        <span className={styles.iconBox}>
                          <Image
                            src="/assets/svg/edit.svg"
                            alt="edit"
                            width={0}
                            height={0}
                            style={{
                              width: "var(--normal-text-size)",
                              height: "var(--normal-text-size)",
                            }}
                          />
                        </span>
                        <span
                          className={styles.iconBox}
                          onClick={() => handleDeletemodal(id.toString())}
                        >
                          <Image
                            src="/assets/svg/delete.svg"
                            alt="delete"
                            width={0}
                            height={0}
                            style={{
                              width: "var(--normal-text-size)",
                              height: "var(--normal-text-size)",
                            }}
                          />
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <PaginationComponent
          totalPages={totalPages}
          page={currentPage || 0}
          rowsPerPage={rowsPerPage || 0}
          totalEntries={totalCount || 0}
          onPageChange={handleChangePage}
          rowsPerPageChange={handleChangeRowsPerPage}
          dropDownValues={[10, 15, 20]}
        />
      </div>
    </>
  );
}

export default memo(TeacherTable);
