import React, { useState, CSSProperties, useMemo } from "react";
import moment from "moment";
import classes from "./consumerOverview-mobileView-card.module.css";
import { useParams } from "next/navigation";
import { Tooltip, Checkbox } from "@mui/material";
import { toast } from "react-toastify";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SendIcon from "@mui/icons-material/Send";

interface ConsumerOverviewMobileViewCardProps {
  item?: any;
  handlePaidModal: (id?: number, amount?: number) => void;
  handleDeleteModal: (id?: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  handleSent: (id?: number, is_sent?: boolean) => void;
  sentLoading: boolean;
}

const ConsumerOverviewMobileViewCard: React.FC<
  ConsumerOverviewMobileViewCardProps
> = ({
  item,
  handlePaidModal,
  handleDeleteModal,
  totalPages,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  currentPage,
  handleSent,
  sentLoading,
}) => {
  const params = useParams();
  const { roleId } = useAppSelector((state) => state?.user?.user!);
  const [isSentId, setIsSentId] = useState<number | null>(null);

  const handleDownloadPdf = (pdfUrl: string, fileName: string) => {
    window.open(pdfUrl, "_blank");
  };

  const handleCopyToClipboard = (
    e: React.MouseEvent,
    text: string,
    message: string,
  ) => {
    e.preventDefault();
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className={classes.mobileViewContainer}>
      <div className={classes.header}>
        <div className={classes.field}>
          <span className={classes.label}>Invoice Id</span>
          <span className={classes.value}>{item.id}</span>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Issue</span>
          <span className={classes.value}>
            {item?.createdAt
              ? moment.utc(item.createdAt).local().format("Do-MMM-YYYY")
              : "No Show"}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Issue</span>
          <span className={classes.value}>
            {item?.due_date
              ? moment.utc(item.due_date).local().format("Do-MMM-YYYY")
              : "No Show"}
          </span>
        </div>
      </div>
      <div className={classes.row}>
        <div className={classes.field}>
          <span className={classes.label}>Student Id</span>
          <span className={classes.value}>
            {item?.userInvoice?.id || "No Show"}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Name</span>
          <span className={classes.value}>
            {item?.userInvoice?.name?.trim().split(" ").slice(0, 2).join(" ") ||
              "No Show"}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Balance</span>
          <p className={classes.value}> {item?.amount || "0"}</p>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Paid</span>
          <p className={classes.value}> {item?.amount_paid || "0"}</p>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Status</span>
          <span
            style={{
              width: "max-content",
              background:
                item?.status === "PENDING"
                  ? "orange"
                  : item?.status === "PAID"
                    ? "rgba(81, 184, 147, 0.18)"
                    : item?.status === "OVERDUE"
                      ? "rgba(248, 106, 106, 0.37)"
                      : "rgb(255, 172, 172)",
              padding: "2.5px 10px",
              borderRadius: "5px",
              color:
                item?.status === "PENDING"
                  ? "white"
                  : item?.status === "PAID"
                    ? "#098B34"
                    : item?.status === "OVERDUE"
                      ? "#C5371B"
                      : "gray",
              fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
            }}
          >
            {item?.status
              ? item?.status?.charAt(0).toUpperCase() +
                item?.status?.slice(1).toLowerCase()
              : "No Show"}
          </span>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Actions</span>
          <div className={classes.actionsBox}>
            <span className={classes.iconBox} onClick={() => {}}>
              <SendIcon
                sx={{
                  height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                  width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                }}
              />
            </span>
            <span
              className={classes.iconBox}
              onClick={() => {
                if (item.pdf_content) {
                  handleDownloadPdf(item.pdf_content, `invoice_${item.id}.pdf`);
                } else {
                  toast.error("No PDF content available for this invoice.");
                }
              }}
            >
              <FileDownloadOutlinedIcon
                sx={{
                  height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                  width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                }}
              />
            </span>
            <span
              className={classes.iconBox}
              onClick={() => handlePaidModal(item?.id, item?.amount)}
            >
              <RefreshIcon
                sx={{
                  height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                  width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                }}
              />
            </span>
            <span
              className={classes.iconBox}
              onClick={() => handleDeleteModal(item?.id)}
            >
              <DeleteOutlineIcon
                sx={{
                  height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                  width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                }}
              />
            </span>
          </div>
        </div>
        <div className={classes.field}>
          <span className={classes.label}>Payment Link</span>
          <div className={classes.paymentLinkBox}>
            {item?.short_url ? (
              <Tooltip title="Copy Short Payment Link">
                <div className={classes.paymentLinkContainer}>
                  <ContentCopyIcon
                    sx={{
                      height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                      width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                      "& .MuiSvgIcon-root": {
                        fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                        borderRadius: "50%",
                      },
                      "&.Mui-checked": {
                        color: "#1976d2",
                      },
                      "& .MuiCheckbox-root": {
                        borderRadius: "50%",
                      },
                    }}
                    onClick={(e) =>
                      handleCopyToClipboard(
                        e,
                        item.short_url || "",
                        "Short payment link copied to clipboard!",
                      )
                    }
                  />
                </div>
              </Tooltip>
            ) : (
              <span className={classes.noPaymentLink}>--</span>
            )}
            {isSentId === item?.id && sentLoading ? (
              <LoadingBox
                loaderStyling={{
                  height:
                    "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem) !important",
                  width:
                    "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem) !important",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Checkbox
                  checked={item?.is_sent || false}
                  onChange={(e) => {
                    handleSent(item?.id, e.target.checked);
                    setIsSentId(item?.id || null);
                  }}
                  sx={{
                    padding: "4px",
                    "& .MuiSvgIcon-root": {
                      fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                      borderRadius: "50%",
                    },
                    "&.Mui-checked": {
                      color: "#1976d2",
                    },
                    "& .MuiCheckbox-root": {
                      borderRadius: "50%",
                    },
                  }}
                  icon={
                    <span
                      style={{
                        width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                        height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                        borderRadius: "50%",
                        border: "2px solid rgba(0, 0, 0, 0.54)",
                        display: "inline-block",
                      }}
                    />
                  }
                  checkedIcon={
                    <span
                      style={{
                        width: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                        height: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                        borderRadius: "50%",
                        border: "2px solid #1976d2",
                        backgroundColor: "#1976d2",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      ✓
                    </span>
                  }
                />
                <span
                  style={{
                    fontSize: "clamp(0.625rem, 0.525rem + 0.5vw, 1.125rem)",
                  }}
                >
                  Sent
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerOverviewMobileViewCard;
