import React, { FC, memo, useState } from "react";
import { toast } from "react-toastify";
import classes from "./table.module.css";
import moment from "moment";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Invoice } from "@/services/dashboard/superAdmin/invoices/invoices.types";
import ErrorBox from "@/components/global/error-box/error-box";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Tooltip, Checkbox } from "@mui/material";
import LoadingBox from "@/components/global/loading-box/loading-box";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";

interface Column {
  id: number;
  name: string;
  width: string;
}

interface TtableProps {
  invoice: Invoice[];
  handlePaidModal: (id?: number, amount?: number) => void;
  handleDeleteModal: (id?: number) => void;
  handleSent: (id?: number, is_sent?: boolean) => void;
  sentLoading: boolean;
  handleInvoicePaymentLinkToStudent: (id: number | null) => void;
  handleInvoicePaymentLinkToStudentLoading: boolean;
}

const headData: Column[] = [
  { id: 0, width: "5%", name: "Id" },
  { id: 1, width: "12.5%", name: "Student Name" },
  { id: 2, width: "11.5%", name: "Issue Date" },
  { id: 3, width: "11.5%", name: "Due Date" },
  { id: 4, width: "10%", name: "Invoice ID" },
  { id: 5, width: "9%", name: "Balance" },
  { id: 6, width: "6.5%", name: "Paid" },
  { id: 7, width: "9%", name: "Status" },
  { id: 8, width: "15%", name: "Actions" },
  { id: 9, width: "10%", name: "Payment Link" },
];

const Ttable: FC<TtableProps> = ({
  invoice = [],
  handlePaidModal,
  handleDeleteModal,
  handleSent,
  sentLoading,
  handleInvoicePaymentLinkToStudent,
  handleInvoicePaymentLinkToStudentLoading,
}) => {
  const [isSentId, setIsSentId] = useState<number | null>(null);
  const [
    handleInvoicePaymentLinkToStudentId,
    setHandleInvoicePaymentLinkToStudentId,
  ] = useState<number | null>(null);

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
    <div className={classes.table}>
      <div className={classes.tableChild}>
        <div className={classes.tableHead}>
          {headData.map((item, indx) => (
            <div
              className={classes.tableHeadCell}
              key={item.id}
              style={{ width: headData[indx]?.width }}
            >
              {item.name}
            </div>
          ))}
        </div>
        <div className={classes.tableBody}>
          {invoice?.length > 0 ? (
            invoice?.map((item) => (
              <div className={classes.tableRow} key={item.id}>
                {/* Student ID */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[0]?.width }}
                >
                  {item?.userInvoice?.id || "N/A"}
                </div>
                {/* Student Name */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[1]?.width }}
                >
                  {item?.userInvoice?.name
                    ?.trim()
                    .split(" ")
                    .slice(0, 2)
                    .join(" ") || "No Show"}
                </div>
                {/* Issue Date */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[2]?.width }}
                >
                  {item?.createdAt
                    ? moment.utc(item.createdAt).local().format("Do-MMM-YYYY")
                    : "No Show"}
                </div>
                {/* Due Date */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[3]?.width }}
                >
                  {item?.due_date
                    ? moment.utc(item.due_date).local().format("Do-MMM-YYYY")
                    : "No Show"}
                </div>
                {/* Invoice ID */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[4]?.width }}
                >
                  {item?.id || "No Show"}
                </div>
                {/* Balance */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[5]?.width }}
                >
                  {item?.amount || "0"}
                </div>
                {/* Paid */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[6]?.width }}
                >
                  {item?.amount_paid || "0"}
                </div>
                {/* Status */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[7]?.width }}
                >
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "5px",
                      background:
                        item?.status === "PENDING"
                          ? "var(--orange-background-color1)"
                          : item?.status === "PAID"
                            ? "var(--green-background-color4)"
                            : item?.status === "OVERDUE"
                              ? "var(--red-background-color2)"
                              : "gray",
                      color:
                        item?.status === "PENDING"
                          ? "var(--red-color2)"
                          : item?.status === "PAID"
                            ? "var(--green-text-color4)"
                            : item?.status === "OVERDUE"
                              ? "var(--red-color2)"
                              : "gray",
                    }}
                  >
                    {item?.status
                      ? item?.status?.charAt(0).toUpperCase() +
                        item?.status?.slice(1).toLowerCase()
                      : "No Show"}
                  </span>
                </div>
                {/* Actions */}
                <div
                  className={classes.tableColumn}
                  style={{
                    display: "flex",
                    gap: "10px",
                    width: headData[8]?.width,
                  }}
                >
                  <span
                    className={classes.iconBox}
                    onClick={() => {
                      setHandleInvoicePaymentLinkToStudentId(item.id || null);
                      handleInvoicePaymentLinkToStudent(item.id || null);
                    }}
                  >
                    {item?.id === handleInvoicePaymentLinkToStudentId &&
                    handleInvoicePaymentLinkToStudentLoading ? (
                      <LoadingBox
                        loaderStyling={{
                          height: "var(--regular18-) !important",
                          width: "var(--regular18-) !important",
                          color: "var(--main-color)",
                        }}
                      />
                    ) : (
                      <SendIcon
                        sx={{
                          fontSize: "var(--regular18-)",
                          color: "var(--pure-black-color) !important",
                          transform: "rotate(-30deg) translateY(-1px)",
                        }}
                      />
                    )}
                  </span>
                  <span
                    className={classes.iconBox}
                    onClick={() => {
                      if (item.pdf_content) {
                        handleDownloadPdf(
                          item.pdf_content,
                          `invoice_${item.id}.pdf`,
                        );
                      } else {
                        toast.error(
                          "No PDF content available for this invoice.",
                        );
                      }
                    }}
                  >
                    <FileDownloadOutlinedIcon
                      sx={{
                        fontSize: "var(--regular18-)",
                        color: "var(--pure-black-color) !important",
                      }}
                    />
                  </span>
                  <span
                    className={classes.iconBox}
                    onClick={() => handlePaidModal(item?.id, item?.amount)}
                  >
                    <RefreshIcon
                      sx={{
                        fontSize: "var(--regular18-)",
                        color: "var(--pure-black-color) !important",
                      }}
                    />
                  </span>
                  <span
                    className={classes.iconBox}
                    onClick={() => handleDeleteModal(item?.id)}
                  >
                    <DeleteOutlineIcon
                      sx={{
                        fontSize: "var(--regular18-)",
                        color: "var(--pure-black-color) !important",
                      }}
                    />
                  </span>
                </div>
                {/* Payment Link */}
                <div
                  className={classes.tableColumn}
                  style={{ width: headData[9]?.width }}
                >
                  <div className={classes.paymentLinkBox}>
                    {item?.short_url ? (
                      <Tooltip title="Copy Short Payment Link">
                        <div className={classes.iconBox}>
                          <ContentCopyIcon
                            sx={{
                              fontSize: "var(--regular18-)",
                              color: "var(--pure-black-color) !important",
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
                          height: "var(--regular18-) !important",
                          width: "var(--regular18-) !important",
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
                          checked={item.is_sent || false}
                          onChange={(e) => {
                            handleSent(item?.id, e.target.checked);
                            setIsSentId(item.id || null);
                          }}
                          sx={{
                            padding: "4px",
                            "& .MuiSvgIcon-root": {
                              fontSize: "var(--regular18-)",
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
                                width: "var(--regular18-)",
                                height: "var(--regular18-)",
                                borderRadius: "50%",
                                border: "2px solid var(--black-color)",
                                display: "inline-block",
                              }}
                            />
                          }
                          checkedIcon={
                            <span
                              style={{
                                width: "var(--regular18-)",
                                height: "var(--regular18-)",
                                borderRadius: "50%",
                                border: "2px solid #1976d2",
                                backgroundColor: "#1976d2",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "var(--regular18-)",
                              }}
                            >
                              ✓
                            </span>
                          }
                        />
                        <span
                          style={{
                            fontSize: "var(--regular18-)",
                          }}
                        >
                          Sent
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <ErrorBox inlineStyling={{ height: "100%" }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Ttable);
