import React from "react";
import classes from "./upcomingDemoCards.module.css";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import LaunchOutlinedIcon from "@mui/icons-material/LaunchOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import moment from "moment";
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { toast } from "react-toastify";
import LoadingBox from "@/components/global/loading-box/loading-box";

interface UpcomingDemoCardsProps {
  key: number | string;
  handleFeedbackModalOpen: () => void;
  data: any;
  handleDeleteDemo?: (id: string) => void;
  handleUpdateDemo?: (data: any) => void;
  deleteLoading: boolean;
}

const UpcomingDemoCards = ({
  data,
  key,
  handleFeedbackModalOpen,
  handleUpdateDemo,
  handleDeleteDemo,
  deleteLoading,
}: UpcomingDemoCardsProps) => {
  const [sideActionsModal, setSideActionsModal] = React.useState(false);
  return (
    <div key={key} className={classes.card}>
      <div className={classes.cardContent}>
        <div className={classes.cardTitleRow}>
          <h3 className={classes.cardTitle}>
            {data?.demoTutor?.name || "No Show"}
          </h3>
          <span className={classes.capitalizeText}>
            {data?.demoSubject?.name || "No Show"}
          </span>
          <span className={classes.capitalizeText}>
            {data?.demoGrade?.name || "No Show"}
          </span>
          <span className={classes.capitalizeText}>
            {data?.demoCurriculum?.name || "No Show"}
          </span>
        </div>
        <p className={classes.studentName}>{data?.studentName || "No Show"}</p>
        <div className={classes.cardDescription}>
          <div className={classes.createdDate}>
            <CalendarTodayOutlinedIcon
              sx={{ height: "1.2rem", width: "1.2rem" }}
            />
            Date:{" "}
            {moment
              .utc(`${data.date} ${data.time}`, "YYYY-MM-DD HH:mm:ss")
              .local()
              .format("Do-MMMM-YYYY")}{" "}
          </div>{" "}
          <div className={classes.createdDate}>
            <AccessTimeIcon sx={{ height: "1rem", width: "1rem" }} />
            Time: {moment.utc(data.time, "HH:mm:ss").local().format("h:mm A")}
          </div>
        </div>
        <div className={classes.cardActions}>
          <VideocamOutlinedIcon sx={{ color: "var(--main-color)" }} />{" "}
          <span>
            {data?.meetLink.split("/")[data?.meetLink.split("/").length - 1] ||
              "No Show"}
          </span>{" "}
          <ContentCopyOutlinedIcon
            sx={{ cursor: "pointer" }}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(data?.meetLink);
                return toast.success("Meet link copied");
              } catch (error) {
                return toast.error("Failed to copy meet link");
              }
            }}
          />
        </div>
      </div>
      <div className={classes.actionsBox}>
        <Link
          href={data?.meetLink || "#"}
          target="_blank"
          className={classes.meetingLink}
        >
          <LaunchOutlinedIcon sx={{ height: "1rem", width: "1rem" }} />
          Join Meet
        </Link>
        <div className={classes.feedback} onClick={handleFeedbackModalOpen}>
          <ChatBubbleOutlineOutlinedIcon
            sx={{ height: "1rem", width: "1rem", color: "var(--main-color)" }}
          />
          Collect Feedback
        </div>
        {deleteLoading ? (
          <LoadingBox
            inlineStyling={{ height: "max-content", width: "max-content" }}
            loaderStyling={{
              height: "1rem !important",
              width: "1rem !important",
            }}
          />
        ) : (
          <span
            className={classes.sideActions}
            onClick={() => setSideActionsModal((prev) => !prev)}
          >
            <MoreHorizOutlinedIcon sx={{ height: "1rem", width: "1rem" }} />
            {sideActionsModal && (
              <SideActionsModal
                data={data}
                handleDeleteDemo={handleDeleteDemo}
                handleUpdateDemo={handleUpdateDemo}
              />
            )}
          </span>
        )}
      </div>
    </div>
  );
};

const SideActionsModal = ({
  data,
  handleDeleteDemo,
  handleUpdateDemo,
}: {
  data: any;
  handleDeleteDemo?: (id: string) => void;
  handleUpdateDemo?: (data: any) => void;
}) => {
  return (
    <div
      className={classes.sideActionsModal}
      onClick={() => handleUpdateDemo?.(data)}
    >
      <div className={classes.childs}>
        <EditOutlinedIcon sx={{ height: "1rem", width: "1rem" }} />
        Edit Details
      </div>
      <div
        className={classes.childs}
        onClick={() => handleDeleteDemo?.(data?.id)}
      >
        <DeleteOutlineOutlinedIcon sx={{ height: "1rem", width: "1rem" }} />
        Cancel Demo
      </div>
    </div>
  );
};

export default UpcomingDemoCards;
