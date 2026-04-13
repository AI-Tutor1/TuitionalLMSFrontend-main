import React, { useState, CSSProperties, useMemo } from "react";
import Image from "next/image";
import moment from "moment";
import classes from "./leadsOverview-mobileView-card.module.css";
import BasicSwitches from "@/components/global/toggle-button/toggle-button";
import { useParams } from "next/navigation";
import { Tooltip, Checkbox } from "@mui/material";
import { toast } from "react-toastify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import LoadingBox from "@/components/global/loading-box/loading-box";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

interface LeadsOverviewMobileViewCardProps {
  item?: any;
  handleDeleteModal?: (id?: number) => void;
}

const LeadsOverviewMobileViewCard: React.FC<
  LeadsOverviewMobileViewCardProps
> = ({ handleDeleteModal, item }) => {
  const formattedLeads = useMemo(() => {
    return {
      formattedDueDate: item?.due_date
        ? moment.utc(item.due_date).local().format("Do-MMM-YYYY")
        : "No Show",
      formattedStudentName:
        item?.student_name?.trim().split(" ").slice(0, 2).join(" ") ||
        "No Show",
      formattedStudentEmail:
        item?.student_email?.trim().split(" ").slice(0, 2).join(" ") ||
        "No Show",
      formattedParentName:
        item?.parent_name?.trim().split(" ").slice(0, 2).join(" ") || "No Show",
    };
  }, [item]);

  return (
    <div className={classes.mobileViewContainer}>
      <div className={classes.header}>
        <div className={classes.field}>
          <span className={classes.label}>Registration Fee</span>
          <span className={classes.value}>
            AED {item?.registration_fee || "0.00"}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Due Date</span>
          <span className={classes.value}>
            {formattedLeads.formattedDueDate}
          </span>
        </div>
      </div>
      <div className={classes.row}>
        <div className={classes.field}>
          <span className={classes.label}>Student Name</span>
          <span className={classes.value}>
            {formattedLeads.formattedStudentName}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Student Email</span>
          <p className={classes.value}>
            {formattedLeads.formattedStudentEmail}
          </p>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Student Contact</span>
          <p className={classes.value}>{item?.student_contact}</p>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Parent Name</span>
          <p className={classes.value}>{formattedLeads.formattedParentName}</p>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Parent Number</span>
          <p className={classes.value}>{item?.parent_contact}</p>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Hourly Rate</span>
          <p className={classes.value}>AED {item?.hourly_rate || "0.00"}</p>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>No of classes</span>
          <p className={classes.value}> {item?.no_of_classes || "No Show"}</p>
        </div>
      </div>
    </div>
  );
};

export default LeadsOverviewMobileViewCard;
