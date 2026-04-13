import {
  useState,
  useCallback,
  memo,
  MouseEvent,
  CSSProperties,
  useMemo,
} from "react";
import moment from "moment";
import classes from "./transaction-table.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PaginationComponent from "@/components/global/pagination/pagination";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { DataItem } from "@/services/dashboard/superAdmin/transactions/transaction.types";
import { getConclusionTypeStyles } from "@/utils/helpers/sessionType-styles";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import { Tooltip } from "@mui/material";
import { useParams } from "next/navigation";

interface TransactionsTablesProps {
  data: DataItem[];
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  handleDeleteModal?: (e: React.MouseEvent, id: number) => void;
  deleteTransactionId?: number | null;
  handleEditModal?: (e: React.MouseEvent, id: number) => void;
  role?: string;
  deleteLoading?: boolean;
  sortBy?: "session_date" | "createdAt";
  setSortBy?: (sortBy: "session_date" | "createdAt") => void;
  inlineStyling?: CSSProperties;
}

// Constant definitions outside the component
const HEAD_DATA = [
  {
    id: 0,
    name: "User Profile",
    width: "15%",
    sort: false,
    key: "userProfile",
  },
  { id: 1, name: "Info", width: "15%", sort: false, key: "info" },
  { id: 2, name: "Date", width: "10%", sort: true, key: "createdAt" },
  {
    id: 3,
    name: "Session Type",
    width: "10%",
    sort: false,
    key: "sessionType",
  },
  {
    id: 4,
    name: "Session Date",
    width: "17.5%",
    sort: true,
    key: "session_date",
  },
  {
    id: 5,
    name: "Transaction Type",
    width: "11%",
    sort: false,
    key: "transactionType",
  },
  { id: 6, name: "Amount", width: "7.5%", sort: false, key: "amount" },
  {
    id: 7,
    name: "Remaining ",
    width: "7.5%",
    sort: false,
    key: "remainingBalance",
  },
  { id: 8, name: "Actions", width: "6.5%", sort: false, key: "actions" },
];

const DEFAULT_PROFILE_IMAGE = "/assets/images/static/demmyPic.png";

// Helper components
const UserProfile = memo(({ item }: { item: DataItem }) => {
  const isStudent =
    item?.user_id === item?.enrollment?.studentsGroups?.[0]?.user?.id;

  return (
    <div className={classes.userProfile}>
      <span className={classes.imageBox}>
        <Image
          src={item?.transactions?.profileImageUrl || DEFAULT_PROFILE_IMAGE}
          alt={item?.transactions?.name || "User"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </span>
      <span className={classes.profileContainer}>
        {item?.transactions?.name
          ? item?.transactions?.name.trim()?.split(" ").slice(0, 2).join(" ")
          : "No Show"}

        {item?.session_id && (
          <span
            className={classes.role}
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              width: "max-content",
              backgroundColor: isStudent
                ? "var(--green-background-color4)"
                : "var(--purple-background-color1)",
              color: isStudent
                ? "var(--green-text-color3)"
                : "var(--purple-text-color1)",
            }}
          >
            {isStudent ? "Student" : "Teacher"}
          </span>
        )}
      </span>
    </div>
  );
});

UserProfile.displayName = "UserProfile";

const InfoCell = memo(({ item }: { item: DataItem }) => {
  if (item?.deletedAt !== null) return <span>Deleted</span>;
  if (!item?.session_id) return <span>Manually added</span>;

  const isStudent =
    item?.user_id === item?.enrollment?.studentsGroups?.[0]?.user?.id;
  const nameToShow = isStudent
    ? item?.enrollment?.tutor?.name
    : item?.enrollment?.studentsGroups?.[0]?.user?.name;

  const formattedName =
    nameToShow?.trim()?.split(" ")?.slice(0, 1)?.join(" ") || "No Show";

  return (
    <>
      {formattedName}
      &nbsp;&nbsp;
      <span
        style={{
          height: "100%",
          width: "1px",
          background: "var(--line-background-gradient-color)",
        }}
      ></span>
      &nbsp;&nbsp;
      {item?.enrollment?.subject?.name || "No Show"}
    </>
  );
});

InfoCell.displayName = "InfoCell";

const TypeBadge = memo(({ type }: { type?: string }) => (
  <span
    style={{
      background: type === "Debit" ? "var(--red-color)" : "var(--green-color)",
      padding: "5px 10px",
      borderRadius: "5px",
      color: "var(--pure-white-color)",
      width: "max-content",
      textAlign: "center",
    }}
  >
    {type || "No Show"}
  </span>
));

TypeBadge.displayName = "TypeBadge";

const SessionType = memo(({ type }: { type?: string }) => (
  <span style={getConclusionTypeStyles(type || "Not Available")}>
    {type || "No Show"}
  </span>
));

SessionType.displayName = "SessionType";

function TransactionsTable({
  data,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage = 50,
  handleDeleteModal,
  role,
  deleteLoading = false,
  setSortBy,
  sortBy = "session_date",
  inlineStyling,
}: TransactionsTablesProps) {
  const router = useRouter();
  const [deleteTransactionIdState, setDeleteTransactionId] = useState<
    number | null
  >(null);

  const visibleHeadData = useMemo(() => {
    if (role === "teacher" || role === "student") {
      return HEAD_DATA.filter((item) => item.id !== 8);
    } else {
      return HEAD_DATA;
    }
  }, []);

  // Memoized handlers
  const handleRowClick = useCallback(
    (event: MouseEvent<HTMLElement>, sessionId: number) => {
      if (event.ctrlKey || event.metaKey) {
        window.open(`/${role}/session-details/${sessionId}`, "_blank");
      } else {
        router.push(`/${role}/session-details/${sessionId}`);
      }
    },
    [router, role],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent, id?: number) => {
      e.stopPropagation();
      if (id) {
        setDeleteTransactionId(id);
        handleDeleteModal?.(e, id);
      }
    },
    [handleDeleteModal],
  );

  const handleSortClick = useCallback(
    (sort_by: "session_date" | "createdAt") => {
      setSortBy?.(sort_by);
    },
    [setSortBy],
  );

  // Render optimized row
  const renderTableRow = useCallback(
    (item: DataItem) => {
      const formattedDate =
        item?.deletedAt !== null
          ? moment.utc(item.deletedAt).local().format("Do-MMM-YYYY")
          : item?.createdAt
            ? moment.utc(item.createdAt).local().format("Do-MMM-YYYY")
            : "No Show";

      return (
        <div
          key={item?.id}
          className={classes.tableRow}
          onClick={(e) =>
            (role === "superAdmin" ||
              role === "admin" ||
              role === "manager" ||
              role === "hr" ||
              role === "counsellor") &&
            item?.session_id &&
            handleRowClick(e, item.session_id)
          }
        >
          {/* User Profile */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[0].width }}
          >
            <UserProfile item={item} />
          </div>

          {/* Info */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[1].width }}
          >
            <InfoCell item={item} />
          </div>

          {/* Date */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[2].width }}
          >
            {formattedDate}
          </div>

          {/* Session Type */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[3].width }}
          >
            <SessionType type={item?.sessionTransaction?.conclusion_type} />
          </div>

          {/* Updated at */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[4].width }}
          >
            {item?.session_date !== null
              ? moment
                  .utc(item?.session_date)
                  .local()
                  .format("Do-MMM-YYYY HH:mm a")
              : "No Show"}
          </div>

          {/* Transaction Type */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[5].width }}
          >
            <TypeBadge type={item?.type} />
          </div>

          {/* Amount */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[6].width }}
          >
            {item?.cost ?? "0"}
          </div>

          {/* Remaining Balance */}
          <div
            className={classes.tableCell}
            style={{ width: HEAD_DATA[7].width }}
          >
            {item?.remaining_balance ?? "0"}
          </div>

          {/* Actions */}
          {role !== "teacher" && role !== "student" && (
            <div
              className={classes.tableCell}
              style={{ width: HEAD_DATA[8].width }}
            >
              <Tooltip title={"Delete"} placement="bottom" arrow>
                <span className={classes.iconsContainer}>
                  {deleteLoading && deleteTransactionIdState === item?.id ? (
                    <LoadingBox
                      loaderStyling={{
                        width: "var(--regular18-) !important",
                        height: "var(--regular18-) !important",
                      }}
                    />
                  ) : (
                    <span
                      className={classes.iconBox}
                      onClick={(e) => handleDelete(e, item?.id)}
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
                  )}
                </span>
              </Tooltip>
            </div>
          )}
        </div>
      );
    },
    [deleteLoading, deleteTransactionIdState, handleDelete, handleRowClick],
  );

  return (
    <div className={classes.table} style={inlineStyling}>
      <div className={classes.tableChild}>
        <div className={classes.tableHead}>
          {visibleHeadData?.map((item) => (
            <div
              className={classes.tableHeadCell}
              key={item.id}
              style={{
                width: item.width,
                display: "flex",
                alignItems: "center",
              }}
            >
              {item.name}
              {item.sort && (
                <SwapVertRoundedIcon
                  onClick={() =>
                    item?.key &&
                    handleSortClick(item.key as "session_date" | "createdAt")
                  }
                  sx={{
                    cursor: "pointer",
                    marginLeft: "5px",
                    color:
                      sortBy === item.key
                        ? "var(--blue-color3)"
                        : "var(--pure-white-color)",
                    fontSize: "var(--regular18-)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
        <div className={classes.tableBody}>{data?.map(renderTableRow)}</div>
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage}
        rowsPerPage={rowsPerPage}
        totalEntries={totalCount}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200]}
        inlineStyles={{
          padding: "5px 10px",
          borderTop: "1px solid var(--color-dashboard-border)",
        }}
      />
    </div>
  );
}

export default memo(TransactionsTable);
