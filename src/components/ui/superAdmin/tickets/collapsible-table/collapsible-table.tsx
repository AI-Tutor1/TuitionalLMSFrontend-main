import {
  memo,
  useCallback,
  useState,
  CSSProperties,
  ChangeEvent,
  useMemo,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PaginationComponent from "@/components/global/pagination/pagination";
import moment from "moment";
import classes from "./collapsible-table.module.css";
import { useParams } from "next/navigation";
import { Tooltip } from "@mui/material";
import defaultClasses from "@/styles/table-styles.module.css";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

interface CollapsiblesProps {
  data?: any[];
  headData: { id: number; name: string; width: string }[];
  page?: number;
  totalPages?: number;
  totalEntries?: number;
  rowsPerPage?: number;
  onPageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  rowsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDeleteModal?: (id: number | null) => void;
  inlineStyling?: CSSProperties;
}

interface Column {
  id: number;
  name: string;
  width: string;
}

const iconProps = {
  width: 0,
  height: 0,
  style: {
    width: "var(--regular16-)",
    height: "var(--regular16-)",
  },
} as const;

// ── Collapsible Row ──────────────────────────────────────────────────
interface CollapsibleRowProps {
  item: any;
  role?: string | string[];
  headData: { id: number; name: string; width: string }[];
  handleRoute: (id: number, roleId: number, event: React.MouseEvent) => void;
  handleDeleteModal?: (id: number | null) => void;
  isOpen: boolean;
  onToggle: (id: number) => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "var(--green-color)";
    case "closed":
      return "var(--red-color1)";
    case "in_progress":
      return "var(--orange-color)";
    default:
      return "var(--darkGrey-color)";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "var(--red-color)";
    case "medium":
      return "var(--orange-color)";
    case "low":
      return "var(--green-color)";
    default:
      return "var(--darkGrey-color)";
  }
};

const CollapsibleRow = memo(function CollapsibleRow({
  item,
  role,
  headData,
  handleRoute,
  handleDeleteModal,
  isOpen,
  onToggle,
}: CollapsibleRowProps) {
  const parseEnrollmentName = useMemo(
    () => (name: string) => {
      const parts = name.split(" | ").map((part) => part.trim());
      const studentAndTutor = parts[0]?.split("/").map((part) => part.trim());
      return {
        studentName: studentAndTutor?.[0] || "N/A",
        tutorName: studentAndTutor?.[1]?.replace(" -", "").trim() || "N/A",
        curriculum: parts[1] || "N/A",
        board: parts[2] || "N/A",
        grade: parts[3] || "N/A",
        subject: parts[4] || "N/A",
      };
    },
    [],
  );

  const enrollmentDetails = useMemo(
    () =>
      item?.enrollment?.name ? parseEnrollmentName(item.enrollment.name) : null,
    [item?.enrollment?.name, parseEnrollmentName],
  );

  return (
    <>
      {/* ── Main row ── */}
      <div className={defaultClasses.tableRow}>
        {/* Collapse toggle */}
        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[0]?.width }}
        >
          <span
            onClick={() => onToggle(item.id)}
            className={defaultClasses.iconBox}
            style={{
              padding: "3px",
            }}
          >
            <KeyboardArrowDownIcon
              sx={{
                fontSize: "var(--regular18-)",
                color: "var(--pure-black-color)",
              }}
              aria-label={isOpen ? "Collapse row" : "Expand row"}
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s ease",
                cursor: "pointer",
              }}
            />
          </span>
        </div>
        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[1]?.width }}
        >
          <p>
            {" "}
            {item.createdAt
              ? moment.utc(item.createdAt).local().format("DD-MMM-YYYY")
              : "N/A"}
          </p>
        </div>
        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[2]?.width }}
        >
          <p
            style={{
              backgroundColor: getPriorityColor(item.priority),
              color: "white",
              width: "max-content",
              padding: "5px",
              borderRadius: "5px",
            }}
          >
            {item.priority?.split("_")[0].charAt(0).toUpperCase() +
              item.priority?.split("_")[0].slice(1) || "N/A"}
          </p>
        </div>

        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[3]?.width }}
        >
          <p
            style={{
              backgroundColor: getStatusColor(item.status),
              color: "white",
              width: "max-content",
              padding: "5px",
              borderRadius: "5px",
            }}
          >
            {item.status?.split("_")[0].charAt(0).toUpperCase() +
              item.status?.split("_")[0].slice(1) || "N/A"}
          </p>
        </div>

        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[4]?.width }}
        >
          <p className={`${defaultClasses.ellipsisCol}`}>
            {item.createdBy?.name?.split(" ").slice(0, 2).join(" ") || "N/A"}
          </p>
        </div>

        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[5]?.width }}
        >
          <p className={`${defaultClasses.ellipsisCol}`}>
            {item.recipients && item.recipients.length > 0 ? (
              <>
                {item.recipients[0]?.name?.split(" ").slice(0, 2).join(" ")}
                {item.recipients.length > 1 && (
                  <span style={{ color: "var(--main-blue-color)" }}>
                    {" "}
                    +{item.recipients.length - 1} more
                  </span>
                )}
              </>
            ) : (
              "N/A"
            )}
          </p>
        </div>

        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[6]?.width }}
        >
          {item.enrollment_id || "N/A"}
        </div>

        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[7]?.width }}
        >
          <p
            style={{
              backgroundColor: getPriorityColor(item.enrollment?.priority),
              color: "white",
              width: "max-content",
              padding: "5px",
              borderRadius: "5px",
            }}
          >
            {item.enrollment?.priority || "N/A"}
          </p>
        </div>

        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[8]?.width }}
        >
          <p className={`${defaultClasses.ellipsisCol}`}>
            {enrollmentDetails?.studentName?.split(" ").slice(0, 2).join(" ") ||
              "N/A"}
          </p>
        </div>

        <div
          className={defaultClasses.tableCell}
          style={{ width: headData[9]?.width }}
        >
          <p className={`${defaultClasses.ellipsisCol}`}>
            {enrollmentDetails?.tutorName?.split(" ").slice(0, 2).join(" ") ||
              "N/A"}
          </p>
        </div>
      </div>

      {/* ── Collapsible detail panel ── */}
      <div
        className={classes.collapseWrapper}
        style={{
          minHeight: isOpen ? "max-content" : "0px",
          opacity: isOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease, opacity 0.25s ease",
        }}
      >
        <div style={{ width: `calc(${headData[0]?.width} - 10px)` }}></div>
        <div className={classes.detailItem}>
          <span className={classes.detailLabel}>Grade</span>
          <span className={classes.detailValue}>
            {enrollmentDetails?.grade || "N/A"}
          </span>
        </div>
        <div className={classes.detailItem}>
          <span className={classes.detailLabel}>Curriculum</span>
          <span className={classes.detailValue}>
            {enrollmentDetails?.curriculum || "N/A"}
          </span>
        </div>
        <div className={classes.detailItem}>
          <span className={classes.detailLabel}>Subject</span>
          <span className={classes.detailValue}>
            {enrollmentDetails?.subject || "N/A"}
          </span>
        </div>
        <div className={classes.detailItem}>
          <span className={classes.detailLabel}>Board</span>
          <span className={classes.detailValue}>
            {enrollmentDetails?.board || "N/A"}
          </span>
        </div>
        <div className={classes.detailItem}>
          <span className={classes.detailLabel}>Actions</span>
          <Tooltip title={"Delete Ticket"} arrow>
            <span
              className={classes.iconBox}
              onClick={(e) => {
                e.stopPropagation();
                if (handleDeleteModal) handleDeleteModal(item.id);
              }}
            >
              <Image
                src="/assets/svgs/delete.svg"
                alt="delete"
                width={0}
                height={0}
                style={{
                  width: "var(--regular16-)",
                  height: "var(--regular16-)",
                }}
              />
            </span>
          </Tooltip>
        </div>
      </div>
    </>
  );
});

// ── Main Table ───────────────────────────────────────────────────────
const CollapsibleTable = memo(function CollapsibleTable({
  data,
  headData,
  page,
  totalPages,
  totalEntries,
  rowsPerPage,
  onPageChange,
  rowsPerPageChange,
  handleDeleteModal,
  inlineStyling,
}: CollapsiblesProps) {
  const { role } = useParams();
  const router = useRouter();

  // Track which single row is open (null = all closed)
  const [openRowId, setOpenRowId] = useState<number | null>(null);

  const handleToggle = useCallback((id: number) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleRoute = useCallback(
    (id: number, roleId: number, event: React.MouseEvent) => {
      const targetPath = `/${role}/counselling/${id}?roleId=${roleId}`;
      if (event.ctrlKey || event.metaKey) {
        window.open(targetPath, "_blank");
      } else {
        router.push(targetPath);
      }
    },
    [router, role],
  );

  return (
    <div className={defaultClasses.tableContainer} style={inlineStyling}>
      <div className={defaultClasses.tableChild}>
        <div className={defaultClasses.tableHead}>
          {headData?.map((item: Column) => (
            <p
              className={defaultClasses.tableHeadCell}
              key={item.id}
              style={{ width: item.width }}
            >
              {item.name}
            </p>
          ))}
        </div>
        <div className={defaultClasses.tableBody}>
          {data?.map((item: any) => (
            <CollapsibleRow
              key={item.id}
              item={item}
              role={role}
              headData={headData}
              handleRoute={handleRoute}
              handleDeleteModal={handleDeleteModal}
              isOpen={openRowId === item.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
      <PaginationComponent
        totalPages={totalPages}
        page={page || 0}
        rowsPerPage={rowsPerPage || 0}
        totalEntries={totalEntries || 0}
        onPageChange={onPageChange}
        rowsPerPageChange={rowsPerPageChange}
        dropDownValues={[50, 100, 200]}
        inlineStyles={{
          padding: "5px 10px",
          borderTop: "1px solid var(--color-dashboard-border)",
        }}
      />
    </div>
  );
});

export default CollapsibleTable;
