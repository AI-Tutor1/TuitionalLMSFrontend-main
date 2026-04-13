import { memo } from "react";
import styles from "./child-header.module.css";
import moment from "moment";

const ChildHeader = ({ startTime, key, endTime }: any) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div className={styles.header} key={key}>
      <p>{moment.utc(startTime, "HH:mm:ss").local().format("hh:mm A")}</p>
      <div>-</div>
      <p>
        {moment
          .utc(startTime, "HH:mm:ss")
          .add(endTime, "minutes")
          .local()
          .format("hh:mm A")}
      </p>
      <p>({userTimeZone})</p>
    </div>
  );
};

export default memo(ChildHeader);
