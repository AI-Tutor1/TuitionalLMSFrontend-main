"use client";
import { useState, useCallback, useMemo, useEffect } from "react";
import classes from "./session-feedbacks.module.css";
import {
  createSessionFeedback,
  getAllSessionsFeedbacks,
  deleteSessionFeedback,
  updateSessionFeedback, // Add this import
} from "@/services/dashboard/superAdmin/session-feedbacks/session-feedbacks";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import { MyAxiosError } from "@/services/error.type";
import { toast } from "react-toastify";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
// import Button from "@/components/global/button/button";
import MobileViewCard from "@/components/ui/superAdmin/session-feedbacks/mobileViewCard/mobileViewCard";
// import AddFeedbackModal from "@/components/ui/superAdmin/session-feedbacks/addFeedback-modal/addFeedback-modal";
import EditFeedbackModal from "@/components/ui/superAdmin/session-feedbacks/editFeedback-modal/editFeedback-modal";
import SearchBox from "@/components/global/search-box/search-box";
import DeleteModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import useDebounce from "@/utils/helpers/useDebounce";
import { useParams } from "next/navigation";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";

const SessionFeedbacks = () => {
  const { role } = useParams();
  const { token, user } = useAppSelector((state) => state.user);
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  // const [isAddFeedbackModalOpen, setIsAddFeedbackModalOpen] =
  //   useState<boolean>(false);
  const [sessionIdSearch, setSessionIdSearch] = useState<string>("");
  const debouncedSearch = useDebounce(sessionIdSearch, 1500);
  // pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<{
    open: boolean;
    deleteId: number | null;
  }>({
    open: false,
    deleteId: null,
  });

  // Update modal state
  const [updateModalOpen, setUpdateModalOpen] = useState<{
    open: boolean;
    profile: any;
  }>({
    open: false,
    profile: {},
  });

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  // Add modal open/close functions
  // const handleAddModalClose = useCallback(() => {
  //   setIsAddFeedbackModalOpen(false);
  // }, []);

  // const handleAddModalOpen = useCallback(() => {
  //   setIsAddFeedbackModalOpen(true);
  // }, []);

  // Delete modal open/close functions
  const handleDeleteModalOpen = useCallback((id: number) => {
    setDeleteModalOpen({ open: true, deleteId: id });
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setDeleteModalOpen({ open: false, deleteId: null });
  }, []);

  // Update modal open/close functions
  const handleEditModalOpen = useCallback((_e: React.MouseEvent, item: any) => {
    setUpdateModalOpen({
      open: true,
      profile: item,
    });
  }, []);

  const handleEditModalClose = useCallback(() => {
    setUpdateModalOpen({
      open: false,
      profile: {},
    });
  }, []);

  // Pagination handlers
  const handleChangePage = useCallback((_e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((e: any) => {
    setRowsPerPage(e?.target?.value);
    setCurrentPage(1);
  }, []);

  // Search handler
  const handleSessionSearchId = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "" || /^\d+$/.test(value)) {
        setSessionIdSearch(value);
        setCurrentPage(1);
      }
    },
    [],
  );

  const handleTeacherFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const value = selectedOptions
        .map((option) => String(option.id))
        .join(",");
      setSelectedTeacher(value);
    },
    [],
  );

  const handleStudentFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const value = selectedOptions
        .map((option) => String(option.id))
        .join(",");
      setSelectedStudent(value);
    },
    [],
  );

  // Fetch all session feedbacks
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      "getAllSessionFeedbacks",
      currentPage,
      rowsPerPage,
      debouncedSearch,
      selectedStudent,
      selectedTeacher,
    ],
    queryFn: () =>
      getAllSessionsFeedbacks(
        {
          page: currentPage,
          limit: rowsPerPage,
          sessionId: debouncedSearch ? debouncedSearch : "",
          userId:
            role === "student" || role === "teacher"
              ? String(user?.id)
              : selectedStudent
                ? selectedStudent
                : selectedTeacher
                  ? selectedTeacher
                  : "",
        },
        { token },
      ),
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 60000,
  });

  // Add feedback mutation
  // const handleAdd = useMutation({
  //   mutationFn: (payload: any) =>
  //     createSessionFeedback(payload, {
  //       token,
  //     }),
  //   onSuccess: (data: any) => {
  //     if (data.message || data.error) {
  //       return toast.error(data.message || data.error);
  //     }
  //     setIsAddFeedbackModalOpen(false);
  //     refetch();
  //     toast.success("Session Feedback Added Successfully");
  //   },
  //   onError: (error) => {
  //     const axiosError = error as MyAxiosError;
  //     if (axiosError?.response) {
  //       toast.error(
  //         axiosError?.response?.data?.message ||
  //           axiosError?.response?.data?.error ||
  //           `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
  //       );
  //     } else {
  //       toast.error(axiosError.message);
  //     }
  //   },
  // });

  // Edit feedback mutation - THIS WAS MISSING
  const handleEdit = useMutation({
    mutationFn: (payload: any) =>
      updateSessionFeedback(payload.id, payload, { token }),
    onSuccess: (data: any) => {
      if (data.message || data.error) {
        return toast.error(data.message || data.error);
      }
      handleEditModalClose();
      refetch();
      toast.success("Session Feedback Updated Successfully");
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.message ||
            axiosError?.response?.data?.error ||
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
    },
  });

  // Delete feedback mutation
  const handleDelete = useMutation({
    mutationFn: (payload: { id: number }) =>
      deleteSessionFeedback(payload.id, { token }),
    onSuccess: (data: any) => {
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success("Session Feedback Deleted Successfully");
        refetch();
      }
      handleDeleteModalClose();
    },
    onError: (error) => {
      const axiosError = error as MyAxiosError;
      if (axiosError?.response) {
        toast.error(
          axiosError?.response?.data?.error ||
            `${axiosError?.response?.status} ${axiosError?.response?.statusText}`,
        );
      } else {
        toast.error(axiosError.message);
      }
      handleDeleteModalClose();
    },
  });

  // Memoized props
  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: { alignSelf: "flex-end" },
    }),
    [showFullFilters, handleMobileFilterToggle],
  );

  const searchBoxProps = useMemo(
    () => ({
      placeholder: "Search Session ID",
      changeFn: handleSessionSearchId,
      value: sessionIdSearch,
    }),
    [handleSessionSearchId, sessionIdSearch],
  );

  const studentFilterProps = useMemo(
    () => ({
      icon: true,
      placeholder: "Filter student",
      handleChange: handleStudentFilter,
      data: students?.users || [],
      value: students?.users?.filter((student: any) =>
        selectedStudent.split(",").includes(String(student.id)),
      ),
    }),
    [handleStudentFilter, students?.users, selectedStudent],
  );

  const teacherFilterProps = useMemo(
    () => ({
      icon: true,

      placeholder: "Filter teacher",
      data: teachers?.users || [],
      value: teachers?.users?.filter((teacher) =>
        selectedTeacher.split(",").includes(String(teacher.id)),
      ),
      handleChange: handleTeacherFilter,
    }),
    [handleTeacherFilter, teachers?.users, selectedTeacher],
  );

  const tableProps = useMemo(
    () => ({
      data: data?.data || [],
      currentPage: data?.currentPage || 1,
      totalCount: data?.totalCount || data?.data?.length || 0,
      totalPages: data?.totalPages || 1,
      rowsPerPage: rowsPerPage,
      handleChangePage: handleChangePage,
      handleChangeRowsPerPage: handleChangeRowsPerPage,
      handleDeleteModal: handleDeleteModalOpen,
      handleEditModal: handleEditModalOpen,
    }),
    [
      data?.data,
      data?.currentPage,
      data?.totalCount,
      data?.totalPages,
      rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleDeleteModalOpen,
      handleEditModalOpen,
    ],
  );

  const deleteModalProps = useMemo(
    () => ({
      modalOpen: deleteModalOpen?.open,
      handleClose: handleDeleteModalClose,
      subHeading:
        "Are you sure you want to delete this session feedback? This action is permanent.",
      heading: "Are You Sure?",
      handleDelete: () => {
        if (deleteModalOpen.deleteId) {
          handleDelete.mutate({ id: deleteModalOpen.deleteId });
        }
      },
      loading: handleDelete?.isPending,
    }),
    [deleteModalOpen, handleDeleteModalClose, handleDelete],
  );

  // const addFeedBackModalProps = useMemo(
  //   () => ({
  //     isOpen: isAddFeedbackModalOpen,
  //     handleClose: handleAddModalClose,
  //     onSubmit: handleAdd?.mutate,
  //     isSuccess: handleAdd?.isSuccess,
  //     loading: handleAdd?.isPending,
  //     heading: "Give Feedback",
  //     subHeading: "We would love to hear from you!",
  //   }),
  //   [isAddFeedbackModalOpen, handleAddModalClose, handleAdd],
  // );

  const editFeedBackModalProps = useMemo(
    () => ({
      isOpen: updateModalOpen.open,
      handleClose: handleEditModalClose,
      onSubmit: handleEdit?.mutate,
      isSuccess: handleEdit?.isSuccess,
      loading: handleEdit?.isPending,
      heading: "Edit Feedback",
      subHeading: "Edit this feedback!",
      feedbackData: updateModalOpen.profile,
    }),
    [
      updateModalOpen.open,
      updateModalOpen.profile,
      handleEditModalClose,
      handleEdit,
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
    <div className={classes.container}>
      <div className={classes.section1}>
        <>
          {role !== "teacher" && role !== "student" && role !== "parent" && (
            <>
              <div className={classes.buttonContainer}>
                <MobileFilterButton {...mobileFilterButtonProps} />
              </div>
              {showFullFilters && (
                <div className={classes.filtersBox}>
                  <SearchBox {...searchBoxProps} />
                  <MultiSelectDropDown {...studentFilterProps} />
                  <MultiSelectDropDown {...teacherFilterProps} />
                </div>
              )}
            </>
          )}
        </>
      </div>
      {isLoading ? (
        <LoadingBox
          inlineStyling={{ flex: "0 1 calc(100% - 10px)", minHeight: "0" }}
        />
      ) : !data?.data?.length ? (
        <ErrorBox
          inlineStyling={{ flex: "0 1 calc(100% - 10px)", minHeight: "0" }}
        />
      ) : (
        <MobileViewCard {...tableProps} />
      )}
      {/* <AddFeedbackModal {...addFeedBackModalProps} /> */}
      <EditFeedbackModal {...editFeedBackModalProps} />
      <DeleteModal {...deleteModalProps} />
    </div>
  );
};

export default SessionFeedbacks;
