import { useState, useCallback, memo, MouseEvent, CSSProperties } from "react";
import moment from "moment";
import classes from "./mobileView-card.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PaginationComponent from "@/components/global/pagination/pagination";
import LoadingBox from "@/components/global/loading-box/loading-box";
import { DataItem } from "@/services/dashboard/superAdmin/transactions/transaction.types";
import { getConclusionTypeStyles } from "@/utils/helpers/sessionType-styles";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import { Tooltip } from "@mui/material";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

interface MobileViewCardProps {
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

const DEFAULT_PROFILE_IMAGE = "/assets/images/dummyPic.png";

const MobileViewCard: React.FC<MobileViewCardProps> = ({
  data,
  currentPage = 1,
  totalPages = 1,
  totalCount = 0,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage = 50,
  handleDeleteModal,
  deleteLoading = false,
  setSortBy,
  sortBy = "session_date",
  inlineStyling,
}) => {
  const { role } = useParams();
  const [deleteTransactionIdState, setDeleteTransactionId] = useState<
    number | null
  >(null);
  const router = useRouter();

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

  return (
    <div className={classes.mobileViewContainer} style={inlineStyling}>
      {data?.map((item: DataItem, index: number) => {
        return (
          <div
            className={classes.container}
            key={item?.id}
            onClick={(e) =>
              item?.session_id
                ? handleRowClick(e, item.session_id)
                : toast.info("No session details available")
            }
          >
            <div className={classes.header}>
              <span className={classes.date}>
                {item?.deletedAt !== null
                  ? moment.utc(item.deletedAt).local().format("Do-MMM-YYYY")
                  : item?.createdAt
                    ? moment.utc(item.createdAt).local().format("Do-MMM-YYYY")
                    : "NoShow"}
              </span>
              {role !== "student" && role !== "teacher" && (
                <Tooltip title={"Delete Enrollment"} arrow>
                  <span
                    className={classes.iconBox}
                    onClick={(e) => handleDelete(e, item?.id)}
                  >
                    {deleteLoading && deleteTransactionIdState === item?.id ? (
                      <LoadingBox
                        loaderStyling={{
                          width: "4vh !important",
                          height: "4vh !important",
                        }}
                      />
                    ) : (
                      <Image
                        src="/assets/svgs/delete.svg"
                        alt="delete"
                        width={0}
                        height={0}
                        style={{
                          width: "var(--regular20-)",
                          height: "var(--regular20-)",
                        }}
                      />
                    )}
                  </span>
                </Tooltip>
              )}
            </div>
            <div className={classes.profileSection}>
              <div className={classes.field}>
                <h4 className={classes.label}>User Profile</h4>
                <UserProfile item={item} />
              </div>
              <div className={classes.field}>
                <h4 className={classes.label}>Info</h4>
                <InfoCell item={item} />
              </div>
              <div className={classes.field}>
                <span className={classes.label}>Session Type</span>
                <SessionType type={item?.sessionTransaction?.conclusion_type} />
              </div>
              <div className={classes.field}>
                <span className={classes.label}>Transaction Type</span>
                <TypeBadge type={item?.type} />
              </div>
              <div className={classes.field}>
                <span className={classes.label}>Session Date</span>
                <span>
                  {item?.session_date !== null
                    ? moment
                        .utc(item?.session_date)
                        .local()
                        .format("Do-MMM-YYYY HH:mm a")
                    : "No Show"}
                </span>
              </div>
              <div className={classes.field}>
                <span className={classes.label}>Amount</span>
                <span>{item?.cost ?? "0"}</span>
              </div>
              <div className={classes.field}>
                <span className={classes.label}>Remaining</span>
                <span>{item?.remaining_balance ?? "0"}</span>
              </div>
            </div>
          </div>
        );
      })}
      <PaginationComponent
        totalPages={totalPages}
        page={currentPage || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={totalCount || 0}
        onPageChange={handleChangePage}
        rowsPerPageChange={handleChangeRowsPerPage}
        dropDownValues={[50, 100, 200, 300]}
        inlineStyles={{ padding: "10px", width: "100%" }}
      />
    </div>
  );
};

export default MobileViewCard;

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
              backgroundColor: isStudent
                ? "var(--green-background-color4)"
                : "var(--purple-background-color1)",
              color: isStudent
                ? "var(--green-text-color4)"
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
    <div className={classes.infoCell}>
      {formattedName}
      &nbsp;&nbsp;
      <span
        style={{
          display: "inline-block",
          height: "20px",
          width: "1px",
          background: "var(--line-background-gradient-color)",
        }}
      ></span>
      &nbsp;&nbsp;
      {item?.enrollment?.subject?.name || "No Show"}
    </div>
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
  <span style={getConclusionTypeStyles(type || "N/A")}>
    {type || "No Show"}
  </span>
));

SessionType.displayName = "SessionType";
