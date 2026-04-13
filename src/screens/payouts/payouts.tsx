import React, {
  FC,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ChangeEvent,
} from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import moment from "moment";
import classes from "./payouts.module.css";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import useDebounce from "@/utils/helpers/useDebounce";
import Table from "@/components/ui/superAdmin/tutor-payouts/table/table";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import SearchBox from "@/components/global/search-box/search-box";
import { MyAxiosError } from "@/services/error.type";
import {
  getTutorPayouts,
  generateUpdateTutorPayouts,
  updatePayoutStatus,
} from "@/services/dashboard/superAdmin/payouts/payouts";
import { Generate_Update_Payouts_Api_Response_Type } from "@/types/payouts/generateOrUpdatePayout.type";
import { UpdatePayoutStatusType_Api_Response_Type } from "@/types/payouts/updatePayoutStatus.type";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import Button from "@/components/global/button/button";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";

const searchBoxStyles = {
  minWidth: "320px",
  flex: 1,
};

const inputStyles = {
  paddingLeft: "0px",
};

const TutorPayouts: FC = () => {
  const { token } = useAppSelector((state) => state?.user);
  const generateYearOptions = useMemo(() => {
    const currentYear = moment().year();
    const yearsBack = 4; // Show 3 years in the past
    const yearsForward = 25; // Show 25 years in the future
    return Array.from({ length: yearsBack + yearsForward + 1 }, (_, i) =>
      (currentYear - yearsBack + i).toString(),
    );
  }, []);
  const MONTH_OPTIONS = useMemo(() => moment.months(), []);
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  // State for UI controls
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [excelDataLoading, setExcelDataLoading] = useState(false);
  // Use debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 1500);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  // Event handlers with useCallback
  const handleChangePage = useCallback((e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(event.target.value));
      setCurrentPage(1);
    },
    [],
  );

  const handleSearch = useCallback((e: any) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleFilterByStatus = useCallback((value: string) => {
    setStatus(value);
  }, []);

  const handleFilterByMonth = useCallback((value: string) => {
    setMonth(value);
  }, []);

  const getMonthNumber = useCallback((monthName: string): number => {
    const monthIndex = moment.months().indexOf(monthName);
    return monthIndex + 1;
  }, []);

  const handleFilterByYear = useCallback((value: string) => {
    setYear(value);
  }, []);

  // Fetch data with React Query
  const { data, error, isFetching, refetch, isRefetching } = useQuery({
    queryKey: [
      "tutorPayouts",
      currentPage,
      rowsPerPage,
      debouncedSearchQuery,
      status,
      month,
      year,
    ],
    queryFn: () => {
      return getTutorPayouts(
        {
          month: month
            ? getMonthNumber(month)
            : moment().subtract(1, "month").month() + 1,
          year: year
            ? year
            : moment().subtract(1, "month").month() + 1 === 12
              ? moment().year() - 1
              : moment().year(),
          page: currentPage,
          limit: rowsPerPage,
          search: debouncedSearchQuery || "",
          status,
          exportData: false,
        },
        {
          token,
        },
      );
    },
    staleTime: 30000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const handleExportData = useCallback(async () => {
    try {
      setExcelDataLoading(true);
      const response = await getTutorPayouts(
        {
          month: month
            ? getMonthNumber(month)
            : moment().subtract(1, "month").month() + 1,
          year: year
            ? year
            : moment().subtract(1, "month").month() + 1 === 12
              ? moment().year() - 1
              : moment().year(),
          page: currentPage,
          limit: rowsPerPage,
          search: debouncedSearchQuery || "",
          status,
          exportData: true,
        },
        {
          token,
        },
      );
      if (response?.message) {
        toast.success(response?.message);
        setExcelDataLoading(false);
      }
    } catch (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? axiosError.response.data.message
            : axiosError.response.data?.error
              ? axiosError.response.data.error
              : `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
      setExcelDataLoading(false);
    }
  }, [currentPage, rowsPerPage, debouncedSearchQuery, status, month, year]);

  // update tutor payout status
  const handleGenerateUpdatePayouts = useMutation({
    mutationFn: () => generateUpdateTutorPayouts({ token }),
    onSuccess: (data: Generate_Update_Payouts_Api_Response_Type) => {
      data?.message
        ? toast.success(data?.message)
        : "Payouts Processed Successfully.";
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? axiosError.response.data.message
            : axiosError.response.data?.error
              ? axiosError.response.data.error
              : `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleUpdateTutorPayouts = useMutation({
    mutationFn: (payoutId: string) => updatePayoutStatus(payoutId, { token }),
    onSuccess: (data: UpdatePayoutStatusType_Api_Response_Type) => {
      data?.message
        ? toast.success(data?.message)
        : "Payout status updated successfully.";
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? axiosError.response.data.message
            : axiosError.response.data?.error
              ? axiosError.response.data.error
              : `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: { width: "max-content", alignSelf: "flex-end" },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  const searchBoxProps = useMemo(
    () => ({
      placeholder: "Search",
      inlineStyles: searchBoxStyles,
      inlineInputStyles: inputStyles,
      changeFn: handleSearch,
      value: searchQuery,
    }),
    [inputStyles, handleSearch, searchQuery],
  );

  const filterByStatusProps = useMemo(
    () => ({
      placeholder: "Filter By status",
      data: ["Paid", "Due"],
      handleChange: handleFilterByStatus,
      value: status,
      inlineBoxStyles: {
        ...searchBoxStyles,
        minWidth: "250px",
      },
    }),
    [handleFilterByStatus, status],
  );

  const filterByMonthProps = useMemo(
    () => ({
      placeholder: "Filter By month",
      data: MONTH_OPTIONS,
      handleChange: handleFilterByMonth,
      value: month,
      inlineBoxStyles: {
        ...searchBoxStyles,
        minWidth: "250px",
      },
    }),
    [handleFilterByMonth, month],
  );

  const filterByYearProps = useMemo(
    () => ({
      placeholder: "Filter By year",
      data: generateYearOptions,
      handleChange: handleFilterByYear,
      value: year,
      inlineBoxStyles: {
        ...searchBoxStyles,
        minWidth: "250px",
      },
    }),
    [handleFilterByYear, year],
  );

  const exportButtonProps = useMemo(
    () => ({
      text: "Import Data",
      clickFn: handleExportData,
      loading: excelDataLoading,
      inlineStyling: { width: "110px" },
    }),
    [handleExportData, excelDataLoading],
  );

  const tableProps = useMemo(() => {
    return {
      payouts: data?.payouts,
      totalCount: data?.count || 0,
      totalPages: data?.totalPages || 0,
      currentPage: data?.currentPage || 0,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleChangeStatus: (payoutId: string) =>
        handleUpdateTutorPayouts.mutate(payoutId),
      loading: handleUpdateTutorPayouts?.isPending,
    };
  }, [
    data?.payouts,
    data?.count,
    data?.totalPages,
    currentPage,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    handleUpdateTutorPayouts,
  ]);

  // Handle errors from API
  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [error]);

  return (
    <main className={classes.container}>
      {/* Header Section */}
      <div className={classes.header}>
        <div className={classes.aside1}>
          {handleGenerateUpdatePayouts?.isPending ? (
            <LoadingBox
              inlineStyling={{ height: "max-content", width: "max-content" }}
              loaderStyling={{
                height: "var(--regular22-) !important",
                width: "var(--regular22-) !important",
              }}
            />
          ) : (
            <span
              className={classes.iconBox}
              onClick={() => handleGenerateUpdatePayouts?.mutate()}
            >
              <RefreshIcon
                sx={{
                  color: "var(--pure-black-color)",
                  fontSize: "var(--regular18-)",
                }}
              />
            </span>
          )}
          <MobileFilterButton {...mobileFilterButtonProps} />
          <Button {...exportButtonProps} />{" "}
        </div>
        {showFullFilters && (
          <div className={classes.filterBox}>
            <SearchBox {...searchBoxProps} />
            <FilterDropdown {...filterByStatusProps} />
            <FilterDropdown {...filterByMonthProps} />
            <FilterDropdown {...filterByYearProps} />
          </div>
        )}
      </div>

      {/* Table Section */}
      {isFetching ? (
        <LoadingBox />
      ) : data && data.payouts && data.payouts.length > 0 ? (
        <Table {...tableProps} />
      ) : (
        <ErrorBox />
      )}
    </main>
  );
};

export default React.memo(TutorPayouts);
