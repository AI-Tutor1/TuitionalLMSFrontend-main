import React, { memo } from "react";
import classes from "./detail.module.css";
import { Container, Box } from "@mui/material";
import Image from "next/image";
import Flag from "react-world-flags";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import moment from "moment";

type DetailProps = {
  data?: any;
  sessionsOfEnrollment?: any;
  sessionByEnrollmentLoading?: boolean;
  logsData?: any;
  logsLoading?: boolean;
};

const Detail: React.FC<DetailProps> = ({
  data,
  sessionsOfEnrollment,
  sessionByEnrollmentLoading,
  logsData,
  logsLoading,
}) => {
  return (
    <div className={classes.detailContainer}>
      <Box className={classes.section1}>
        <Box className={classes.header}>
          <p>Students</p>
          <p>View students in your class</p>
        </Box>
        <Box className={classes.body}>
          {data?.studentsData?.map((student: any, index: any) => (
            <Box key={index} className={classes.child}>
              <div>
                <div className={classes.imageBox}>
                  <Image
                    src={
                      student?.profileImageUrl || "/assets/images/dummyPic.png"
                    }
                    alt="profile"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <p>{student?.name}</p>
              </div>
              <div>
                <div className={classes.imageBox}>
                  <Flag
                    code={student?.country_code || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
                <p>{student?.country_code || ""}</p>
              </div>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={classes.section2}>
        <Box className={classes.section2Childs}>
          <p>Analytics</p>
          <Box className={classes.componentsBox}>
            <div className={classes.components}>
              <div>
                <div>
                  <Image
                    src="/assets/images/cap.png"
                    alt="cap"
                    width={0}
                    height={0}
                    style={{
                      width: "var(--regular20-)",
                      height: "var(--regular20-)",
                    }}
                  />
                </div>
                {sessionByEnrollmentLoading ? (
                  <LoadingBox />
                ) : (
                  <p>{sessionsOfEnrollment?.data?.length} </p>
                )}
              </div>
              <p>Classes Taken</p>
            </div>
            <div className={classes.components}>
              <div>
                <div>
                  <Image
                    src="/assets/images/cap.png"
                    alt="cap"
                    width={0}
                    height={0}
                    style={{
                      width: "var(--regular20-)",
                      height: "var(--regular20-)",
                    }}
                  />
                </div>
                <p>AED {data?.tutor_hourly_rate}</p>
              </div>
              <p>Teacher Hourly Rate</p>
            </div>
            <div className={classes.components}>
              <div>
                <div>
                  <Image
                    src="/assets/images/cap.png"
                    alt="cap"
                    width={0}
                    height={0}
                    style={{
                      width: "var(--regular20-)",
                      height: "var(--regular20-)",
                    }}
                  />
                </div>
                <p>AED {data?.hourly_rate}</p>
              </div>
              <p>Student Hourly Rate</p>
            </div>
          </Box>
        </Box>

        <Box className={classes.section2Childs}>
          <p>Info</p>
          <Box className={classes.componentsBox}>
            <div className={classes.components}>
              <p>Grade</p>
              <div>
                <p>{data?.grade?.name || "No Show"}</p>
              </div>
            </div>
            <div className={classes.components}>
              <p>Curriculum</p>
              <div>
                <p>{data?.curriculum?.name || "No Show"}</p>
              </div>
            </div>
            <div className={classes.components}>
              <p>Board</p>
              <div>
                <p>{data?.board?.name || "No Show"}</p>
              </div>
            </div>
          </Box>
        </Box>

        <div className={classes.logBox}>
          <p>Enrollment Logs</p>
          {!logsData || logsData.length === 0 ? (
            <ErrorBox
              inlineStyling={{
                minHeight: "250px",
                backgroundColor: "var(--main-white-color)",
                boxShadow: "var(--main-inner-boxShadow-color)",
                borderRadius: "10px",
              }}
            />
          ) : (
            <div className={classes.logBoxContent}>
              {(Array.isArray(logsData) ? logsData : [logsData])?.map((log) => (
                <div key={log.id} className={classes.logItem}>
                  <p>By: {log?.actor?.name || "No Show"}</p>
                  <p>At: {moment(log.created_at).format("DD MMM YYYY")}</p>
                  <p>
                    Starts:{" "}
                    {log.pause_starts_at
                      ? moment(log.pause_starts_at).format("DD MMM YYYY")
                      : "-"}
                  </p>
                  <p>
                    Ends:{" "}
                    {log.pause_ends_at
                      ? moment(log.pause_ends_at).format("DD MMM YYYY")
                      : "-"}
                  </p>
                  <p>
                    <span
                      className={classes.logItemStatus}
                      style={{
                        backgroundColor:
                          log?.status === "RESUMED"
                            ? "var(--green-background-color4)"
                            : log?.status === "PAUSED_PERMANENT"
                              ? "var(--red-background-color2)"
                              : log?.status === "PAUSED_TEMPORARILY"
                                ? "var(--main-blue-color)"
                                : "var(--main-white-color)",
                        color:
                          log?.status === "RESUMED"
                            ? "var(--green-text-color4)"
                            : log?.status === "PAUSED_PERMANENT"
                              ? "var(--red-text-color1)"
                              : log?.status === "PAUSED_TEMPORARILY"
                                ? "var(--pure-white-color)"
                                : "var(--pure-black-color)",
                      }}
                    >
                      {log?.status || "-"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Box>
    </div>
  );
};

export default memo(Detail);
