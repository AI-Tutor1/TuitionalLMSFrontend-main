import React, { FC, useCallback, useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import classes from "./invoices.module.css";
import AddIcon from "@mui/icons-material/Add";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import TeacherDashboardCard from "@/components/ui/teacher/dashboard-card/dashboard-card";
import ConsumerOverview from "@/components/ui/superAdmin/invoices/consumer-overview/consumer-overview";
import LeadsOverview from "@/components/ui/superAdmin/invoices/leads-overview/leads-overview";
import DoughnutChart from "@/components/global/charts/doughnut-chart/doughnut-chart";
import StackedBarChart from "@/components/global/charts/stacked-bar-chart/stacked-bar-chart";
import UpdateBalanceModal from "@/components/ui/superAdmin/invoices/updateBalance-modal/updateBalance-modal";
import GenerateInvoiceModal from "@/components/ui/superAdmin/invoices/generateInvoice-modal/generateInvoice-modal";
import GenerateInvoiceForParentModal from "@/components/ui/superAdmin/invoices/manualPayment-modal/manualPayment-modal";
import DeleteModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { MyAxiosError } from "@/services/error.type";
import {
  getAllInvoices,
  generateNewInvoice,
  generateInvoiceForParent,
  updateInvoiceStatus,
  deleteInvoice,
  updateInvoice,
  invoicePaymentToStudent,
  generateInvoiceForStudents,
} from "@/services/dashboard/superAdmin/invoices/invoices";
import {
  Generate_New_Invoice_Api_Payload,
  Generate_Invoice_For_Parent_Api_Payload_Type,
} from "@/services/dashboard/superAdmin/invoices/invoices.types";
import { getInvoicesCountsAnalytics } from "@/services/dashboard/superAdmin/analytics/analytics";
import { useMediaQuery } from "react-responsive";
import useDebounce from "@/utils/helpers/useDebounce";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import moment from "moment";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";

interface PaidModalState {
  id?: number | null;
  amount?: number | null;
  open?: boolean;
}

interface DeleteModalState {
  id?: number | null;
  open?: boolean;
}

const actionsArray = [
  AddIcon,
  PaymentOutlinedIcon,
  RemoveRedEyeOutlinedIcon,
  FileUploadOutlinedIcon,
];

const monthsWithNumbers = moment.months().map((name, index) => {
  const obj = {
    number: index + 1,
    name: name,
  };

  return JSON.stringify(obj);
});

const Invoices: FC = () => {
  const isMedium = useMediaQuery({ query: "(max-width: 1000px)" });
  const { token } = useAppSelector((state) => state?.user);
  const [excelDataIsLoading, setExcelDataIsLoading] = useState<boolean>(false);
  const [filterMobileOpen, setFilterMobileOpen] = useState<boolean>(false);
  // filter states
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  // pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  // modal states
  const [generateInvoiceModalOpen, setGenerateInvoiceModalOpen] =
    useState(false);
  const [generateInvoiceForParentModal, setGenerateInvoiceForParentModalOpen] =
    useState(false);
  const [updateBalanceModal, setUpdateBalanceModal] = useState<PaidModalState>({
    id: null,
    amount: null,
    open: false,
  });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    id: null,
    open: false,
  });
  // filter
  const [dateFilterValue, setDateFilterValue] = useState<any>(null);
  const [dueDateFilterValue, setDueDateFilterValue] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string[]>([]);
  const [sentStatus, setSentStatus] = useState<string>("");
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [selectedStartMonth, setSelectedStartMonth] = useState<null | string>(
    null,
  );
  const [filterByYear, setFilterByYear] = useState<string>("");
  const [selectedEndMonth, setSelectedEndMonth] = useState<null | string>(null);
  const debouncedSearch = useDebounce(search, 1500);

  const handleFilterByYear = useCallback((value: string) => {
    setFilterByYear(value);
  }, []);

  const handleMobileFilterToggle = useCallback(() => {
    setFilterMobileOpen((prev) => !prev);
  }, []);

  const handleStartMonth = useCallback((e: any) => {
    setSelectedStartMonth(e.target.value);
  }, []);

  const handleEndMonth = useCallback((e: any) => {
    setSelectedEndMonth(e.target.value);
  }, []);

  // pagination handler
  const handleChangePage = useCallback((e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);
  const handleChangeRowsPerPage = useCallback((e: any) => {
    setRowsPerPage(e?.target?.value);
  }, []);
  // user filter
  const handleStudentsFilter = useCallback((e: any, selectedOptions: any[]) => {
    setSelectedStudents(selectedOptions.map((option) => option.name));
  }, []);
  // date filter
  const handleDateChange = useCallback((value: any) => {
    if (value === null) {
      setDateFilterValue(value);
    } else {
      setDateFilterValue(
        value.map((i: any) => moment(i).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
      );
    }
  }, []);
  const handleDueDateChange = useCallback((value: any) => {
    if (value === null) {
      setDueDateFilterValue(value);
    } else {
      setDueDateFilterValue(
        value.map((i: any) => moment(i).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
      );
    }
  }, []);
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);
  const handleStatus = useCallback((e: any, selectedOptions: any[]) => {
    setStatus(selectedOptions.map((option) => option.name));
  }, []);
  const handleSentStatus = useCallback((value: any) => {
    setSentStatus(value);
  }, []);
  // generate new invoice modal open/close functions
  const handleGenerateInvoiceModalOpen = useCallback(() => {
    setGenerateInvoiceModalOpen(true);
  }, []);
  const handleGenerateInvoiceModalClose = useCallback(() => {
    setGenerateInvoiceModalOpen(false);
  }, []);
  // manual invoice for parent modal open/close functions
  const handleGenerateInvoiceForParentModalOpen = useCallback(() => {
    setGenerateInvoiceForParentModalOpen(true);
  }, []);
  const handleGenerateInvoiceForParentModalClose = useCallback(() => {
    setGenerateInvoiceForParentModalOpen(false);
  }, []);

  // paid modal open/close functions
  const handleUpdateBalanceModalOpen = useCallback(
    (id?: number, amount?: number) => {
      setUpdateBalanceModal({ id: id, amount: amount, open: true });
    },
    [],
  );
  const handleUpdateBalanceModalClose = useCallback(() => {
    setUpdateBalanceModal({ id: null, amount: null, open: false });
  }, []);
  // delte modal open/close functions
  const handleDeleteModalOpen = useCallback((id?: number) => {
    setDeleteModal({
      id: id,
      open: true,
    });
  }, []);
  const handleDeleteModalClose = useCallback(() => {
    setDeleteModal({
      id: null,
      open: false,
    });
  }, []);

  const {
    data,
    error: getAllInvoicesError,
    isLoading,
    isRefetching: allInvoicesRefetching,
    refetch: allInvoicesRefetch,
  } = useQuery({
    queryKey: [
      "getAllInvoices",
      currentPage,
      rowsPerPage,
      selectedStudents,
      dateFilterValue,
      dueDateFilterValue,
      debouncedSearch,
      status,
      sentStatus,
    ],
    queryFn: () =>
      getAllInvoices(
        {
          limit: rowsPerPage,
          page: currentPage,
          user_id: debouncedSearch ? debouncedSearch : "",
          name: selectedStudents.length > 0 ? selectedStudents.join(",") : "",
          startDate: dateFilterValue?.[0]
            ? moment(dateFilterValue[0]).format("YYYY-MM-DD")
            : undefined,
          endDate: dateFilterValue?.[1]
            ? moment(dateFilterValue[1]).format("YYYY-MM-DD")
            : undefined,
          dueStartDate: dueDateFilterValue?.[0]
            ? moment(dueDateFilterValue[0]).format("YYYY-MM-DD")
            : undefined,
          dueEndDate: dueDateFilterValue?.[1]
            ? moment(dueDateFilterValue[1]).format("YYYY-MM-DD")
            : undefined,
          status: status.join(",") || "",
          is_sent:
            sentStatus === "Sent" ? true : sentStatus === "Unsent" ? false : "",
          excel_data: false,
        },
        { token },
      ),
    refetchOnWindowFocus: false,
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: !!token,
  });

  const handleExcelData = useCallback(async () => {
    try {
      setExcelDataIsLoading(true); // Add loading state

      const response = await getAllInvoices(
        {
          limit: rowsPerPage,
          page: currentPage,
          user_id: debouncedSearch || "",
          name: selectedStudents.join(","),
          startDate: dateFilterValue?.[0]
            ? moment(dateFilterValue[0]).format("YYYY-MM-DD")
            : undefined,
          endDate: dateFilterValue?.[1]
            ? moment(dateFilterValue[1]).format("YYYY-MM-DD")
            : undefined,
          dueStartDate: dueDateFilterValue?.[0]
            ? moment(dueDateFilterValue[0]).format("YYYY-MM-DD")
            : undefined,
          dueEndDate: dueDateFilterValue?.[1]
            ? moment(dueDateFilterValue[1]).format("YYYY-MM-DD")
            : undefined,
          status: status.join(","),
          is_sent:
            sentStatus === "Sent" ? true : sentStatus === "Unsent" ? false : "",
          excel_data: true,
        },
        { token },
      );

      if (response?.message) {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error("Failed to export Excel data");
      console.error(error);
    } finally {
      setExcelDataIsLoading(false);
    }
  }, [
    rowsPerPage,
    currentPage,
    debouncedSearch,
    selectedStudents,
    dateFilterValue,
    dueDateFilterValue,
    status,
    sentStatus,
    token,
  ]);

  const {
    data: getInvoicesCountsAnalyticsData,
    error: getInvoicesCountsAnalyticsError,
    isLoading: getInvoicesCountsAnalyticsLoading,
    refetch: getInvoicesCountsAnalyticsRefetch,
    isRefetching: getInvoicesCountsAnalyticsRefetching,
  } = useQuery({
    queryKey: ["getInvoicesCountsAnalytics", selectedEndMonth, filterByYear],
    queryFn: () =>
      getInvoicesCountsAnalytics(
        {
          year: filterByYear === "" ? moment().year() : parseInt(filterByYear),
          startMonth: selectedStartMonth
            ? JSON.parse(selectedStartMonth)?.number
            : null,
          endMonth: selectedEndMonth
            ? JSON.parse(selectedEndMonth)?.number
            : null,
        },
        { token },
      ),
    refetchOnWindowFocus: false,
    staleTime: 30000,
    enabled: !!token,
    refetchInterval: 30000,
  });
  const baseStatuses = useMemo(
    () => [
      {
        id: 1,
        name: "Paid",
        value: getInvoicesCountsAnalyticsData?.counts?.paid,
      },
      {
        id: 2,
        name: "Pending",
        value: getInvoicesCountsAnalyticsData?.counts?.pending,
      },
      {
        id: 3,
        name: "Overdue",
        value: getInvoicesCountsAnalyticsData?.counts?.overdue,
      },
    ],
    [getInvoicesCountsAnalyticsData],
  );
  // general functions
  const totalPaid = useMemo(() => {
    return (
      getInvoicesCountsAnalyticsData?.monthly?.reduce(
        (total: number, item: any) => total + item.paid_total,
        0,
      ) || 0
    );
  }, [getInvoicesCountsAnalyticsData?.monthly]);

  // generate invoice
  const handleGenerateNewInvoice = useMutation({
    mutationFn: (payload: Generate_New_Invoice_Api_Payload) => {
      return generateNewInvoice({ token }, payload);
    },
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Invoice generated successfully.");
      }
      allInvoicesRefetch();
      setGenerateInvoiceModalOpen(false);
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

  // generate invoice for parent
  const handleGenerateInvoiceForParent = useMutation({
    mutationFn: (payload: Generate_Invoice_For_Parent_Api_Payload_Type) => {
      return generateInvoiceForParent({ token }, payload);
    },
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Invoice generated successfully.");
      }
      allInvoicesRefetch();
      setGenerateInvoiceForParentModalOpen(false);
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

  // update invoice
  const handleInvoiceStatusUpdate = useMutation({
    mutationFn: (payload: { status: "PAID"; amount_paid: number }) => {
      const invoiceId =
        updateBalanceModal?.id !== undefined ? updateBalanceModal.id : null;
      return updateInvoiceStatus(invoiceId, { token }, payload);
    },
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Invoice status changed successfully.");
      }
      allInvoicesRefetch();
      setUpdateBalanceModal({
        id: null,
        amount: null,
        open: false,
      });
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
  const handleGenarateInvoices = useMutation({
    mutationFn: () => {
      return generateInvoiceForStudents({ token });
    },
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Invoice status changed successfully.");
      }
      allInvoicesRefetch();
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

  // delete invoice
  const handleDeleteInvoice = useMutation({
    mutationFn: (id: number) => deleteInvoice(id, { token }),
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Invoice delete successfully.");
      }
      allInvoicesRefetch();
      setDeleteModal({
        id: null,
        open: false,
      });
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

  const handleSent = useMutation({
    mutationFn: (payload: { id: number; is_sent: boolean }) =>
      updateInvoice(payload?.id, { token }, { is_sent: payload?.is_sent }),
    onSuccess: (data: any) => {
      allInvoicesRefetch();
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Sent status updated successfully.");
      }
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

  const handleInvoicePaymentLinkToStudent = useMutation({
    mutationFn: (payload: { id: number | null }) =>
      invoicePaymentToStudent({ token }, payload),
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Invoice sent successfully.");
      }
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

  const startMonthDropdownProps = useMemo(
    () => ({
      inlineBoxStyles: styles?.dropDownStyles,
      placeholder: "Satrt Month",
      data: monthsWithNumbers,
      handleChange: handleStartMonth,
      value: JSON.stringify(selectedStartMonth),
      dropDownObject: true,
    }),
    [handleStartMonth, selectedStartMonth],
  );

  const filterByYearProps = useMemo(
    () => ({
      placeholder: "Filter year",
      data: Array.from({ length: 3000 - 2015 + 1 }, (_, i) =>
        (2015 + i).toString(),
      ),
      handleChange: handleFilterByYear,
      value: filterByYear,
      inlineBoxStyles: styles?.dropDownStyles,
    }),
    [handleFilterByYear, filterByYear],
  );
  const endMonthDropdownProps = useMemo(
    () => ({
      inlineBoxStyles: styles?.dropDownStyles,
      placeholder: "End Month",
      data: monthsWithNumbers,
      handleChange: handleEndMonth,
      value: JSON.stringify(selectedEndMonth),
      dropDownObject: true,
    }),
    [handleEndMonth, selectedEndMonth],
  );

  const cardsDataOptimized = useMemo(
    () => [
      {
        text: "Total Revenue",
        number: totalPaid.toFixed(1) || 0,
      },
      {
        text: "Total Overdue",
        number: getInvoicesCountsAnalyticsData?.counts?.overdue || 0,
      },
      {
        text: "Pending Invoices",
        number: getInvoicesCountsAnalyticsData?.counts?.pending || 0,
      },
      {
        text: "Total Paid",
        number: getInvoicesCountsAnalyticsData?.counts?.paid || 0,
      },
    ],
    [totalPaid, getInvoicesCountsAnalyticsData],
  );

  const consumerOverviewProps = useMemo(
    () => ({
      invoice: data?.invoices || [],
      handlePaidModal: handleUpdateBalanceModalOpen,
      handleDeleteModal: handleDeleteModalOpen,
      currentPage: data?.currentPage,
      totalCount: data?.totalInvoices,
      totalPages: data?.totalPages,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleStudentsFilter,
      selectedStudents,
      loading: isLoading,
      dateFilterValue: dateFilterValue,
      dueDateFilterValue: dueDateFilterValue,
      handleDueDateChange,
      handleDateChange,
      handleSearch,
      search,
      handleStatus,
      status,
      handleSentStatus,
      sentStatus,
      handleSent: (id?: number, is_sent?: boolean) => {
        if (id !== undefined && is_sent !== undefined) {
          handleSent?.mutate({ id, is_sent });
        }
      },
      sentLoading: handleSent?.isPending,
      handleRefresh: () => {
        allInvoicesRefetch();
        getInvoicesCountsAnalyticsRefetch();
        toast.info("Data refreshed successfully.");
      },
      allInvoicesRefetching: allInvoicesRefetching,
      handleExcelData,
      excelDataIsLoading,
      handleGenarateInvoices: () => handleGenarateInvoices?.mutate(),
      generateInvoicesLoading: handleGenarateInvoices?.isPending,
      handleInvoicePaymentLinkToStudent: (id: number | null) =>
        handleInvoicePaymentLinkToStudent?.mutate({ id }),
      handleInvoicePaymentLinkToStudentLoading:
        handleInvoicePaymentLinkToStudent?.isPending,
    }),
    [
      allInvoicesRefetch,
      getInvoicesCountsAnalyticsRefetch,
      data?.invoices,
      data?.currentPage,
      data?.totalInvoices,
      data?.totalPages,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleStudentsFilter,
      selectedStudents,
      isLoading,
      dateFilterValue,
      dueDateFilterValue,
      handleDateChange,
      handleDueDateChange,
      handleSearch,
      search,
      handleStatus,
      status,
      handleSentStatus,
      sentStatus,
      handleUpdateBalanceModalOpen,
      handleDeleteModalOpen,
      handleGenarateInvoices,
      handleGenarateInvoices?.isPending,
      handleSent,
      handleSent?.isPending,
      allInvoicesRefetching,
      handleExcelData,
      excelDataIsLoading,
      handleInvoicePaymentLinkToStudent,
      handleInvoicePaymentLinkToStudent?.isPending,
    ],
  );

  const leadsOverviewProps = useMemo(
    () => ({
      allInvoicesRefetch,
    }),
    [allInvoicesRefetch],
  );

  const barChartsProps = useMemo(
    () => ({
      inlineStyles: {
        height: "100%",
        maxHeight: "250px",
        width: isMedium ? "calc(100% - 10px)" : undefined,
      },
      heading: "Cashflow",
      data: getInvoicesCountsAnalyticsData?.monthly || [],
      handleFilterByYear: handleFilterByYear,
      filterByYear: filterByYear,
    }),
    [
      isMedium,
      getInvoicesCountsAnalyticsData?.monthly,
      handleFilterByYear,
      filterByYear,
    ],
  );

  const doughnutChartProps = useMemo(
    () => ({
      paid: getInvoicesCountsAnalyticsData?.counts?.paid || 0,
      pending: getInvoicesCountsAnalyticsData?.counts?.pending || 0,
      overDue: getInvoicesCountsAnalyticsData?.counts?.overdue || 0,
    }),
    [
      getInvoicesCountsAnalyticsData?.counts?.paid,
      getInvoicesCountsAnalyticsData?.counts?.pending,
      getInvoicesCountsAnalyticsData?.counts?.overdue,
    ],
  );

  const generateInvoiceModalProps = useMemo(
    () => ({
      modalOpen: generateInvoiceModalOpen,
      handleClose: handleGenerateInvoiceModalClose,
      heading: "Generate New Invoice",
      subHeading: "Fill out the form in order to generate the new invoice.",
      handleAdd: (payload: Generate_New_Invoice_Api_Payload) =>
        handleGenerateNewInvoice?.mutate(payload),
      loading: handleGenerateNewInvoice?.isPending,
      success: handleGenerateNewInvoice?.isSuccess,
    }),
    [
      generateInvoiceModalOpen,
      handleGenerateInvoiceModalClose,
      handleGenerateNewInvoice?.mutate,
      handleGenerateNewInvoice?.isPending,
      handleGenerateNewInvoice?.isSuccess,
    ],
  );

  const generateInvoiceForParentModalProps = useMemo(
    () => ({
      modalOpen: generateInvoiceForParentModal,
      handleClose: handleGenerateInvoiceForParentModalClose,
      heading: "Manual Payment",
      subHeading: "Fill out the form in order to create manual payment.",
      handleAdd: (payload: Generate_Invoice_For_Parent_Api_Payload_Type) =>
        handleGenerateInvoiceForParent?.mutate(payload),
      loading: handleGenerateInvoiceForParent?.isPending,
      success: handleGenerateInvoiceForParent?.isSuccess,
    }),
    [
      generateInvoiceForParentModal,
      handleGenerateInvoiceForParentModalClose,
      handleGenerateInvoiceForParent?.mutate,
      handleGenerateInvoiceForParent?.isPending,
      handleGenerateInvoiceForParent?.isSuccess,
    ],
  );

  const updateBalanceModalProps = useMemo(
    () => ({
      modalOpen: updateBalanceModal?.open || false,
      handleClose: handleUpdateBalanceModalClose,
      heading: "Update Balance",
      subHeading: "Update Balance in order to change balance status.",
      value: String(updateBalanceModal?.amount) || "No Show",
      handleAdd: (payload: { amount_paid: number }) =>
        handleInvoiceStatusUpdate?.mutate({ ...payload, status: "PAID" }),
      loading: handleInvoiceStatusUpdate?.isPending,
      isSuccess: handleInvoiceStatusUpdate?.isSuccess,
    }),
    [
      updateBalanceModal?.open,
      updateBalanceModal?.amount,
      handleUpdateBalanceModalClose,
      handleInvoiceStatusUpdate?.mutate,
      handleInvoiceStatusUpdate?.isPending,
      handleInvoiceStatusUpdate?.isSuccess,
    ],
  );

  const deleteModalProps = useMemo(
    () => ({
      modalOpen: deleteModal?.open || false,
      handleClose: handleDeleteModalClose,
      subHeading:
        "Are you sure you want to delete this invoice? This action is permanent.",
      heading: "Are You Sure?",
      handleDelete: () => {
        if (deleteModal?.id) {
          handleDeleteInvoice?.mutate(deleteModal?.id && deleteModal.id);
        }
      },
      loading: handleDeleteInvoice?.isPending,
    }),
    [
      deleteModal?.open,
      deleteModal?.id,
      handleDeleteModalClose,
      handleDeleteInvoice?.mutate,
      handleDeleteInvoice?.isPending,
    ],
  );

  useEffect(() => {
    if (getAllInvoicesError || getInvoicesCountsAnalyticsError) {
      const axiosError =
        (getAllInvoicesError as MyAxiosError) ||
        (getInvoicesCountsAnalyticsError as MyAxiosError);
      if (axiosError.response) {
        toast.error(axiosError.response.data.error);
      } else {
        toast.error(axiosError.message);
      }
    }
  }, [getAllInvoicesError, getInvoicesCountsAnalyticsError]);

  return (
    <>
      <main className={classes.main}>
        <div className={classes.buttonBox}>
          <MobileFilterButton {...mobileFilterButtonProps} />
          {filterMobileOpen && (
            <div className={classes.filtersBox}>
              <FilterDropdown {...filterByYearProps} />
              <FilterDropdown {...startMonthDropdownProps} />
              <FilterDropdown {...endMonthDropdownProps} />
            </div>
          )}
        </div>
        <div className={classes.section1}>
          {getInvoicesCountsAnalyticsLoading ? (
            <LoadingBox
              inlineStyling={{
                height: "calc(28vh + 10px)",
              }}
            />
          ) : !getInvoicesCountsAnalyticsData ||
            Object.keys(getInvoicesCountsAnalyticsData).length === 0 ? (
            <ErrorBox
              inlineStyling={{
                height: "calc(28vh + 10px)",
              }}
            />
          ) : (
            <>
              {/* Cards Section */}
              <div className={classes.cardsSection}>
                {cardsDataOptimized?.map(({ text, number }) => (
                  <TeacherDashboardCard
                    key={text}
                    text={text}
                    number={number}
                    inlineStyling={styles.card}
                    loading={getInvoicesCountsAnalyticsLoading}
                  />
                ))}
              </div>
              <StackedBarChart {...barChartsProps} />
              <div className={classes.graphSection}>
                <div>
                  <DoughnutChart {...doughnutChartProps} />
                  <div className={classes.graphSectionIcons}>
                    {actionsArray.map((Icon, index) => (
                      <div
                        key={index}
                        className={classes.icon}
                        onClick={
                          Icon === AddIcon
                            ? handleGenerateInvoiceModalOpen
                            : Icon === PaymentOutlinedIcon
                              ? handleGenerateInvoiceForParentModalOpen
                              : undefined
                        }
                      >
                        <Icon />
                      </div>
                    ))}
                  </div>
                </div>
                <div className={classes.stats}>
                  {baseStatuses?.map((status, indx) => (
                    <p key={status?.id || indx}>
                      <span className={classes.value}>{status?.value}</span>
                      {status?.name}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <ConsumerOverview {...consumerOverviewProps} />
        <LeadsOverview {...leadsOverviewProps} />
      </main>
      {/* Modals */}
      <GenerateInvoiceModal {...generateInvoiceModalProps} />
      <GenerateInvoiceForParentModal {...generateInvoiceForParentModalProps} />
      <UpdateBalanceModal {...updateBalanceModalProps} />
      <DeleteModal {...deleteModalProps} />
    </>
  );
};

export default Invoices;

const styles = {
  card: {
    flex: "1 1 calc(50% - 10px)",
    height: "calc(50% - 10px)",
    padding: "20px",
    justifyContent: "space-between",
  },
  dropDownStyles: {
    minWidth: "320px",
    background: "var(--main-white-color)",
  },
};
