"use client";
import classes from "./cancelled-classes.module.css";
// modules & libraries
import { useState, useCallback, FC, useMemo, useEffect } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
// services
import { MyAxiosError } from "@/services/error.type";
import { getAllCancelledClasses } from "@/services/dashboard/superAdmin/cancelled-reschedules/cancelled-reschedules";
// components
import CancelledClassesTable from "@/components/ui/superAdmin/cancelled-classes/cancelled-classes-table/cancelled-classes-table";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { useParams } from "next/navigation";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import MobileViewCard from "@/components/ui/superAdmin/cancelled-classes/mobile-view-card/mobile-view-card";
import { useMediaQuery } from "react-responsive";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Button from "@/components/global/button/button";

const initialFilterState: any = {
  currentPage: 1,
  rowsPerPage: 50,
  dateFilter: "",
  selectedTeacher: "",
  selectedStudent: "",
  enrollmentSearch: "",
  on_break: "",
};
const CancelledClasses: FC = () => {
  const mobileViewport = useMediaQuery({ maxWidth: 1220 });
  const { role } = useParams();
  const { token, user } = useAppSelector((state) => state?.user);
  // State management
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>(initialFilterState);
  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  // Helper function to update filters
  const updateFilter = useCallback(
    <K extends keyof any>(key: K, value: any) => {
      setFilters((prev: any) => ({
        ...prev,
        [key]: value,
        ...(key !== "currentPage" ? { currentPage: 1 } : {}),
      }));
    },
    [],
  );

  // Event handlers
  const handleChangePage = useCallback(
    (e: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
      updateFilter("currentPage", newPage);
    },
    [updateFilter],
  );

  const handleChangeRowsPerPage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateFilter("rowsPerPage", parseInt(e?.target?.value, 10));
    },
    [updateFilter],
  );

  const handleCalendar = useCallback(
    (value: [string, string] | null) => {
      updateFilter("dateFilter", value === null ? "" : value);
    },
    [updateFilter],
  );

  // Query parameters
  const queryParams = useMemo(
    () => ({
      limit: filters.rowsPerPage,
      page: filters.currentPage,
      startDate: Array.isArray(filters.dateFilter)
        ? moment(filters.dateFilter[0]).format("YYYY-MM-DD") || ""
        : "",
      endDate: Array.isArray(filters.dateFilter)
        ? moment(filters.dateFilter[1]).format("YYYY-MM-DD") || ""
        : "",
    }),
    [filters.rowsPerPage, filters.currentPage, filters.dateFilter],
  );

  // Data fetching
  const { data, error, isLoading } = useQuery({
    queryKey: [
      "getAllEnrollments",
      filters.currentPage,
      filters.rowsPerPage,
      filters.dateFilter,
    ],
    queryFn: () => getAllCancelledClasses(queryParams, { token }),
  });

  const handleGetExcelData = useMutation({
    mutationFn: () =>
      getAllCancelledClasses({ ...queryParams, excel_data: true }, { token }),
    onSuccess: (data: any) => {
      if (data.message) {
        return toast.success(data.message);
      }
      if (data.error) {
        return toast.error(data.error);
      }
      return toast.success("Excel Data Downloaded Successfully.");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message
            ? `${axiosError?.response?.data?.message}`
            : axiosError?.response?.data?.error
              ? `${axiosError?.response?.data?.error}`
              : `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  // Table props
  const tableProps = useMemo(
    () => ({
      data: data?.data || [],
      currentPage: data?.currentPage || 1,
      totalCount: data?.totalCount || data?.data?.length || 1,
      totalPages: data?.totalPages || 1,
      rowsPerPage: filters.rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
    }),
    [data, filters.rowsPerPage, handleChangePage, handleChangeRowsPerPage],
  );

  const filterByDateProps = useMemo(
    () => ({
      placeholder: "Filter by session date",
      changeFn: handleCalendar,
      value: filters.dateFilter,
      minWidth: "320px",
      flex: 1,
    }),
    [filters.dateFilter, handleCalendar],
  );

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: { width: "max-content", alignSelf: "flex-end" },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  const getExcelDataButtonProps = useMemo(
    () => ({
      text: "Export ",
      clickFn: () => handleGetExcelData.mutate(),
      inlineStyling: {
        width: "100px",
      },
      loading: handleGetExcelData.isPending,
      icon: <FileDownloadIcon />,
    }),
    [handleGetExcelData],
  );

  // Handle API error
  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      toast.error(
        axiosError?.response?.data.message ||
          axiosError?.response?.data.error ||
          `${axiosError?.response?.status} ${axiosError?.response?.statusText}` ||
          "An unexpected error occured",
      );
    }
  }, [error]);

  return (
    <>
      <main className={classes.container}>
        <div className={classes.section1}>
          <div className={classes.buttonBox}>
            <MobileFilterButton {...mobileFilterButtonProps} />
            <Button {...getExcelDataButtonProps} />
          </div>
          {showFullFilters && (
            <div className={classes.filtersBox}>
              <FilterByDate {...filterByDateProps} />
            </div>
          )}
        </div>
        {isLoading ? (
          <LoadingBox
            inlineStyling={{ flex: "0 1 calc(100% - 10px)", minHeight: "0" }}
          />
        ) : !data?.data?.length ? (
          <ErrorBox
            inlineStyling={{ flex: "0 1 calc(100% - 10px)", minHeight: "0" }}
          />
        ) : mobileViewport ? (
          <MobileViewCard {...tableProps} />
        ) : (
          <CancelledClassesTable {...tableProps} />
        )}
      </main>
    </>
  );
};

export default CancelledClasses;

const styles = {
  dropDownStyles: {
    minWidth: "320px",
    flex: "1",
    background: "var(--main-white-color)",
  },
};
