import React, { memo } from "react";
import TuneIcon from "@mui/icons-material/Tune";
import classes from "./mobile.filters-button.module.css";

interface MobileFilterButtonProps {
  onClick: () => void;
  isOpen: boolean;
  isLoading?: boolean;
  inlineStyles?: React.CSSProperties;
}

const MobileFilterButton = memo<MobileFilterButtonProps>(
  ({ onClick, isOpen, isLoading = false, inlineStyles }) => {
    const buttonClasses = [
      classes.filterButton,
      isOpen ? classes.open : "",
      isLoading ? classes.loading : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        onClick={onClick}
        className={buttonClasses}
        style={inlineStyles}
        disabled={isLoading}
      >
        <span className={classes.iconWrapper}>
          <TuneIcon className={classes.icon} />
        </span>
      </button>
    );
  },
);

MobileFilterButton.displayName = "MobileFilterButton";

export default MobileFilterButton;
