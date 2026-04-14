import React, { FC, memo, useState, useMemo } from "react";
import classes from "./table.module.css";
import Image from "next/image";
import moment from "moment";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import PaginationComponent from "@/components/global/pagination/pagination";
import ErrorBox from "@/components/global/error-box/error-box";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { Payouts_List } from "@/types/payouts/getPayoutForMonth";

interface Column {
  id: number;
  name: string;
  width: string;
}

interface TtableProps {
  payouts?: Payouts_List[];
  totalPages?: number;
  totalCount?: number;
  handleChangePage: (event: unknown, newPage: number) => void;
  handleChangeRowsPerPage: (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => void;
  rowsPerPage?: number;
  currentPage?: number;
  handleChangeStatus?: (payoutId: string) => void;
  loading?: boolean;
}

interface SessionSummary {
  enrollment_id: number | null;
  tutor_hourly_rate: number | null;
  name: string;
  session_count: number;
  conclusion_type: string;
  duration: number;
}

interface TooltipProps {
  sessionSummary?: SessionSummary[];
}

const headData: Column[] = [
  { id: 1, width: "20%", name: "Tutor Name" },
  { id: 2, width: "15%", name: "Period" },
  { id: 3, width: "15%", name: "Total Session Count" },
  { id: 4, width: "15%", name: "Balance" },
  { id: 5, width: "20%", name: "Session Count" },
  { id: 6, width: "15%", name: "Status" },
];

const Ttable: FC<TtableProps> = ({
  payouts = [],
  totalPages,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  currentPage,
  handleChangeStatus,
  loading,
}) => {
  const [activeTooltipId, setActiveTooltipId] = useState<
    string | number | null
  >(null);
  const [payoutId, setPayoutId] = useState<number | null>(null);

  // Calculate total paid and total pending amounts with counts
  const payoutTotals = useMemo(() => {
    return payouts.reduce(
      (acc, item) => {
        const balance = Number(item?.balance) || 0;

        if (item.status === "Paid") {
          acc.totalPaid += balance;
          acc.paidCount += 1;
        } else if (item.status === "Due") {
          acc.totalPending += balance;
          acc.pendingCount += 1;
        }

        return acc;
      },
      { totalPaid: 0, totalPending: 0, paidCount: 0, pendingCount: 0 },
    );
  }, [payouts]);

  const handleLogoBoxClick = (id: string | number) => {
    setActiveTooltipId(id);
  };

  const updateStatus = async (payloadId: number) => {
    handleChangeStatus?.(String(payloadId));
    setPayoutId(payloadId);
  };

  return (
    <div className={classes.table} onClick={() => setActiveTooltipId(null)}>
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
        {payouts?.length > 0 ? (
          payouts?.map((item: Payouts_List) => (
            <div className={classes.tableRow} key={item.id}>
              <div
                className={classes.tableColumn}
                style={{ width: headData[0]?.width }}
              >
                <div className={classes.infoBox}>
                  <span className={classes.imageBox}>
                    <Image
                      src={
                        item?.userPayout?.profileImageUrl ||
                        "/assets/images/dummyPic.png"
                      }
                      alt="Profile placeholder"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </span>
                  {item?.userPayout?.name
                    ? item?.userPayout?.name
                        .trim()
                        .split(" ")
                        .slice(0, 2)
                        .join(" ")
                    : "No Show"}
                </div>
              </div>
              <div
                className={classes.tableColumn}
                style={{ width: headData[1]?.width }}
              >
                {item?.start_date
                  ? moment.utc(item.start_date).local().format("MMM-YYYY")
                  : "No Show"}
              </div>
              <div
                className={classes.tableColumn}
                style={{ width: headData[2]?.width }}
              >
                {item?.total_sessions || "0"}
              </div>
              <div
                className={classes.tableColumn}
                style={{ width: headData[3]?.width }}
              >
                AED {item?.balance || "No Show"}
              </div>
              <div
                className={classes.tableColumn}
                style={{ width: headData[4]?.width }}
              >
                <div className={classes.sessionCountBox}>
                  Session Count Summary{" "}
                  <div
                    className={classes.logoBox}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogoBoxClick(item?.id);
                    }}
                  >
                    <KeyboardDoubleArrowRightIcon />
                    {item.id === activeTooltipId && (
                      <Tooltip sessionSummary={item?.sessionSummary} />
                    )}
                  </div>
                </div>
              </div>
              <div
                className={classes.tableColumn}
                style={{ width: headData[5]?.width }}
              >
                {payoutId === item?.id && loading ? (
                  <LoadingBox
                    inlineStyling={{
                      height: "max-content",
                      width: "max-content",
                    }}
                    loaderStyling={{
                      width: "3vh !important",
                      height: "3vh !important",
                    }}
                  />
                ) : (
                  <div
                    className={classes.status}
                    style={
                      item.status === "Paid"
                        ? {
                            backgroundColor: "var(--green-background-color4)",
                            color: "var(--green-text-color4)",
                          }
                        : {
                            backgroundColor: "var(--red-background-color1)",
                            color: "var(--red-text-color2)",
                          }
                    }
                    onClick={() => updateStatus(item?.id)}
                  >
                    {item?.status === "Due"
                      ? "Mark as paid"
                      : item?.status || "No Show"}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <ErrorBox />
        )}
      </div>
      <div className={classes.countBox}>
        <div
          style={{
            color: "var(--green-text-color4)",
            background: "var(--green-background-color4)",
          }}
        >
          <div>
            <span>Total Paid ({payoutTotals.paidCount}): </span>
            <strong>AED {payoutTotals.totalPaid.toFixed(2)}</strong>
          </div>
        </div>
        <div
          style={{
            color: "var(--red-text-color1)",
            background: "var(--red-background-color2)",
          }}
        >
          <div>
            <span>Total Pending ({payoutTotals.pendingCount}): </span>
            <strong>AED {payoutTotals.totalPending.toFixed(2)}</strong>
          </div>
        </div>
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={totalCount || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 75, 100]}
        inlineStyles={{
          height: "max-content",
          padding: "10px 20px",
          borderTop: "1px solid var(--color-dashboard-border)",
        }}
      />
    </div>
  );
};

export default memo(Ttable);

const Tooltip: FC<TooltipProps> = ({ sessionSummary }) => {
  return (
    <div className={classes.tooltip}>
      {/* Header Row */}
      <div className={classes.tooltipRow}>
        <p>Name</p>
        <p>Session Count</p>
        <p>Duration</p>
        <p>Hourly Rate</p>
        <p>Total Cost</p>
      </div>

      {/* Data Rows */}
      {sessionSummary?.map((item: any, index: number) => (
        <div className={classes.tooltipRow} key={index}>
          <p>{item?.name || ""}</p>
          <p>{item?.session_count || 0}</p>
          <p>
            {item?.duration
              ? moment.duration(item?.duration, "minutes").asHours()
              : 0}
          </p>
          <p>{item?.tutor_hourly_rate || 0}</p>
          <p>
            {item?.tutor_hourly_rate && item?.session_count && item?.duration
              ? item?.tutor_hourly_rate *
                item?.session_count *
                Number(
                  moment
                    .duration(item?.duration, "minutes")
                    .asHours()
                    .toLocaleString(),
                )
              : 0}
          </p>
        </div>
      ))}
    </div>
  );
};
