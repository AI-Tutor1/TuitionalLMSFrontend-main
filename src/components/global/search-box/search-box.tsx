import React, { ChangeEvent, CSSProperties, memo } from "react";
import classes from "./search.module.css";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBoxProps {
  placeholder?: string;
  changeFn?: (event: ChangeEvent<HTMLInputElement>) => void;
  inlineStyles?: CSSProperties;
  inlineIconBoxStyles?: CSSProperties;
  inlineInputStyles?: CSSProperties;
  value?: string;
  iconColor?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  placeholder,
  changeFn,
  inlineStyles,
  inlineIconBoxStyles,
  inlineInputStyles,
  value,
  iconColor,
}) => {
  return (
    <div className={classes.container} style={inlineStyles}>
      <span className={classes.iconBox} style={inlineIconBoxStyles}>
        <SearchIcon
          sx={{ color: iconColor ? `${iconColor}` : "var(--black-color)" }}
        />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        onChange={changeFn}
        style={inlineInputStyles}
        {...(value ? { value } : {})}
      />
    </div>
  );
};

export default memo(SearchBox);
