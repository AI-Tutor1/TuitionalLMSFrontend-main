import React, { FC, memo } from "react";
import classes from "./dashboard-card.module.css";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import LoadingBox from "@/components/global/loading-box/loading-box";

interface CardProps {
  text: string;
  number?: number | string | any;
  inlineStyling?: React.CSSProperties;
  inLineLogoStyling?: React.CSSProperties;
  bottomBoxInlineStyling?: React.CSSProperties;
  loading?: boolean;
}

const Card: FC<CardProps> = ({
  text,
  number,
  inlineStyling,
  loading,
  inLineLogoStyling,
  bottomBoxInlineStyling,
}) => {
  return (
    <div className={classes.box} style={inlineStyling}>
      <p className={classes.mainText}>{text}</p>
      <div className={classes.bottomBox} style={bottomBoxInlineStyling}>
        <div className={classes.number}>
          {loading ? (
            <LoadingBox
              loaderStyling={{
                height: "var(--regular20-) !important",
                width: "var(--regular20-) !important",
              }}
            />
          ) : (
            (number ?? 0)
          )}
        </div>
        <div className={classes.logoBox} style={inLineLogoStyling}>
          <KeyboardDoubleArrowRightIcon
            sx={{
              height: "var(--regular20-)",
              width: "var(--regular20-)",
              color: "var(--pure-white-color)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Card);
