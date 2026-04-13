"use client";
import React, { FC, useCallback, useState, useMemo } from "react";
import classes from "./billing.module.css";
import { toast } from "react-toastify";
import { MyAxiosError } from "@/services/error.type";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useQuery, useMutation } from "@tanstack/react-query";
import BillingTable from "@/components/ui/superAdmin/billing/billing-table/billing";
import {
  getAllBilling,
  createNewBilling,
  exportBilling,
} from "@/services/dashboard/superAdmin/billing/billing";
import {
  Create_New_Billing_Payload_Type,
  Billing_Api_FilterOptions,
} from "@/services/dashboard/superAdmin/billing/billing.types";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import Button from "@/components/global/button/button";
import AddModal from "@/components/ui/superAdmin/billing/add-modal/add-moadl";
import {
  generateInvoices,
  generateInvoicesV1,
} from "@/services/dashboard/superAdmin/invoices/invoices";

import SearchBox from "@/components/global/search-box/search-box";
import useDebounce from "@/utils/helpers/useDebounce";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";

const Billing: FC = () => {
  const { token, user } = useAppSelector((state) => state?.user);
  const { roles } = useAppSelector((state) => state?.roles);
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const filteredRoles = roles?.map((item) => JSON.stringify(item)) || [];
  const filteredTeachers =
    teachers?.users?.map((item) => JSON.stringify(item)) || [];
  const filteredStudents =
    students?.users?.map((item) => JSON.stringify(item)) || [];
  // states
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [userId, setUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedBalanceStatus, setSelectedBalanceStatus] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const [selectedBalance, setSelectedBalance] = useState<any>(null);
  const debounceUserId = useDebounce(userId, 1500);
  // modal states
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  // pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  const handleUserIdFilter = useCallback((e: any) => {
    setUserId(e.target.value);
    setSelectedStudent(null);
    setSelectedTeacher(null);
  }, []);
  // search users
  const handleRoleFilter = useCallback((e: any) => {
    setSelectedRole(JSON.parse(e.target.value));
    setSelectedStudent(null);
    setSelectedTeacher(null);
  }, []);
  const handleTeacherFilter = useCallback((e: any) => {
    setSelectedTeacher(JSON.parse(e.target.value));
    setSelectedRole(null);
    setSelectedStudent(null);
  }, []);
  const handleStudentFilter = useCallback((e: any) => {
    setSelectedStudent(JSON.parse(e.target.value));
    setSelectedTeacher(null);
    setSelectedRole(null);
  }, []);
  const handleBalanceStatusFilter = useCallback((e: string) => {
    setSelectedBalanceStatus(e);
  }, []);
  const handleStatusFilter = useCallback((e: string) => {
    setSelectedStatus(e);
  }, []);
  const handleMaxBalanceFilter = useCallback((e: string) => {
    setSelectedBalance(e);
  }, []);

  //handlers
  // add-user modal  open/false functions
  const handeAddModalClose = useCallback(() => {
    setAddModalOpen(false);
  }, []);
  const handleAddModalOpen = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  // pagination handler
  const handleChangePage = useCallback((e: any, newPage: number) => {
    // console.log(newPage);
    setCurrentPage(newPage);
  }, []);
  const handleChangeRowsPerPage = useCallback((e: any) => {
    // console.log(e?.target?.value);
    setRowsPerPage(e?.target?.value);
  }, []);

  //api calls
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [
      "getAllBillings",
      currentPage,
      rowsPerPage,
      selectedTeacher,
      selectedStudent,
      selectedRole,
      selectedBalanceStatus,
      selectedBalance,
      debounceUserId,
      selectedStatus,
    ],
    queryFn: () => {
      const params: Billing_Api_FilterOptions = {
        page: currentPage,
        limit: rowsPerPage,
      };
      if (selectedStudent) {
        params.user_id = selectedStudent?.id;
      }
      if (selectedTeacher) {
        params.user_id = selectedTeacher?.id;
      }
      if (userId) {
        params.user_id = userId;
      }
      if (selectedRole) {
        params.roleId = selectedRole?.id;
      }
      if (selectedBalanceStatus) {
        params.balanceStatus = selectedBalanceStatus
          ? selectedBalanceStatus.toUpperCase()
          : selectedBalanceStatus;
      }
      if (selectedStatus !== null) {
        params.status = selectedStatus
          ? selectedStatus === "Active"
            ? true
            : selectedStatus === "Inactive"
              ? false
              : undefined
          : undefined;
      }
      if (selectedBalance) {
        params.isBelow =
          selectedBalance === "100 >"
            ? false
            : selectedBalance === "< 100"
              ? true
              : undefined;
      }
      return getAllBilling(params, { token });
    },
    staleTime: 30000,
    refetchInterval: 30000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const handleAddBilling = useMutation({
    mutationFn: (payload: Create_New_Billing_Payload_Type) =>
      createNewBilling(
        {
          token,
        },
        payload,
      ),
    onSuccess: (data: any) => {
      if (data.message || data.error) {
        return toast.error(data.message || data.error);
      } else {
        setAddModalOpen(false);
        toast.success("Bill Add Successfully");
        refetch();
      }
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleExportBilling = useMutation({
    mutationFn: () => exportBilling({ token }, { email: user?.email || "" }),
    onSuccess: (data: any) => {
      toast.success(data?.message || "Billing export sent to your email.");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleGetInvoice = useMutation({
    mutationFn: ({
      id,
      piercPercentage,
    }: {
      id: number;
      piercPercentage: boolean;
    }) => generateInvoices({ id, piercPercentage }, { token }),
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("Invoice generated successfully.");
      }
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const handleGetInvoiceV1 = useMutation({
    mutationFn: ({
      id,
      piercPercentage,
    }: {
      id: number;
      piercPercentage: boolean;
    }) => generateInvoicesV1({ id, piercPercentage }, { token }),
    onSuccess: (data: any) => {
      if (data.message) {
        toast.success(data.message);
      } else {
        toast.success("V1 Invoice generated successfully.");
      }
      refetch();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError.response) {
        toast.error(
          axiosError.response.data.error ||
            `${axiosError.response.status} ${axiosError.response.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  const searchUserIdFilterDropDown = useMemo(
    () => ({
      placeholder: "Search by user_id",
      changeFn: handleUserIdFilter,
      value: userId,
      inlineStyles: styles?.dropDropStyles,
    }),
    [handleUserIdFilter, userId],
  );

  const studentFilterDropdownProps = useMemo(
    () => ({
      placeholder: "Filter Student",
      data: filteredStudents,
      handleChange: handleStudentFilter,
      value: selectedStudent?.name,
      inlineBoxStyles: styles?.dropDropStyles,
      dropDownObject: true,
    }),
    [filteredStudents, handleStudentFilter, selectedStudent?.name],
  );

  const teacherFilterDropdownProps = useMemo(
    () => ({
      placeholder: "Filter Teacher",
      data: filteredTeachers,
      handleChange: handleTeacherFilter,
      value: selectedTeacher?.name,
      inlineBoxStyles: styles?.dropDropStyles,
      dropDownObject: true,
    }),
    [filteredTeachers, handleTeacherFilter, selectedTeacher?.name],
  );

  const balanceStatusFilterDropdownProps = useMemo(
    () => ({
      placeholder: "Filter Balance Status",
      data: ["Insufficient", "Sufficient"],
      handleChange: handleBalanceStatusFilter,
      value: selectedBalanceStatus,
      inlineBoxStyles: styles?.dropDropStyles,
      dropDownObject: false,
    }),
    [handleBalanceStatusFilter, selectedBalanceStatus],
  );
  const statusFilterDropdownProps = useMemo(
    () => ({
      placeholder: "Filter User Status",
      data: ["Active", "Inactive"],
      handleChange: handleStatusFilter,
      value: selectedStatus,
      inlineBoxStyles: styles?.dropDropStyles,
      dropDownObject: false,
    }),
    [handleStatusFilter, selectedStatus],
  );

  const maxBalanceFilterDropdownProps = useMemo(
    () => ({
      placeholder: "Filter Max Balance",
      data: ["< 100", "100 >"],
      handleChange: handleMaxBalanceFilter,
      value: selectedBalance,
      inlineBoxStyles: styles?.dropDropStyles,
      dropDownObject: false,
    }),
    [handleMaxBalanceFilter, selectedBalance],
  );

  const roleFilterDropdownProps = useMemo(
    () => ({
      placeholder: "Filter Role",
      data: filteredRoles,
      handleChange: handleRoleFilter,
      value: selectedRole?.name,
      inlineBoxStyles: styles?.dropDropStyles,
      dropDownObject: true,
    }),
    [filteredRoles, handleRoleFilter, selectedRole?.name],
  );
  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: { width: "max-content", alignSelf: "flex-end" },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  const buttonProps = useMemo(
    () => ({
      text: "Add New Billing",
      icon: <AddOutlinedIcon />,
      inlineStyling: styles?.buttonStyles,
      clickFn: handleAddModalOpen,
    }),
    [handleAddModalOpen],
  );

  const billingTableProps = useMemo(
    () => ({
      data: data?.data || [],
      currentPage: data?.currentPage ?? 1,
      totalCount: data?.totalCount ?? 0,
      totalPages: data?.totalPages ?? 0,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleGetInvoice: (e: any, id: number, piercPercentage: boolean) =>
        handleGetInvoice?.mutate({ id, piercPercentage }),
      invoiceLoading: handleGetInvoice?.isPending,
      handleGetInvoiceV1: (e: any, id: number, piercPercentage: boolean) =>
        handleGetInvoiceV1?.mutate({ id, piercPercentage }),
      invoiceLoadingV1: handleGetInvoiceV1?.isPending,
    }),

    [
      data?.data,
      data?.currentPage,
      data?.totalCount,
      data?.totalPages,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleGetInvoice,
    ],
  );

  const addModalProps = useMemo(
    () => ({
      modalOpen: addModalOpen,
      handleClose: handeAddModalClose,
      heading: "Add Billing",
      subHeading: "Fill out the form in order to create the billing.",
      handleAdd: (payload: Create_New_Billing_Payload_Type) =>
        handleAddBilling?.mutate(payload),
      loading: handleAddBilling?.isPending,
      success: handleAddBilling?.isSuccess,
    }),
    [addModalOpen, handeAddModalClose, handleAddBilling],
  );

  if (error) {
    const axiosError = error as MyAxiosError;
    if (axiosError.response) {
      toast.error(axiosError.response.data.error);
    } else {
      toast.error(axiosError.message);
    }
  }

  return (
    <>
      <main className={classes.main}>
        <div className={classes.section1}>
          <div className={classes.buttonBox}>
            <MobileFilterButton {...mobileFilterButtonProps} />
            <Button
              text="Export"
              inlineStyling={styles?.buttonStyles}
              clickFn={() => handleExportBilling.mutate()}
              loading={handleExportBilling.isPending}
              disabled={handleExportBilling.isPending}
            />
            <Button {...buttonProps} />
          </div>
          {showFullFilters && (
            <div className={classes.wrapper}>
              <SearchBox {...searchUserIdFilterDropDown} />
              <FilterDropdown {...studentFilterDropdownProps} />
              <FilterDropdown {...teacherFilterDropdownProps} />
              <FilterDropdown {...balanceStatusFilterDropdownProps} />
              <FilterDropdown {...maxBalanceFilterDropdownProps} />
              <FilterDropdown {...roleFilterDropdownProps} />
              <FilterDropdown {...statusFilterDropdownProps} />
            </div>
          )}
        </div>
        {isLoading ? (
          <LoadingBox />
        ) : error ? (
          <ErrorBox />
        ) : (
          <BillingTable {...billingTableProps} />
        )}
      </main>
      <AddModal {...addModalProps} />
    </>
  );
};

export default Billing;

const styles = {
  dropDropStyles: { minWidth: "250px", flex: "1" },
  buttonStyles: {
    width: "max-content",
  },
};
