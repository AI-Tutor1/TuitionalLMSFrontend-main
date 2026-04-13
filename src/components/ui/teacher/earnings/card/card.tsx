import React, { FC } from "react";
import LoadingBox from "@/components/global/loading-box/loading-box";
import classes from "./card.module.css";
import moment from "moment";

// Define the proper type for props
interface CardProps {
  number?: number;
  inlineStyling?: React.CSSProperties;
  loading?: boolean;
  status: string;
  startDate?: string;
  endDate?: string;
}

const Card: FC<CardProps> = ({
  inlineStyling,
  number = 0,
  loading = false,
  status,
  startDate,
  endDate,
}) => {
  return (
    <div className={classes.statCard} style={inlineStyling}>
      <div className={classes.statHeader}>
        <p className={classes.statTitle}>Upcoming Payment</p>
        <div className={classes.statValueBlue}>
          {loading ? (
            <LoadingBox
              loaderStyling={{
                height: "var(--normal-text-size-vh) !important",
                width: "var(--normal-text-size-vh) !important",
              }}
            />
          ) : (
            `AED ${number}`
          )}
        </div>
      </div>
      <div className={classes.statusContainer}>
        <span>
          {startDate && endDate
            ? `${moment(startDate).format("MMM Do, YYYY")} - ${moment(
                endDate
              ).format("MMM Do, YYYY")}`
            : "Feb 28th, 2025"}
        </span>
        <p className={classes.status}>
          Status:{" "}
          <span
            className={
              status === "Paid" ? classes.statusPaid : classes.statusPending
            }
          >
            {status}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Card;
