import React, { FC } from "react";
import classes from "./chartContainer.module.css";
import OpenInBrowserIcon from "@mui/icons-material/OpenInBrowser";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  inLineStyles?: React.CSSProperties;
  icon?: boolean;
  handleModal?: () => void;
  FilterComponent?: React.ReactNode;
  filter?: boolean;
}

const ChartContainer: FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  inLineStyles,
  icon,
  handleModal,
  FilterComponent,
  filter,
}) => {
  return (
    <div className={classes.container} style={inLineStyles}>
      <div className={classes.header}>
        <div className={classes.headings}>
          <h3 className={classes.title}>{title}</h3>
          <p className={classes.subtitle}>{subtitle}</p>
        </div>
        {filter && FilterComponent}
        {icon && (
          <div className={classes.iconBox} onClick={handleModal}>
            <OpenInBrowserIcon />
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default ChartContainer;
