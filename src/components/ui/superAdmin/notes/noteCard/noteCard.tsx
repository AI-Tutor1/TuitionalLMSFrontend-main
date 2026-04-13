import React, { useState, useEffect } from "react";
import classes from "./noteCard.module.css";
import moment from "moment";
import { Download, Star, GraduationCap } from "lucide-react";
import Image from "next/image";
import { Tooltip } from "@mui/material";
import { getTooltipStyles } from "@/components/global/tooltip/tooltip";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { useParams } from "next/navigation";

interface NoteCardProps {
  resource?: any;
  handleDeleteModal?: any;
  handleEditModal?: any;
  handleLikes?: any;
  handleViews?: any;
  handleDownloads?: any;
  likeLoading?: boolean;
  likeSuccess?: boolean;
  downloadLoading?: boolean;
  downloadSuccess?: boolean;
}

const allowedEditRoles = [
  "superAdmin",
  "admin",
  "counsellor",
  "manager",
  "hr",
  "teacher",
];
const allowedDeleteRoles = [
  "superAdmin",
  "admin",
  "counsellor",
  "manager",
  "hr",
];

const NoteCard = ({
  handleDeleteModal,
  handleEditModal,
  resource,
  handleLikes,
  handleViews,
  handleDownloads,
  likeLoading,
  likeSuccess,
  downloadLoading,
  downloadSuccess,
}: NoteCardProps) => {
  const { role } = useParams();
  const [viewId, setViewId] = useState<number | null>(null);
  const [likeId, setLikeId] = useState<number | null>(null);
  const [downloadId, setDownloadId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const canEdit = allowedEditRoles.includes(role as string);
  const canDelete = allowedDeleteRoles.includes(role as string);

  useEffect(() => {
    if (likeSuccess) {
      setLikeId(null);
    }
    if (downloadSuccess) {
      setDownloadId(null);
    }
  }, [likeSuccess, downloadSuccess]);

  return (
    <div className={classes.noteBox}>
      <div className={classes.header}>
        <h3 className={classes.title}>{resource?.title}</h3>
        <GraduationCap
          style={{
            minHeight: "var(--regular18-)",
            minWidth: "var(--regular18-)",
            height: "var(--regular18-)",
            width: "var(--regular18-)",
          }}
          color="green"
        />
      </div>
      <p className={classes.description}>{resource?.description}</p>
      <div className={classes.info}>
        <p>
          {resource?.createdAt
            ? moment(resource?.createdAt).format("Do-MMM-YYYY")
            : "No Date"}
        </p>
        <p>By: {resource?.creator?.name || "Unknown"}</p>
      </div>
      <div className={classes.actions}>
        <div className={classes.analyticsBox}>
          <div className={classes.actionsBox}>
            {likeLoading && resource?.id === likeId ? (
              <LoadingBox
                loaderStyling={{
                  width: "var(--regular18-) !important",
                  height: "var(--regular18-) !important",
                }}
              />
            ) : (
              <>
                <Star
                  fontSize="var(--regular18-)"
                  color="#facc15"
                  fill="#facc15"
                  onClick={() => {
                    setLikeId(resource?.id);
                    handleLikes(resource?.id);
                  }}
                />
                <span className={classes.count}>{resource?.likes || 0}</span>
              </>
            )}
          </div>
          <div className={classes.actionsBox}>
            {downloadLoading && resource?.id === downloadId ? (
              <LoadingBox
                loaderStyling={{
                  width: "var(--regular18-) !important",
                  height: "var(--regular18-) !important",
                }}
              />
            ) : (
              <>
                <Download
                  fontSize="var(--regular18-)"
                  color="red"
                  onClick={() => {
                    setDownloadId(resource?.id);
                    handleDownloads(resource?.id);
                  }}
                />
                <span className={classes.count}>
                  {resource?.downloads || 0}
                </span>
              </>
            )}
          </div>
        </div>
        {(canEdit || canDelete) && (
          <div className={classes.crudBox}>
            {canEdit && (
              <Tooltip title={"Update"} placement="bottom" arrow>
                <span
                  className={classes.iconBox}
                  onClick={(e: any) => handleEditModal(resource)}
                >
                  <Image
                    src="/assets/svgs/edit.svg"
                    alt="edit"
                    width={0}
                    height={0}
                    style={{
                      width: "var(--regular18-)",
                      height: "var(--regular18-)",
                    }}
                  />
                </span>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip
                title={"Delete Resource"}
                arrow
                slotProps={getTooltipStyles()}
              >
                <span
                  className={classes.iconBox}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(resource?.id);
                    handleDeleteModal(resource?.id);
                  }}
                >
                  <Image
                    src="/assets/svgs/delete.svg"
                    alt="delete"
                    width={0}
                    height={0}
                    style={{
                      width: "var(--regular18-)",
                      height: "var(--regular18-)",
                    }}
                  />
                </span>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
