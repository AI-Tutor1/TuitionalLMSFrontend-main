import React, { FC } from "react";
import { ChevronDown } from "lucide-react";
import classes from "./earning-history.module.css";

const EarningHistory: FC = () => {
  return (
    <div className={classes.historyCard}>
      <h3 className={classes.historyTitleLarge}>Earning History</h3>
      <div className={classes.table}>
        <div className={classes.tableHeader}>
          <div className={classes.tableFilter}>
            <span>Month</span>
            <ChevronDown className={classes.filterIcon} />
          </div>
          <div className={classes.tableFilter}>
            <span>Date</span>
            <ChevronDown className={classes.filterIcon} />
          </div>
          <div className={classes.tableFilter}>
            <span>Amount</span>
            <ChevronDown className={classes.filterIcon} />
          </div>
        </div>
        <div className={classes.tableBody}>
          <div className={classes.tableRows}>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>January '25</div>
              <div className={classes.tableCell}>2023-01-01</div>
              <div className={classes.tableCell}>12,000</div>
            </div>
            {/* Additional rows */}
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>December '24</div>
              <div className={classes.tableCell}>2023-11-15</div>
              <div className={classes.tableCell}>8000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>November '24</div>
              <div className={classes.tableCell}>2023-02-01</div>
              <div className={classes.tableCell}>12000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>October '24</div>
              <div className={classes.tableCell}>2023-02-15</div>
              <div className={classes.tableCell}>12000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>September '24</div>
              <div className={classes.tableCell}>2023-03-01</div>
              <div className={classes.tableCell}>12000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>September '24</div>
              <div className={classes.tableCell}>2023-03-01</div>
              <div className={classes.tableCell}>12000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>September '24</div>
              <div className={classes.tableCell}>2023-03-01</div>
              <div className={classes.tableCell}>12000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>September '24</div>
              <div className={classes.tableCell}>2023-03-01</div>
              <div className={classes.tableCell}>12000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>September '24</div>
              <div className={classes.tableCell}>2023-03-01</div>
              <div className={classes.tableCell}>12000</div>
            </div>
            <div className={classes.tableRow}>
              <div className={classes.tableCell}>September '24</div>
              <div className={classes.tableCell}>2023-03-01</div>
              <div className={classes.tableCell}>12000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningHistory;
