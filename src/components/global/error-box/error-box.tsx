import React, { FC } from "react";
import classes from "./error-box.module.css";

interface ErrorBoxProps {
  inlineStyling?: React.CSSProperties;
  message?: string;
}

const ErrorBox: FC<ErrorBoxProps> = ({ inlineStyling, message }) => {
  return (
    <div className={classes.errorBox} style={inlineStyling}>
      {message || "No Data Found!"}
    </div>
  );
};

export default ErrorBox;
