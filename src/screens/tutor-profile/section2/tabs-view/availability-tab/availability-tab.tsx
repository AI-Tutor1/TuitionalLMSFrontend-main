import styles from "./availability-tab.module.css";
import { Box } from "@mui/material";
import AvailabilityComponent from "./availability-components/availability-component";

interface Slot {
  start: string;
  end: string;
  selected: boolean;
}

interface AvailabilityDay {
  slots: Slot[];
  selected: boolean;
}

interface Schedule {
  [day: string]: AvailabilityDay;
}

interface AvailabilityTabProps {
  schedule: Schedule;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ schedule }) => {
  return (
    <div className={styles.container}>
      {Object.keys(schedule).length === 0 ? (
        <div className={styles.errorBox}>
          <h1>No Data Found!</h1>
        </div>
      ) : (
        Object.keys(schedule).map((item, index) => (
          <div key={index} className={styles.scheduleBox}>
            {schedule[item].selected && (
              <>
                <div>{item}</div>
                <div className={styles.components}>
                  {schedule[item]?.slots?.length === 0 ? (
                    <h1>No Data Found!</h1>
                  ) : (
                    schedule[item].slots.map(
                      (entry, indx) =>
                        entry.selected && (
                          <AvailabilityComponent
                            key={indx}
                            duration={entry.end}
                            stime={entry.start}
                            etime={entry.end}
                          />
                        )
                    )
                  )}
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AvailabilityTab;
