import React, { CSSProperties, FC, ReactNode, memo } from "react";
import classes from "./filter-dropdown.module.css";
import Image from "next/image";
import DropDown from "@/components/global/dropDown-objects/dropDown-objects";
import DropDownSimple from "@/components/global/dropDown-simple/dropDown-simple";

interface FilterDropdownProps<T> {
  children?: ReactNode;
  placeholder: string;
  data: T[];
  handleChange: (value: T) => void;
  value: string;
  dropDownObject?: boolean;
  inlineBoxStyles?: CSSProperties;
}

const FilterDropdown: FC<FilterDropdownProps<any>> = ({
  placeholder,
  data,
  handleChange,
  value,
  dropDownObject,
  inlineBoxStyles,
}) => {
  return (
    <div className={classes.subWrapper} style={{ ...inlineBoxStyles }}>
      <div className={classes.imageBox}>
        <Image
          src="/assets/svgs/filterSvg.svg"
          alt="filter"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      {dropDownObject ? (
        <DropDown
          placeholder={placeholder}
          data={data}
          handleChange={handleChange}
          value={value}
          inlineDropDownStyles={style.dropDownStyles}
        />
      ) : (
        <DropDownSimple
          placeholder={placeholder}
          data={data}
          handleChange={handleChange}
          value={value}
          externalStyles={style.dropDownStyles}
        />
      )}
    </div>
  );
};

export default memo(FilterDropdown);

const style = {
  dropDownStyles: {
    borderRadius: "none !important",
    boxShadow: "none !important",
    background: "transparent",
    padding: "0px 10px",
    flexGrow: 1,
  },
};
