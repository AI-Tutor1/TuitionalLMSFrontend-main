import React, {
  FC,
  memo,
  useCallback,
  useMemo,
  SyntheticEvent,
  useState,
} from "react";
import moment from "moment";
import classes from "./consumer-overview.module.css";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import Table from "./table/table";
import { Invoice } from "@/services/dashboard/superAdmin/invoices/invoices.types";
import LoadingBox from "@/components/global/loading-box/loading-box";
import SearchBox from "@/components/global/search-box/search-box";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import { useMediaQuery } from "react-responsive";
import ConsumerOverviewMobileViewCard from "@/components/ui/superAdmin/invoices/consumer-overview/consumerOverview-mobileView-card/consumerOverview-mobileView-card";
import PaginationComponent from "@/components/global/pagination/pagination";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import Button from "@/components/global/button/button";

// Constants moved outside component to prevent recreation
const STATUS_LIST = [
  { id: 0, name: "PAID" },
  { id: 1, name: "OVERDUE" },
  { id: 2, name: "PENDING" },
];
const DATE_PICKER_BOX_SHADOW =
  "0px -1px 10px 0px rgba(56, 182, 255, 0.35) inset";
const DROPDOWN_STYLES = {
  minWidth: "320px",
  flex: 1,
};

interface ConsumerOverviewProps {
  invoice: Invoice[];
  handlePaidModal: (id?: number, amount?: number) => void;
  handleDeleteModal: (id?: number) => void;
  currentPage?: number;
  totalPages?: number;
  totalCount?: number;
  handleChangePage?: any;
  handleChangeRowsPerPage?: any;
  rowsPerPage?: number;
  handleStudentsFilter: (
    event: SyntheticEvent<Element, Event>,
    value: any[],
  ) => void;
  selectedStudents: any[];
  loading?: boolean;
  handleDateChange: (value: moment.Moment | null) => void;
  handleDueDateChange: (value: moment.Moment | null) => void;
  dateFilterValue: moment.Moment | null;
  dueDateFilterValue: moment.Moment | null;
  handleSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
  handleStatus: (event: SyntheticEvent<Element, Event>, value: any[]) => void;
  handleSentStatus: (value: any) => void;
  status: string[];
  sentStatus: string;
  handleSent: (id?: number, is_sent?: boolean) => void;
  sentLoading: boolean;
  handleRefresh: () => void;
  allInvoicesRefetching: boolean;
  handleExcelData: () => void;
  excelDataIsLoading: boolean;
  handleInvoicePaymentLinkToStudent: (id: number | null) => void;
  handleInvoicePaymentLinkToStudentLoading: boolean;
  handleGenarateInvoices: () => void;
  generateInvoicesLoading: boolean;
}

const ConsumerOverview: FC<ConsumerOverviewProps> = ({
  invoice,
  handlePaidModal,
  handleDeleteModal,
  totalPages,
  totalCount,
  handleChangePage,
  handleChangeRowsPerPage,
  rowsPerPage,
  currentPage,
  handleStudentsFilter,
  selectedStudents,
  loading,
  handleDateChange,
  handleDueDateChange,
  dateFilterValue,
  dueDateFilterValue,
  handleSearch,
  search,
  handleStatus,
  handleSentStatus,
  status,
  sentStatus,
  handleSent,
  sentLoading,
  handleRefresh,
  handleExcelData,
  allInvoicesRefetching,
  excelDataIsLoading,
  handleInvoicePaymentLinkToStudent,
  handleInvoicePaymentLinkToStudentLoading,
  handleGenarateInvoices,
  generateInvoicesLoading,
}) => {
  const isMedium = useMediaQuery({ query: "(max-width: 1000px)" });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Optimize selector to only re-run when students actually change
  const students = useAppSelector(
    (state) => state?.usersByGroup?.students,
    // Shallow equality check for better performance
    (a, b) => a?.users === b?.users,
  );

  // Memoize filtered students
  const filteredStudents = useMemo(
    () => students?.users || [],
    [students?.users],
  );

  // Memoize selected students objects to prevent unnecessary re-renders
  const selectedStudentObjects = useMemo(
    () =>
      filteredStudents.filter((student) =>
        selectedStudents.includes(student?.name),
      ),
    [filteredStudents, selectedStudents],
  );

  const selectedStatusObjects = useMemo(
    () => STATUS_LIST.filter((statusObj) => status.includes(statusObj.name)),
    [status],
  );

  const handleToggleMobileFilters = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  // Memoize dropdown styles with box shadow
  const dropdownWithShadowStyles = useMemo(
    () => ({
      ...DROPDOWN_STYLES,
      boxShadow: DATE_PICKER_BOX_SHADOW,
    }),
    [],
  );

  // Memoize loading box styles
  const loadingBoxStyles = useMemo(
    () => ({
      flex: 1,
      minHeight: "500px",
    }),
    [],
  );

  // Memoize MobileFilterButton props
  const mobileFilterButtonProps = useMemo(
    () => ({
      onClick: handleToggleMobileFilters,
      isOpen: showMobileFilters,
    }),
    [handleToggleMobileFilters, showMobileFilters],
  );

  // Memoize SearchBox props
  const searchBoxProps = useMemo(
    () => ({
      placeholder: "Search student id",
      changeFn: handleSearch,
      value: search,
      inlineStyles: DROPDOWN_STYLES,
    }),
    [handleSearch, search],
  );

  // Memoize MultiSelectDropDown props
  const multiSelectDropDownProps = useMemo(
    () => ({
      placeholder: "Filter Student",
      data: filteredStudents,
      handleChange: handleStudentsFilter,
      value: selectedStudentObjects,
      inlineBoxStyles: {
        minWidth: "320px",
        flex: 1,
      },
      icon: true,
    }),
    [filteredStudents, handleStudentsFilter, selectedStudentObjects],
  );

  // Memoize FilterDropdown props
  const filterStatusDropdownProps = useMemo(
    () => ({
      placeholder: "Filter status",
      data: STATUS_LIST,
      handleChange: handleStatus,
      value: selectedStatusObjects,
      inlineBoxStyles: {
        minWidth: "320px",
        flex: 1,
      },
      icon: true,
    }),
    [handleStatus, selectedStatusObjects],
  );

  const filterBySentStatusDropdownProps = useMemo(
    () => ({
      placeholder: "Filter sent status",
      data: ["Sent", "Unsent"],
      handleChange: handleSentStatus,
      value: sentStatus,
      inlineBoxStyles: DROPDOWN_STYLES,
    }),
    [handleSentStatus, sentStatus],
  );

  // Memoize first DatePickerOriginal props
  const filterByDateProps = useMemo(
    () => ({
      placeholder: "Filter date",
      value: dateFilterValue,
      changeFn: handleDateChange,
      boxShadow: DATE_PICKER_BOX_SHADOW,
      flex: 1,
      minWidth: "320px",
    }),
    [handleDateChange, dateFilterValue],
  );

  // Memoize second DatePickerOriginal props
  const filterByDueDateProps = useMemo(
    () => ({
      placeholder: "Filter due date",
      value: dueDateFilterValue,
      changeFn: handleDueDateChange,
      boxShadow: DATE_PICKER_BOX_SHADOW,
      flex: 1,
      minWidth: "320px",
    }),
    [handleDueDateChange, dueDateFilterValue],
  );

  const ConsumerOverviewMobileViewCardProps = useMemo(
    () => ({
      handlePaidModal,
      handleDeleteModal,
      handleSent,
      sentLoading,
    }),
    [handlePaidModal, handleDeleteModal, handleSent, sentLoading],
  );

  // Memoize Table props
  const tableProps = useMemo(
    () => ({
      invoice,
      handlePaidModal,
      handleDeleteModal,
      handleSent,
      sentLoading,
      handleInvoicePaymentLinkToStudent,
      handleInvoicePaymentLinkToStudentLoading,
    }),
    [
      invoice,
      handlePaidModal,
      handleDeleteModal,
      handleSent,
      sentLoading,
      handleInvoicePaymentLinkToStudent,
      handleInvoicePaymentLinkToStudentLoading,
    ],
  );

  return (
    <main className={classes.consumerOverviewContainer}>
      <div className={classes.heading}>
        <div className={classes.headingSection}>
          <span>Consumer Overview </span>{" "}
          <div className={classes.iconBox} onClick={handleRefresh}>
            <RefreshIcon
              sx={{
                fontSize: "var(--regular18-)",
                color: "var(--pure-black-color) !important",
              }}
            />
          </div>
        </div>
        <div className={classes.buttonBox}>
          <Button
            text="Generate Invoices"
            clickFn={handleGenarateInvoices}
            loading={generateInvoicesLoading}
            inlineStyling={{ width: "150px" }}
          />
          <Button
            text="Get Excel Data"
            clickFn={handleExcelData}
            loading={excelDataIsLoading}
            inlineStyling={{ width: "150px" }}
          />
          <MobileFilterButton {...mobileFilterButtonProps} />
        </div>
      </div>
      {showMobileFilters && (
        <div className={classes.filtersContainer}>
          <FilterByDate {...filterByDateProps} />
          <FilterByDate {...filterByDueDateProps} />
          <SearchBox {...searchBoxProps} />
          <MultiSelectDropDown {...multiSelectDropDownProps} />
          <MultiSelectDropDown {...filterStatusDropdownProps} />
          <FilterDropdown {...filterBySentStatusDropdownProps} />
        </div>
      )}

      {loading ? (
        <LoadingBox inlineStyling={loadingBoxStyles} />
      ) : isMedium ? (
        <div className={classes.consumerOverviewMobileViewCardBox}>
          {invoice?.map((item) => (
            <ConsumerOverviewMobileViewCard
              key={item.id}
              item={item}
              {...ConsumerOverviewMobileViewCardProps}
            />
          ))}
        </div>
      ) : (
        <Table {...tableProps} />
      )}
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
        }}
      />
    </main>
  );
};

export default memo(ConsumerOverview, (prevProps, nextProps) => {
  return (
    prevProps.invoice === nextProps.invoice &&
    prevProps.loading === nextProps.loading &&
    prevProps.currentPage === nextProps.currentPage &&
    prevProps.totalPages === nextProps.totalPages &&
    prevProps.totalCount === nextProps.totalCount &&
    prevProps.rowsPerPage === nextProps.rowsPerPage &&
    prevProps.selectedStudents === nextProps.selectedStudents &&
    prevProps.dateFilterValue === nextProps.dateFilterValue &&
    prevProps.dueDateFilterValue === nextProps.dueDateFilterValue &&
    prevProps.search === nextProps.search &&
    prevProps.status === nextProps.status &&
    prevProps.sentStatus === nextProps.sentStatus &&
    prevProps.sentLoading === nextProps.sentLoading &&
    prevProps.allInvoicesRefetching === nextProps.allInvoicesRefetching &&
    prevProps.handlePaidModal === nextProps.handlePaidModal &&
    prevProps.handleDeleteModal === nextProps.handleDeleteModal &&
    prevProps.handleChangePage === nextProps.handleChangePage &&
    prevProps.handleChangeRowsPerPage === nextProps.handleChangeRowsPerPage &&
    prevProps.handleStudentsFilter === nextProps.handleStudentsFilter &&
    prevProps.handleDateChange === nextProps.handleDateChange &&
    prevProps.handleDueDateChange === nextProps.handleDueDateChange &&
    prevProps.handleSearch === nextProps.handleSearch &&
    prevProps.handleStatus === nextProps.handleStatus &&
    prevProps.handleSentStatus === nextProps.handleSentStatus &&
    prevProps.handleSent === nextProps.handleSent &&
    prevProps.handleRefresh === nextProps.handleRefresh
  );
});
