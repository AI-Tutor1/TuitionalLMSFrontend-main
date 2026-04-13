import React from "react";
import classes from "./teacherPerformance.module.css";
import LocalPoliceOutlinedIcon from "@mui/icons-material/LocalPoliceOutlined";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const TeacherPerformance = () => {
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <div>
          <span>
            <LocalPoliceOutlinedIcon sx={{ width: "2rem", height: "2rem" }} />
          </span>
          <p>Demo Sessions & Feedback Reports</p>
        </div>
        <p>View all demo sessions and collect feedback after completion</p>
      </div>
      <div className={classes.cardBox}>
        <div className={classes.card}>
          <div className={classes.cardHeader}>
            <div>
              <p className={classes.name}>Sarah Johnson</p>
              <span className={classes.subject}>Mathematics</span>
            </div>
            <span
              className={classes.badge}
              style={{
                color:
                  "Good" === "Good"
                    ? "rgba(30, 64, 175, 1)"
                    : "Excellent" === "Excellent"
                    ? "rgba(22, 101, 52, 1)"
                    : "rgba(133, 77, 14, 1)",
                backgroundColor:
                  "Good" === "Good"
                    ? "rgba(219, 234, 254,1)"
                    : "Excellent" === "Excellent"
                    ? "rgba(220, 252, 231, 1)"
                    : "rgba(254, 249, 195, 1)",
              }}
            >
              Very Good
            </span>
          </div>
          <div className={classes.cardStatsBox}>
            <div className={classes.cardStatsWrapper}>
              <span style={{ color: "var(--main-color)" }}>2</span>
              Total Demos
            </div>
            <div className={classes.cardStatsWrapper}>
              <span style={{ color: "rgba(22, 101, 52, 1)" }}>2</span>
              Completed
            </div>
            <div className={classes.cardStatsWrapper}>
              <span style={{ color: "rgba(133, 77, 14, 1)" }}>1</span>
              Scheduled
            </div>
            <div className={classes.cardStatsWrapper}>
              <span style={{ color: "purple" }}>50%</span>
              Conversion Rate
            </div>
          </div>
          <div className={classes.barsBox}>
            <div className={classes.cardInfoBox}>
              <div className={classes.cardInfo}>
                <span>Overall Experience Rating</span>
                <span>{8.5}/10</span>
              </div>
              <LinearProgress
                value={90}
                variant="determinate"
                sx={{
                  borderRadius: "10px",
                  height: "5px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPerformance;
