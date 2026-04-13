import React, { FC } from "react";
import { useRouter } from "next/navigation";
import classes from "./session-summary.module.css";
import { ChevronRight } from "lucide-react";
import Button from "@/components/global/button/button";
import { SessionSummaryForTutor_Api_Response_Type } from "@/types/sessions/sessionSummary.types";
import LoadingBox from "@/components/global/loading-box/loading-box";
import moment from "moment";

interface SessionSummaryProps {
  data?: SessionSummaryForTutor_Api_Response_Type["data"];
  loading?: boolean;
}

const SessionSummary: FC<SessionSummaryProps> = ({ data, loading }) => {
  const router = useRouter();
  const extractNamesAndSubject = (input: string | null): string => {
    if (!input || typeof input !== "string") {
      return "No Show";
    }
    const namePart = input.split(" - |")[0];
    const allNames = namePart.split("/");
    const studentNames = allNames.slice(0, -1);
    const formattedStudentNames = studentNames.join(" | ");
    const parts = input.split("|");
    const subject = parts[parts.length - 1]?.trim() || "";
    return `${formattedStudentNames} - ${subject}`;
  };
  return (
    <div className={classes.summaryCard}>
      <div className={classes.summaryHeader}>
        <h3 className={classes.summaryTitle}>Session Count Summary</h3>
        <Button
          text="View All Sessions"
          inlineStyling={styles.buttonStyles}
          icon={<ChevronRight />}
          clickFn={() => {
            router.push(`/teacher/sessions`);
          }}
        />
      </div>
      <div className={classes.table}>
        <div className={classes.sessionTableHeader}>
          <div className={classes.tableFilter}>
            <div>Student Name</div>
          </div>
          <div className={classes.tableFilter}>
            <div>Sessions</div>
          </div>
          <div className={classes.tableFilter}>
            <div>Hours</div>
          </div>
          <div className={classes.tableFilter}>
            <div>Hourly Rate</div>
          </div>
          <div className={classes.tableFilter}>
            <div>Amount</div>
          </div>
        </div>
        <div className={classes.tableBody}>
          {loading ? (
            <LoadingBox
              loaderStyling={{
                height: "100%",
                width: "100%",
              }}
            />
          ) : (
            <div className={classes.sessionRows}>
              {data?.map((session, index) => (
                <div className={classes.sessionRow} key={index}>
                  <div className={classes.sessionCell}>
                    {extractNamesAndSubject(session?.name) || "No Show"}
                  </div>
                  <div className={classes.sessionCell}>
                    {session?.session_count}
                  </div>
                  <div className={classes.sessionCell}>
                    {session?.duration
                      ? moment.duration(session?.duration, "minutes").asHours()
                      : 0}
                  </div>
                  <div className={classes.sessionCell}>
                    {session?.tutor_hourly_rate || 0}
                  </div>
                  <div className={classes.sessionCell}>
                    {session?.tutor_hourly_rate &&
                    session?.session_count &&
                    session?.duration
                      ? session?.tutor_hourly_rate *
                        session?.session_count *
                        Number(
                          moment
                            .duration(session?.duration, "minutes")
                            .asHours()
                            .toLocaleString()
                        )
                      : 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionSummary;

const styles = {
  buttonStyles: {
    flexDirection: "row-reverse",
    borderRadius: "10px",
  },
};
