"use client";
import React from "react";
import styles from "./filter-type.module.css";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";

interface FilterProps {
  placeholder?: string;
  chnageFn?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inlineStyles?: React.CSSProperties;
}

const FilterByType: React.FC<FilterProps> = ({
  placeholder,
  chnageFn,
  inlineStyles,
}) => {
  return (
    <div className={styles.container} style={{ ...inlineStyles }}>
      <span className={styles.iconBox}>
        <FilterListOutlinedIcon />
      </span>
      <input type="search" placeholder={placeholder} onChange={chnageFn} />
    </div>
  );
};

export default FilterByType;
