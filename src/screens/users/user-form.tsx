"use client";
import {
  useState,
  useRef,
  useCallback,
  useMemo,
  FC,
  useEffect,
  memo,
} from "react";
import classes from "./user.module.css";
import { toast } from "react-toastify";
import { Country } from "country-state-city";
import { useQuery, useMutation } from "@tanstack/react-query";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { fetchUsersByGroup } from "@/lib/store/slices/usersByGroup-slice";
import { useAppDispatch } from "@/lib/store/hooks/hooks";
import { MyAxiosError } from "@/services/error.type";
import {
  adduser,
  updateUser,
  deactivateUser,
  deleteUser,
  addRelation,
  getAllusers,
} from "@/services/dashboard/superAdmin/uers/users";
import { UpdateUser_Api_Payload_Type } from "@/services/dashboard/superAdmin/uers/users.type";
import SearchBox from "@/components/global/search-box/search-box";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import Button from "@/components/global/button/button";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import UsersTable from "@/components/ui/superAdmin/users/users-table/users-table";
import AddModal from "@/components/ui/superAdmin/users/add-modal/add-moadl";
import RelationModal from "@/components/ui/superAdmin/users/relation-modal/relationModalOpen";
import UpdateModal from "@/components/ui/superAdmin/users/edit-modal/edit-modal";
import DeactivateModal from "@/components/ui/superAdmin/users/deactivate-modal/deactivate-modal";
import DeleteModal from "@/components/ui/superAdmin/users/delete-modal/delete-modal";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import { useMediaQuery } from "react-responsive";
import UserViewCard from "@/components/ui/superAdmin/users/userView-card/userView-card";
import LoadingBox from "@/components/global/loading-box/loading-box";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import moment from "moment";

const UsersForm: FC = () => {
  const dispatch = useAppDispatch();
  const mobileViewport = useMediaQuery({ maxWidth: 1220 });
  const { token } = useAppSelector((state) => state?.user);
  const roles = useAppSelector((state) => state.roles.roles);
  const students = useAppSelector((state) => state?.usersByGroup?.students!);
  const parents = useAppSelector((state) => state?.usersByGroup?.parents!);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // modal states
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [relationModalOpen, setRelationModalOpen] = useState<boolean>(false);
  const [updateModalOpen, setUpdateModalOpen] = useState<any>({
    open: false,
    profile: {},
  });
  const [deactivateModalOpen, setDeactivateModalOpen] = useState<any>({
    open: false,
    profile: {},
  });
  const [deleteModal, setMeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>("");

  // pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  // date filter states
  const [dateFilter, setDateFilter] = useState<any>("");
  // search filter states
  const [debouncedSearchItem, setDebouncedSearchItem] = useState<string>("");
  const [debouncedSearchItemEmail, setDebouncedSearchItemEmail] =
    useState<string>("");
  // country filter states
  const [countryFilter, setCountryFilter] = useState<string>("");

  const [userType, setUserTypeFilter] = useState("");
  const [userStatus, setUserStatus] = useState("");

  // roles and countries memoized
  const rolesArr = useMemo(() => {
    return roles?.map((item: any) => JSON.stringify(item));
  }, []);
  const countries = useMemo(() => {
    return Country?.getAllCountries()?.map((item: any) => JSON.stringify(item));
  }, []);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);
  // pagination handler
  const handleChangePage = useCallback((e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);
  const handleChangeRowsPerPage = useCallback((e: any) => {
    setRowsPerPage(e?.target?.value);
  }, []);
  // date filter handler
  const handleCalendar = useCallback((value: any) => {
    if (value === null) {
      setDateFilter("");
    } else {
      setDateFilter(value);
    }
  }, []);

  // search filter handler
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
      const searchValue = e.target.value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Set new
      if (name === "name") {
        timeoutRef.current = setTimeout(() => {
          setDebouncedSearchItem(searchValue);
        }, 1500);
      } else if (name === "email") {
        timeoutRef.current = setTimeout(() => {
          setDebouncedSearchItemEmail(searchValue);
        }, 1500);
      }
    },
    [],
  );
  // country filter handler
  const handleCountryFilter = useCallback((e: any) => {
    setCountryFilter(e.target.value);
  }, []);

  // userType filter handler
  const handleUserTypeFilter = useCallback((e: any) => {
    setUserTypeFilter(e.target.value);
  }, []);

  // userStatus filter handler
  const handleUserStatusFilter = useCallback((value: any) => {
    // console.log(value);
    setUserStatus(value);
  }, []);

  // add-user modal  open/false functions
  const handeAddModalClose = useCallback((e: any) => {
    setAddModalOpen(false);
  }, []);
  const handleAddModalOpen = useCallback((e: any) => {
    setAddModalOpen(true);
  }, []);

  // parent relation modal open/close function
  const handleRelationOpen = useCallback(() => {
    setRelationModalOpen(true);
  }, []);
  const handleRelationClose = useCallback(() => {
    setRelationModalOpen(false);
  }, []);

  // edit-user modal  open/false functions
  const handeEditModalClose = useCallback((e: any) => {
    setUpdateModalOpen({
      open: false,
      profile: {},
    });
  }, []);
  const handleEditModalOpen = useCallback((e: any, item: any) => {
    e.stopPropagation();
    setUpdateModalOpen({
      open: true,
      profile: item,
    });
  }, []);

  // deactivation user modal open/close  functions
  const handleDeactivateModalClose = useCallback(() => {
    setDeactivateModalOpen({
      open: false,
      profile: {},
    });
  }, []);
  const handleDeactivateModalOpen = useCallback((e: any, item: any) => {
    e.stopPropagation();
    setDeactivateModalOpen({
      open: true,
      profile: item,
    });
  }, []);

  // delete-user modal open/close  functions
  const handleDeleteModalClose = useCallback((e: any) => {
    setMeleteModal(false);
  }, []);
  const handleDeleteModalOpen = useCallback((e: any, id: number) => {
    e.stopPropagation();
    setMeleteModal(true);
    setDeleteId(id.toString());
  }, []);

  const handleExportUsers = useCallback(async (exportData: boolean = true) => {
    try {
      await getUsersData(exportData);
      toast.success("Users Exported Successfully!");
    } catch (e) {
      // console.log(e);
      toast.error("Something went wrong!");
    }
  }, []);
  const getUsersData = (exportData: boolean = false) => {
    return getAllusers(
      {
        startDate: dateFilter[0] || "",
        endDate: moment(dateFilter[1]).add(1, "day").format("YYYY-MM-DD") || "",
        userType: userType !== "" ? JSON.parse(userType)?.id : null,
        limit: rowsPerPage,
        page: currentPage,
        name: debouncedSearchItem ? debouncedSearchItem : "",
        email: debouncedSearchItemEmail ? debouncedSearchItemEmail : "",
        countryCode:
          countryFilter !== "" ? JSON.parse(countryFilter)?.isoCode : "",
        exportData: exportData,
        status:
          userStatus === "Active"
            ? true
            : userStatus === "Deactive"
              ? false
              : "",
      },
      { token },
    );
  };
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [
      "getAllUsers",
      currentPage,
      rowsPerPage,
      debouncedSearchItem,
      debouncedSearchItemEmail,
      dateFilter,
      countryFilter,
      userType,
      userStatus,
      roles,
    ],
    queryFn: () => getUsersData(),
    refetchInterval: 300000,
    staleTime: 300000,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const handleAdd = useMutation({
    mutationFn: (payload) =>
      adduser(payload, {
        token,
        contentType: "multipart/form-data",
      }),
    onSuccess: (data: any) => {
      if (data.message || data.error) {
        return toast.error(data.message || data.error);
      }
      setAddModalOpen(false);
      dispatch(fetchUsersByGroup({ token }));
      refetch();
      toast.success("User Add Successfully");
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

  const handleAddRelation = useMutation({
    mutationFn: (payload) =>
      addRelation(payload, {
        token,
      }),
    onSuccess: (data: any) => {
      if (data.message) {
        return toast.success(data.message);
      }
      if (data.error) {
        return toast.error(data.error);
      }
      handleRelationClose();
      toast.success("Relation Add Successfully");
      refetch();
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

  const handleUpdate = useMutation({
    mutationFn: (payload: UpdateUser_Api_Payload_Type) =>
      updateUser(
        {
          token,
        },
        payload,
      ),
    onSuccess: (data: any) => {
      const message = "User Updated Successfully.";
      const toastType = data.error ? toast.error : toast.success;
      toastType(message);
      if (!data.error) {
        refetch();
        setUpdateModalOpen({
          open: false,
          profile: {},
        });
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
      setUpdateModalOpen({
        open: false,
        profile: {},
      });
    },
  });

  const handleDeactivate = useMutation({
    mutationFn: (payload: {
      id: string;
      status: boolean;
      permanent: string;
      message: string;
    }) =>
      deactivateUser(payload, {
        token,
      }),
    onSuccess: (data: any) => {
      refetch();
      setDeactivateModalOpen({
        open: false,
        profile: {},
      });
      toast.success(
        `User ${
          data?.status === true ? "Activated" : "Deactivated"
        } Successfully`,
      );
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
      setDeactivateModalOpen({
        open: false,
        profile: {},
      });
    },
  });

  const handleDelete = useMutation({
    mutationFn: (payload: { id: string }) =>
      deleteUser(payload, {
        token,
      }),
    onSuccess: () => {
      refetch();
      setMeleteModal(false);
      setDeleteId("");
      toast.success("User Deleted Successfully");
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
      setMeleteModal(false);
      setDeleteId("");
    },
  });

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      // inlineStyles: { width: "max-content", alignSelf: "flex-end" },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  // table props
  const tableProps = useMemo(
    () => ({
      data: data?.users || [],
      currentPage: data?.currentPage || 1,
      totalCount: data?.totalCount || data?.users?.length || 1,
      totalPages: data?.totalPages || 1,
      rowsPerPage: rowsPerPage,
      handleChangePage: handleChangePage,
      handleChangeRowsPerPage: handleChangeRowsPerPage,
      handleDeactivateModal: handleDeactivateModalOpen,
      handleDeleteModal: handleDeleteModalOpen,
      handleEditModal: handleEditModalOpen,
    }),
    [
      data?.users,
      data?.currentPage,
      data?.totalCount,
      data?.totalPages,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleDeactivateModalOpen,
      handleDeleteModalOpen,
      handleEditModalOpen,
    ],
  );

  //add-modal props
  const addModalProps = useMemo(
    () => ({
      modalOpen: addModalOpen,
      handleClose: handeAddModalClose,
      heading: `Add User`,
      subHeading: `Fill out the form in order to create the user`,
      handleAdd: (payload: any) => handleAdd?.mutate(payload),
      loading: handleAdd?.isPending,
      success: handleAdd?.isSuccess,
    }),
    [
      addModalOpen,
      handeAddModalClose,
      handleAdd?.mutate,
      handleAdd?.isPending,
      handleAdd?.isSuccess,
    ],
  );

  // relation modal props
  const relationModalProps = useMemo(
    () => ({
      modalOpen: relationModalOpen,
      handleClose: handleRelationClose,
      heading: `Add Realtion`,
      subHeading: `Fill out the form in order to create the relation between parent and students`,
      students: students?.users || [],
      parents: parents?.users || [],
      handleAdd: (payload: any) => handleAddRelation?.mutate(payload),
      loading: handleAddRelation?.isPending,
      success: handleAddRelation?.isSuccess,
    }),
    [
      relationModalOpen,
      students,
      addModalOpen,
      handeAddModalClose,
      handleAddRelation?.mutate,
      handleAddRelation?.isPending,
      handleAddRelation?.isSuccess,
      parents,
    ],
  );

  // update-modal props
  const updateModalProps = useMemo(
    () => ({
      modalOpen: updateModalOpen,
      handleClose: handeEditModalClose,
      heading: `Update User`,
      subHeading: `Edit the fields in order to update the user`,
      handleUpdate: (payload: any) => handleUpdate?.mutate(payload),
      loading: handleUpdate?.isPending,
      success: handleUpdate?.isSuccess,
    }),
    [
      updateModalOpen,
      handeEditModalClose,
      handleUpdate?.mutate,
      handleUpdate?.isPending,
      handleUpdate?.isSuccess,
    ],
  );

  // deactivate-modal props
  const deactivateModalProps = useMemo(
    () => ({
      modalOpen: deactivateModalOpen,
      handleClose: handleDeactivateModalClose,
      subHeading:
        deactivateModalOpen?.profile?.status === true
          ? "Are you sure to deactivate this user?"
          : "Are you sure to activate this user?",
      heading: "You Sure!",
      handleDeactivate: (payload: {
        id: string;
        status: boolean;
        permanent: string;
        message: string;
      }) => {
        handleDeactivate.mutate(payload);
      },
      loading: handleDeactivate?.isPending,
      isSuccess: handleDeactivate?.isSuccess,
    }),
    [
      deactivateModalOpen,
      handleDeactivateModalClose,
      handleDeactivate?.mutate,
      handleDeactivate?.isPending,
      handleDeactivate?.isSuccess,
    ],
  );

  // delete-modal props
  const deleteModalProps = useMemo(
    () => ({
      modalOpen: deleteModal,
      handleClose: handleDeleteModalClose,
      subHeading: "Are you sure to delete this user? This action is permanent!",
      heading: "Are You Sure?",
      handleDelete: () => {
        handleDelete.mutate({ id: deleteId });
      },
      loading: handleDelete?.isPending,
    }),
    [
      deleteModal,
      handleDeleteModalClose,
      handleDelete?.mutate,
      handleDelete?.isPending,
      deleteId,
    ],
  );

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
    <>
      <main className={classes.container}>
        <div className={classes.section1}>
          <div className={classes.buttonBox}>
            <MobileFilterButton {...mobileFilterButtonProps} />
            <Button
              text="Add Relation"
              icon={<AddOutlinedIcon />}
              clickFn={handleRelationOpen}
              inlineStyling={styles?.buttonStyles}
            />
            <Button
              text="Add New User"
              icon={<AddOutlinedIcon />}
              inlineStyling={styles?.buttonStyles}
              clickFn={handleAddModalOpen}
            />
            <Button
              text="Export "
              icon={<FileDownloadIcon />}
              inlineStyling={{ ...styles?.buttonStyles, width: "100px" }}
              clickFn={() => handleExportUsers(true)}
            />
          </div>
          {showFullFilters && (
            <div className={classes.aside}>
              <FilterByDate
                changeFn={handleCalendar}
                background="var(--main-white-color)"
                value={dateFilter}
              />
              <SearchBox
                placeholder="Search name"
                changeFn={(e) => handleSearch(e, "name")}
                inlineStyles={styles?.filterStyles}
              />
              <SearchBox
                placeholder="Search email"
                changeFn={(e) => handleSearch(e, "email")}
                inlineStyles={styles?.filterStyles}
              />
              <FilterDropdown
                placeholder="Filter role"
                data={rolesArr || []}
                handleChange={handleUserTypeFilter}
                value={userType}
                inlineBoxStyles={styles?.filterStyles}
                dropDownObject
              />
              <FilterDropdown
                placeholder="Filter status"
                data={["Active", "Deactive"]}
                handleChange={handleUserStatusFilter}
                value={userStatus}
                inlineBoxStyles={styles?.filterStyles}
              />
              <FilterDropdown
                placeholder="Filter country"
                data={countries}
                handleChange={handleCountryFilter}
                value={countryFilter}
                inlineBoxStyles={styles?.filterStyles}
                dropDownObject
              />
            </div>
          )}
        </div>
        {isLoading ? (
          <LoadingBox />
        ) : mobileViewport ? (
          <UserViewCard {...tableProps} />
        ) : (
          <UsersTable {...tableProps} />
        )}
      </main>
      <AddModal {...addModalProps} />
      <RelationModal {...relationModalProps} />
      <UpdateModal {...updateModalProps} />
      <DeactivateModal {...deactivateModalProps} />
      <DeleteModal {...deleteModalProps} />
    </>
  );
};

export default memo(UsersForm);

const styles = {
  buttonStyles: {
    width: "max-content",
  },
  filterStyles: {
    background: "var(--main-white-color)",
  },
};
