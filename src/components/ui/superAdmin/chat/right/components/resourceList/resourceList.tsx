import React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import MovieIcon from "@mui/icons-material/Movie";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import ArchiveIcon from "@mui/icons-material/Archive";
import DownloadIcon from "@mui/icons-material/Download";
import classes from "./resourceList.module.css";

function getFileIcon(ext: string) {
  switch (ext) {
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
      return (
        <ImageIcon
          className={classes.fileIcon}
          color="primary"
          fontSize="large"
        />
      );
    case "pdf":
      return (
        <PictureAsPdfIcon
          className={classes.fileIcon}
          color="error"
          fontSize="large"
        />
      );
    case "mp4":
    case "mov":
    case "webm":
      return (
        <MovieIcon
          className={classes.fileIcon}
          color="action"
          fontSize="large"
        />
      );
    case "mp3":
    case "wav":
    case "aac":
      return (
        <MusicNoteIcon
          className={classes.fileIcon}
          color="secondary"
          fontSize="large"
        />
      );
    case "zip":
    case "rar":
    case "7z":
      return (
        <ArchiveIcon
          className={classes.fileIcon}
          color="disabled"
          fontSize="large"
        />
      );
    default:
      return (
        <InsertDriveFileIcon
          className={classes.fileIcon}
          color="info"
          fontSize="large"
        />
      );
  }
}

function downloadResource(url: string, filename?: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ResourceList({ resources }: { resources: any[] }) {
  return (
    <div className={classes.resourcesList}>
      {resources?.map((resource) => {
        const ext =
          resource?.media_url.split(".").pop()?.split("?")[0]?.toLowerCase() ||
          "";

        return (
          <Card
            className={classes.resourceItem}
            key={resource.id}
            elevation={3}
          >
            <CardActionArea className={classes.resourcePreview}>
              <div className={classes.resourceIconContainer}>
                {getFileIcon(ext)}
              </div>
              <CardContent className={classes.resourceContent}>
                <Typography
                  variant="subtitle1"
                  className={classes.resourceName}
                  noWrap
                >
                  {resource?.name || resource?.sender?.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className={classes.resourceMeta}
                >
                  {resource.size} • Uploaded by {resource?.sender?.name} on{" "}
                  {new Date(resource.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </CardActionArea>
            <Tooltip title="Download" arrow>
              <IconButton
                className={classes.resourceDownloadButton}
                onClick={(e) => {
                  e.stopPropagation();
                  downloadResource(resource?.media_url, resource?.name);
                }}
                aria-label="Download"
                size="large"
              >
                <DownloadIcon className={classes.resourceDownloadIcon} />
              </IconButton>
            </Tooltip>
          </Card>
        );
      })}
      {!resources?.length && (
        <Typography variant="body1" color="textSecondary" align="center">
          No resources found.
        </Typography>
      )}
    </div>
  );
}
