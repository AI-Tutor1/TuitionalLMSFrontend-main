import React, { FC } from "react";
import classes from "./product-reviews.module.css";
import { ChevronDown, ChevronRight } from "lucide-react";
import Button from "@/components/global/button/button";

const ProductReviews: FC = () => {
  return (
    <div className={classes.summaryCard}>
      <div className={classes.summaryHeader}>
        <h3 className={classes.summaryTitle}>Product Reviews</h3>
        <Button
          text="View All reviews"
          inlineStyling={styles.buttonStyles}
          icon={<ChevronRight />}
        />
      </div>
      <div className={classes.table}>
        <div className={classes.reviewTableHeader}>
          <span>Student Name</span>
          <ChevronDown className={classes.filterIcon} />
        </div>
        <div className={classes.reviewRows}>
          <div className={classes.reviewRow}>
            <div className={classes.priorityContainer}>
              <span
                className={`${classes.priorityIndicator} ${classes.highPriority}`}
              ></span>
              <span className={classes.priorityText}>High</span>
            </div>
            <div className={classes.reviewSubject}>Berlin Student Review</div>
            <div className={classes.reviewActions}>
              <span className={classes.negativeStatus}>
                {" "}
                <span
                  className={`${classes.priorityIndicator} ${classes.highPriority}`}
                ></span>{" "}
                Negative
              </span>
              <span className={classes.viewButton}>View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;

const styles = {
  buttonStyles: {
    flexDirection: "row-reverse",
    borderRadius: "10px",
  },
};
