"use client";
import {
  FC,
  useCallback,
  useMemo,
  useState,
  useEffect,
  ChangeEvent,
} from "react";
import classes from "./transactions.module.css";
import { toast } from "react-toastify";
import moment from "moment-timezone";
import { useQuery, useMutation } from "@tanstack/react-query";
import { session_conclusion_types } from "@/const/dashboard/session_conclusion_types";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import TransactionsTable from "@/components/ui/superAdmin/transaction/transaction-table/transaction-table";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { MyAxiosError } from "@/services/error.type";
import { Transaction_Api_FilterOptions } from "@/services/dashboard/superAdmin/transactions/transaction.types";
import {
  getAllTransactions,
  deleteTransaction,
} from "@/services/dashboard/superAdmin/transactions/transactions";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import { useMediaQuery } from "react-responsive";
import MobileViewCard from "@/components/ui/superAdmin/transaction/mobileView-card/mobileView-card";

const filterStyles = {
  minWidth: "250px",
  flex: 1,
};

const Transactions = ({ role }: { role: string }) => {
  const { token, user } = useAppSelector((state) => state.user);
  const { students, teachers } = useAppSelector((state) => state.usersByGroup);
  const mobileViewport = useMediaQuery({ maxWidth: 1220 });

  // Memoize filtered users to avoid recomputation on every render
  const filteredTeachers = useMemo(
    () => teachers?.users?.map((item) => JSON.stringify(item)) || [],
    [teachers],
  );
  const filteredStudents = useMemo(
    () => students?.users?.map((item) => JSON.stringify(item)) || [],
    [students],
  );

  // State hooks
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<any>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [conclusionType, setConclusionType] = useState<string>("");
  const [sortBy, setSortBy] =
    useState<Transaction_Api_FilterOptions["sort_by"]>("session_date");
  const [type, setType] = useState<string>("");
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(
    null,
  );

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  // Handlers
  const handleTypeFilter = useCallback((newValue: string) => {
    setType(newValue);
    setCurrentPage(1);
  }, []);

  const handleConclusionTypeFilter = useCallback((newValue: string) => {
    (setConclusionType(newValue), setCurrentPage(1));
  }, []);

  const handleTeacherFilter = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSelectedTeacher(JSON.parse(e.target.value));
      setCurrentPage(1);
    },
    [],
  );

  const handleStudentFilter = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSelectedStudent(JSON.parse(e.target.value));
      setCurrentPage(1);
    },
    [],
  );

  const handleCalendar = useCallback((value: any) => {
    setDateFilter(value || "");
  }, []);

  const handleChangePage = useCallback((_e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(e?.target?.value) || 50);
      setCurrentPage(1);
    },
    [],
  );

  // Query parameters memoized to avoid unnecessary re-fetches
  const transactionParams = useMemo(() => {
    const params: Transaction_Api_FilterOptions = {
      start_time: dateFilter[0]
        ? moment(dateFilter[0]).tz("Asia/Dubai").toISOString()
        : "",
      end_time: dateFilter[1]
        ? moment(dateFilter[1]).tz("Asia/Dubai").add(1, "day").toISOString()
        : "",
      limit: rowsPerPage,
      page: currentPage,
      type: user?.roleId === 1 ? type : user?.roleId === 5 ? "Credit" : "", // Default to 'Credit' if type is not set
      conclusion_type: conclusionType,
      sort_by: sortBy,
    };

    if (selectedStudent && selectedTeacher) {
      params.user_id = `${selectedStudent.id},${selectedTeacher.id}`;
    } else if (selectedStudent) {
      params.user_id = selectedStudent.id;
    } else if (selectedTeacher) {
      params.user_id = selectedTeacher.id;
    } else if (role === "teacher") {
      params.user_id = String(user?.id);
    }

    return params;
  }, [
    dateFilter,
    rowsPerPage,
    currentPage,
    conclusionType,
    type,
    selectedStudent,
    selectedTeacher,
    sortBy,
  ]);
  // API calls
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["getAllTransactions", transactionParams, token],
    queryFn: () => getAllTransactions(transactionParams, { token }),
    enabled: !!token,
  });

  // Handle API error (only show once per error change)
  useEffect(() => {
    if (error) {
      const axiosError = error as MyAxiosError;
      toast.error(axiosError.response?.data?.error || axiosError.message);
    }
  }, [error]);

  // Delete mutation
  const handleDeleteTransaction = useMutation({
    mutationFn: (payload: { id: number }) =>
      deleteTransaction(payload, { token }),
    onSuccess: (data: any) => {
      ["message", "error"].forEach((type) => {
        if (data[type]) {
          toast[type === "message" ? "success" : "error"](data[type]);
        }
      });
      refetch();
      setDeleteTransactionId(null);
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      toast.error(
        axiosError.response
          ? axiosError.response.data.error ||
              `${axiosError.response.status} ${axiosError.response.statusText}`
          : axiosError.message,
      );
      setDeleteTransactionId(null);
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

  const filterByDateProps = useMemo(
    () => ({
      changeFn: handleCalendar,
      minWidth: filterStyles?.minWidth,
      flex: 1,
    }),
    [handleCalendar, dateFilter],
  );

  const filterByConclusionTypeProps = useMemo(
    () => ({
      placeholder: "Filter session type",
      data: session_conclusion_types,
      handleChange: handleConclusionTypeFilter,
      value: conclusionType,
      inlineBoxStyles: filterStyles,
    }),
    [
      session_conclusion_types,
      handleConclusionTypeFilter,
      conclusionType,
      filterStyles,
    ],
  );

  const filterByTransactionTypeProps = useMemo(
    () => ({
      placeholder: "Filter transaction type",
      data: ["Debit", "Credit"],
      handleChange: handleTypeFilter,
      value: type,
      inlineBoxStyles: filterStyles,
    }),
    [handleTypeFilter, type, filterStyles],
  );

  const filterByStudentProps = useMemo(
    () => ({
      placeholder: "Filter student",
      data: filteredStudents,
      handleChange: handleStudentFilter,
      value: selectedStudent?.name,
      dropDownObject: true,
      inlineBoxStyles: filterStyles,
    }),
    [filteredStudents, handleStudentFilter, setSelectedStudent, filterStyles],
  );

  const filterByTeacherProps = useMemo(
    () => ({
      placeholder: "Filter teacher",
      data: filteredTeachers,
      handleChange: handleTeacherFilter,
      value: selectedTeacher?.name,
      dropDownObject: true,
      inlineBoxStyles: filterStyles,
    }),
    [filteredTeachers, handleTeacherFilter, setSelectedTeacher, filterStyles],
  );

  // Helper: Table props memoized
  const tableProps = useMemo(
    () => ({
      data: data?.data || [],
      currentPage: data?.currentPage || 1,
      totalCount: data?.totalPages || data?.data?.length || 1,
      totalPages: data?.totalPages || 1,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleDeleteModal: (e: any, id: number) => {
        e.stopPropagation();
        setDeleteTransactionId(id);
        handleDeleteTransaction.mutate({ id });
      },
      deleteTransactionId,
      deleteLoading: handleDeleteTransaction.isPending,
      sortBy,
      setSortBy,
      role,
    }),
    [
      data,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      deleteTransactionId,
      handleDeleteTransaction.isPending,
      handleDeleteTransaction,
      role,
    ],
  );

  return (
    <main className={classes.main}>
      <div className={classes.section1}>
        <MobileFilterButton {...mobileFilterButtonProps} />
        {showFullFilters && (
          <div className={classes.filtersBox}>
            <FilterByDate {...filterByDateProps} />
            {(role === "superAdmin" || role === "admin") && (
              <>
                <FilterDropdown {...filterByStudentProps} />
                <FilterDropdown {...filterByTeacherProps} />
                <FilterDropdown {...filterByTransactionTypeProps} />
              </>
            )}
            <FilterDropdown {...filterByConclusionTypeProps} />
          </div>
        )}
      </div>
      {isLoading ? (
        <LoadingBox />
      ) : !data || data?.data?.length === 0 ? (
        <ErrorBox />
      ) : mobileViewport ? (
        <MobileViewCard {...tableProps} />
      ) : (
        <TransactionsTable {...tableProps} />
      )}
    </main>
  );
};

export default Transactions;
