import React, { memo, CSSProperties } from "react";
import Pagination from "@mui/material/Pagination";
import styles from "./pagination.module.css";

interface PaginationComponentProps {
  page: number;
  rowsPerPage: number;
  totalEntries: number;
  dropDownValues: string[] | number[];
  totalPages?: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  inlineStyles?: CSSProperties;
}

function PaginationComponent({
  totalPages,
  page,
  rowsPerPage,
  totalEntries,
  dropDownValues,
  onPageChange,
  rowsPerPageChange,
  inlineStyles,
}: PaginationComponentProps) {
  const startEntry = totalEntries === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endEntry = Math.min(page * rowsPerPage, totalEntries);
  const calculatedTotalPages = Math.ceil(totalEntries / rowsPerPage) || 1;

  return (
    <div className={styles.pagination} style={inlineStyles}>
      <div>
        {`Showing ${startEntry} to ${endEntry} of `}
        &nbsp;
        <span className={styles.entries}>{totalEntries}</span>
        &nbsp;entries.
      </div>
      <Pagination
        count={totalPages ?? calculatedTotalPages}
        page={page}
        onChange={onPageChange}
        shape="rounded"
        sx={{
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: "var(--main-blue-color)",
            color: "var(--white-color)",
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            color: "var(--pure-white-color)",
            backgroundColor: "var(--main-blue-color)",
            border: "1px solid var(--main-blue-color)",
          },
          "& .MuiPaginationItem-root.Mui-disabled": {
            color: "var(--text-grey)",
          },
        }}
      />
      <div className={styles.dropDownBox}>
        Show{" "}
        <select
          value={rowsPerPage}
          onChange={rowsPerPageChange}
          className={styles.dropdown}
        >
          {dropDownValues?.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default memo(PaginationComponent);
