"use client";
import classes from "./enrollments.module.css";
// modules & libraries
import { useState, useCallback, FC, useMemo, useEffect } from "react";
import moment from "moment";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
// services
import { MyAxiosError } from "@/services/error.type";
import {
  getAllEnrollments,
  getAllEnrollmentsExcelData,
  addEnrollment,
  deleteEnrollment,
  changeBreakStatus,
  editEnrollmentByGroupId,
} from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { classScheduleInstant } from "@/services/dashboard/superAdmin/class-schedule/class-schedule-scheduleInstan";
import {
  Create_Enrollment_Payload_Type,
  ChangeEnrollmentBrekStatus_Api_Payload_Type,
} from "@/types/enrollment/getAllEnrollments.types";
// components
import EnrollmentTable from "@/components/ui/superAdmin/enrollment/enrollment-table/enrollment-table";
import AddModal from "@/components/ui/superAdmin/enrollment/add-modal/add-Modal";
import InstantClassModal from "@/components/ui/superAdmin/enrollment/instantClass-modal/instantClass-modal";
import DeleteModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import ManualClassModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import EditEnrollmentModal from "@/components/ui/superAdmin/enrollment/edit-enrollment-modal/edit-enrollment-modal";
import EnrollmentExtraClassModalWrapper from "@/components/ui/superAdmin/enrollment/extraClass-modal-wrapper/extraClass-modal-wrapper";
import Button from "@/components/global/button/button";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
//types
import {
  ModalState,
  FilterState,
  EnrollmentItem,
} from "./enrollment-form-types";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { useParams } from "next/navigation";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import SearchBox from "@/components/global/search-box/search-box";
import useDebounce from "@/utils/helpers/useDebounce";
import MobileViewCard from "@/components/ui/superAdmin/enrollment/mobileView-card/mobileView-card";
import EnrollmentPauseModal from "@/components/ui/superAdmin/enrollment/enrollment-pause-modal/enrollment-pause-modal";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import { useMediaQuery } from "react-responsive";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const initialModalState: ModalState = {
  add: false,
  edit: false,
  delete: false,
  manualClass: { open: false, enrollment_id: null, duration: null },
  instantClass: { open: false, enrollment_id: null },
  extraClass: { open: false, enrollment_id: null },
  pause: {
    open: false,
    id: null,
    name: "",
    on_break: null,
    is_permanent: null,
  },
};

const initialFilterState: FilterState = {
  currentPage: 1,
  rowsPerPage: 50,
  dateFilter: "",
  selectedTeacher: "",
  selectedStudent: "",
  enrollmentSearch: "",
  on_break: "",
};

const EnrollmentForm: FC = () => {
  const queryClient = useQueryClient();
  const mobileViewport = useMediaQuery({ maxWidth: 1220 });
  const { role } = useParams();
  const { token, user, childrens } = useAppSelector((state) => state?.user);
  const { subject, curriculum, board, grades } = useAppSelector(
    (state) => state.resources,
  );
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  // State management
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const debouncedSearch = useDebounce(filters.enrollmentSearch, 1500);
  const [modals, setModals] = useState<ModalState>(initialModalState);
  const [deleteId, setDeleteId] = useState<string>("");
  const [editEnrollmentObj, setEditEnrollmentObj] =
    useState<EnrollmentItem | null>(null);
  const [excelDataLoaidng, setExcelDataLoading] = useState<boolean>(false);
  const [adminSelectedBoard, setAdminSelectedBoard] = useState<any>([]);
  const [adminSelectedCurriculum, setAdminSelectedCurriculum] = useState<any>(
    [],
  );
  const [adminSelectedGrade, setAdminSelectedGrade] = useState<any>([]);
  const [adminSelectedSubject, setAdminSelectedSubject] = useState<any>([]);
  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  // Helper function to update filters
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        ...(key !== "currentPage" ? { currentPage: 1 } : {}),
      }));
    },
    [],
  );

  // Modal toggle helper
  const toggleModal = useCallback(
    <K extends keyof ModalState>(
      modalName: K,
      value: ModalState[K],
      additionalData: Partial<ModalState> = {},
    ) => {
      setModals((prev) => ({
        ...prev,
        [modalName]:
          typeof value === "object" && value !== null ? { ...value } : value,
        ...additionalData,
      }));
    },
    [],
  );

  const handleEnrollmentSearch = useCallback((e: any) => {
    const enrollmentSearch = e.target.value;
    updateFilter("enrollmentSearch", enrollmentSearch);
  }, []);

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

  const handleFilterByStatus = useCallback(
    (value: string) => {
      updateFilter("on_break", value);
    },
    [updateFilter],
  );

  const handleTeacherFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedTeacher = selectedOptions.map((option) =>
        String(option.id),
      );
      updateFilter("selectedTeacher", selectedTeacher.join(","));
    },
    [],
  );

  const handleStudentFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedStudent = selectedOptions.map((option) =>
        String(option.id),
      );
      updateFilter("selectedStudent", selectedStudent.join(","));
    },
    [],
  );

  const handleAdminBoardFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedBoard(selectedIds);
      updateFilter("currentPage", 1);
    },
    [],
  );

  const handleAdminCurriculumFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedCurriculum(selectedIds);
      updateFilter("currentPage", 1);
    },
    [],
  );

  const handleAdminGradeFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedGrade(selectedIds);
      updateFilter("currentPage", 1);
    },
    [],
  );

  const handleAdminSubjectFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedSubject(selectedIds);
      updateFilter("currentPage", 1);
    },
    [],
  );

  // Modal handlers
  const handeAddModalClose = useCallback(
    () => toggleModal("add", false),
    [toggleModal],
  );
  const handleAddModalOpen = useCallback(
    () => toggleModal("add", true),
    [toggleModal],
  );

  const handlePauseModelClose = useCallback(
    () =>
      toggleModal("pause", {
        open: false,
        id: null,
        name: "",
        on_break: null,
        is_permanent: null,
      }),
    [toggleModal],
  );

  const handleDeleteModalClose = useCallback(() => {
    toggleModal("delete", false);
    setDeleteId("");
  }, [toggleModal]);

  const handleDeleteModalOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>, id: number | string) => {
      e.stopPropagation();
      toggleModal("delete", true);
      setDeleteId(id.toString());
    },
    [toggleModal],
  );

  const handleEditModalOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>, item: EnrollmentItem) => {
      e.stopPropagation();
      toggleModal("edit", true);
      setEditEnrollmentObj(item);
    },
    [toggleModal],
  );

  const handleInstantClassModalOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>, item: EnrollmentItem) => {
      e.stopPropagation();
      toggleModal("instantClass", {
        open: true,
        enrollment_id: Number(item?.id),
      });
    },
    [toggleModal],
  );

  const handeInstantClassModalClose = useCallback(() => {
    toggleModal("instantClass", { open: false, enrollment_id: null });
  }, [toggleModal]);

  const handleExtraClassModalOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>, item: EnrollmentItem) => {
      e.stopPropagation();
      toggleModal("extraClass", {
        open: true,
        enrollment_id: Number(item?.id),
      });
    },
    [toggleModal],
  );

  const handeExtraClassModalClose = useCallback(() => {
    toggleModal("extraClass", { open: false, enrollment_id: null });
  }, [toggleModal]);

  const handeManualClassModalClose = useCallback(() => {
    toggleModal("instantClass", { open: false, enrollment_id: null });
    toggleModal("manualClass", {
      open: false,
      enrollment_id: null,
      duration: null,
    });
  }, [toggleModal]);

  // Common mutation options
  const createMutationOptions = useCallback(
    (
      successMessage: string,
      onSuccessAction: (() => void) | null,
      closeModal: keyof ModalState | null,
    ) => ({
      onSuccess: (data: any) => {
        // Handle error messages
        if (
          successMessage === "Enrollment Deleted Successfully" ||
          successMessage === "Enrollment Added Successfully"
        ) {
          if (
            filters?.dateFilter ||
            filters?.selectedStudent ||
            filters?.selectedTeacher
          ) {
            setFilters({ ...initialFilterState });
          }
        }

        if (data?.message) {
          toast.success(data?.message);
        }
        if (data?.error) {
          toast.error(data.error);
        }

        // Handle normal success
        if (closeModal) toggleModal(closeModal, false);
        {
          successMessage && toast.success(successMessage);
        }
        queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });

        // Handle conflict found
        if (data?.conflictFound === true) {
          toggleModal("instantClass", { open: false, enrollment_id: null });
        }

        // Run success callback if provided
        if (onSuccessAction) onSuccessAction();
      },
      onError: (error: unknown) => {
        const axiosError = error as MyAxiosError;
        toast.error(
          axiosError.message ||
            (axiosError?.response
              ? axiosError?.response.status === 404
                ? "No enrollments found"
                : axiosError?.response.data.error ||
                  `${axiosError?.response.status} ${axiosError?.response.statusText}`
              : "An unexpected error occurred"),
        );
        if (closeModal) toggleModal(closeModal, false);
      },
    }),
    [queryClient, toggleModal, filters],
  );

  // Mutations
  const handleInstanClass = useMutation({
    mutationFn: async (payload: {
      duration: number | null;
      enrollment_id: number | null;
      isBypass?: boolean;
    }) => {
      const response = await classScheduleInstant({ token }, payload);

      if (
        response?.conflictFound &&
        response?.data === null &&
        response?.conflictingSchedule
      ) {
        // Update manual class modal state
        toast.error("Class is already booked for now.");
        toggleModal("manualClass", {
          open: true,
          enrollment_id: payload.enrollment_id,
          duration: payload.duration,
          name: response?.conflictingSchedule?.enrollment?.name,
          startTime:
            response?.conflictingSchedule?.duration !== null
              ? moment
                  .utc(response?.conflictingSchedule?.createdAt)
                  .local()
                  .format("h:mm a")
              : moment
                  .utc(
                    response?.conflictingSchedule?.teacherSchedule?.start_time,
                    "HH:mm:ss",
                  )
                  .local()
                  .format("h:mm a"),
          endTime:
            response?.conflictingSchedule?.duration !== null
              ? moment
                  .utc(response?.conflictingSchedule?.createdAt)
                  .add(response?.conflictingSchedule?.duration, "minutes")
                  .local()
                  .format("h:mm a")
              : moment
                  .utc(response?.conflictingSchedule?.createdAt)
                  .add(
                    response?.conflictingSchedule?.teacherSchedule
                      ?.session_duration,
                    "minutes",
                  )
                  .local()
                  .format("h:mm a"),
        });
      } else if (
        payload?.isBypass &&
        response?.data &&
        response?.conflictFound === true
      ) {
        toggleModal("instantClass", { open: false, enrollment_id: null });
        toggleModal("manualClass", {
          open: false,
          enrollment_id: null,
          duration: null,
        });
        toast.success("Instant class created successfully.");
      } else {
        toast.success("Instant class created successfully.");
        toggleModal("instantClass", { open: false, enrollment_id: null });
      }

      return response;
    },
  });

  const handleAdd = useMutation({
    mutationFn: (payload: Create_Enrollment_Payload_Type) =>
      addEnrollment(payload, { token }),
    ...createMutationOptions("Enrollment Added Successfully", null, "add"),
  });

  const handleEditEnrollment = useMutation({
    mutationFn: (payload: any) =>
      editEnrollmentByGroupId(String(editEnrollmentObj?.id), payload, {
        token,
      }),
    ...createMutationOptions("Enrollment Edited Successfully", null, "edit"),
  });

  const handleDelete = useMutation({
    mutationFn: (payload: { id: string }) =>
      deleteEnrollment(payload, { token }),
    ...createMutationOptions(
      "Enrollment Deleted Successfully",
      () => setDeleteId(""),
      "delete",
    ),
  });

  const handleEnrollmentPause = useMutation({
    mutationFn: (payload: ChangeEnrollmentBrekStatus_Api_Payload_Type) =>
      changeBreakStatus(payload, { token }),
    onSuccess: (data) => {
      if (data) {
        toast.success(data?.message);
      }
      toggleModal("pause", {
        open: false,
        id: null,
        name: "",
        on_break: null,
        is_permanent: null,
      });
      queryClient.invalidateQueries({ queryKey: ["enrollments", "list"] });
    },
    onError: (error: unknown) => {
      const axiosError = error as MyAxiosError;
      toast.error(
        axiosError.message ||
          (axiosError?.response
            ? axiosError?.response.status === 404
              ? "No enrollments found"
              : axiosError?.response.data.error ||
                `${axiosError?.response.status} ${axiosError?.response.statusText}`
            : "An unexpected error occurred"),
      );
    },
  });

  const handleSwitchCallback = useCallback(
    (
      e: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>,
      payload: {
        id: number | null;
        name: string;
        on_break: boolean | null;
        is_permanent: null | false | true;
      },
    ) => {
      e.stopPropagation();
      toggleModal("pause", {
        open: true,
        id: payload?.id,
        name: payload?.name,
        on_break: payload?.on_break,
        is_permanent: payload?.is_permanent,
      });
    },
    [],
  );

  // Memoized component props

  const instantClassProps = useMemo(
    () => ({
      modalOpen: modals.instantClass?.open,
      handleClose: handeInstantClassModalClose,
      heading: "Instant Class Override",
      subHeading: "Enter Class Duration in Minutes",
      handleAdd: (payload: { duration: number }) => {
        handleInstanClass?.mutate({
          ...payload,
          enrollment_id: modals.instantClass?.enrollment_id || null,
        });
      },
      loading: handleInstanClass?.isPending,
    }),
    [
      modals.instantClass?.open,
      modals.instantClass?.enrollment_id,
      handeInstantClassModalClose,
      handleInstanClass,
    ],
  );

  const manualClassModalProps = useMemo(() => {
    const name = modals.manualClass?.name?.split("-")[0]?.trim() || "";
    const startTime = modals.manualClass?.startTime || "";
    const endTime = modals.manualClass?.endTime || "";

    return {
      modalOpen: modals.manualClass?.open,
      handleClose: handeManualClassModalClose,
      heading: "Are you sure you want to start a manual class?",
      subHeading: `Class is already booked for this enrollment "${name}" at ${startTime} to ${endTime}!`,
      buttonText: "Start Class",
      handleDelete: () =>
        handleInstanClass.mutate({
          duration: modals?.manualClass?.duration || null,
          enrollment_id: modals?.manualClass?.enrollment_id || null,
          isBypass: true,
        }),
      loading: handleInstanClass.isPending,
    };
  }, [
    modals.manualClass?.open,
    modals.manualClass?.duration,
    modals.manualClass?.enrollment_id,
    handeManualClassModalClose,
    handleInstanClass,
  ]);

  const enrollmentPauseModalProps = useMemo(
    () => ({
      modalValues: modals.pause,
      handleClose: handlePauseModelClose,
      heading: "Pause Enrollment",
      subHeading:
        "Are you sure to pause or unpause this enrollment temporary or permanent",
      handleEnrollmentPause: (payload: any) =>
        handleEnrollmentPause.mutate(payload),
      loading: handleEnrollmentPause?.isPending,
    }),
    [modals.pause, handlePauseModelClose, handleEnrollmentPause],
  );

  const addModalProps = useMemo(
    () => ({
      modalOpen: modals.add,
      handleClose: handeAddModalClose,
      heading: "Add Enrollment",
      subHeading: "Fill out the form in order to create the enrollment",
      subject: subject || [],
      curriculum: curriculum || [],
      board: board || [],
      grades: grades || [],
      students: students?.users || [],
      teachers: teachers?.users || [],
      handleAdd: (payload: Create_Enrollment_Payload_Type) =>
        handleAdd.mutate(payload),
      loading: handleAdd?.isPending,
      success: handleAdd?.isSuccess,
    }),
    [
      modals.add,
      handeAddModalClose,
      subject,
      curriculum,
      board,
      grades,
      students?.users,
      teachers?.users,
      handleAdd,
    ],
  );

  const editModalProps = useMemo(
    () => ({
      data: editEnrollmentObj || {},
      subject: subject || [],
      curriculum: curriculum || [],
      board: board || [],
      grades: grades || [],
      students: students?.users || [],
      teachers: teachers?.users || [],
      loading: handleEditEnrollment?.isPending,
      heading: "Edit Enrollment",
      subHeading: "Fill out the form in order to edit the enrollment details.",
      modalOpen: modals.edit,
      handleClose: () => toggleModal("edit", false),
      handleEdit: (payload: any) => handleEditEnrollment?.mutate(payload),
    }),
    [
      editEnrollmentObj,
      subject,
      curriculum,
      board,
      grades,
      students?.users,
      teachers?.users,
      handleEditEnrollment?.isPending,
      modals.edit,
      toggleModal,
      handleEditEnrollment,
    ],
  );

  const deleteModalProps = useMemo(
    () => ({
      modalOpen: modals.delete,
      handleClose: handleDeleteModalClose,
      subHeading:
        "Are you sure you want to delete this enrollment? This action is permanent.",
      heading: "Are You Sure?",
      handleDelete: () => handleDelete.mutate({ id: deleteId }),
      loading: handleDelete?.isPending,
    }),
    [modals.delete, handleDeleteModalClose, deleteId, handleDelete?.isPending],
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
      subjectId:
        adminSelectedSubject && adminSelectedSubject.length > 0
          ? adminSelectedSubject.join(",")
          : "",
      curriculumId:
        adminSelectedCurriculum && adminSelectedCurriculum.length > 0
          ? adminSelectedCurriculum.join(",")
          : "",
      boardId:
        adminSelectedBoard && adminSelectedBoard.length > 0
          ? adminSelectedBoard.join(",")
          : "",
      gradeId:
        adminSelectedGrade && adminSelectedGrade.length > 0
          ? adminSelectedGrade.join(",")
          : "",
      childrens:
        user?.roleId === 4
          ? childrens?.map((i: any) => i.id).join(",") || ""
          : "",
      teacher_id:
        (role === "teacher" ? String(user?.id) : filters.selectedTeacher) || "",
      student_id:
        (role === "student" ? String(user?.id) : filters.selectedStudent) || "",
      enrollment_id: debouncedSearch ? debouncedSearch : "",
      on_break: filters?.on_break
        ? filters?.on_break === "paused" ||
          filters?.on_break === "permanent pause" ||
          filters?.on_break === "temporary pause"
          ? true
          : false
        : "",
      is_permanent:
        filters?.on_break === "permanent pause"
          ? true
          : filters?.on_break === "temporary pause"
            ? false
            : "",
    }),
    [
      filters.rowsPerPage,
      filters.currentPage,
      filters.dateFilter,
      filters.selectedTeacher,
      filters.selectedStudent,
      filters.on_break,
      adminSelectedBoard,
      adminSelectedCurriculum,
      adminSelectedSubject,
      adminSelectedGrade,
      debouncedSearch,
      user?.roleId,
      user?.id,
    ],
  );

  const handleEnrollmentsExcelData = useCallback(async () => {
    try {
      setExcelDataLoading(true);
      const data = await getAllEnrollmentsExcelData(queryParams, { token });
      setExcelDataLoading(false);
      if (data) {
        toast.success(`Excel Data fetched successfully`);
      }
    } catch (error) {
      console.error("Error fetching Excel data:", error);
      setExcelDataLoading(false);
      toast.error("Error fetching Excel data");
    }
  }, [queryParams]);

  // Data fetching
  const { data, error, isLoading } = useQuery({
    queryKey: [
      "enrollments",
      "list",
      filters.currentPage,
      filters.rowsPerPage,
      filters.dateFilter,
      filters.selectedTeacher,
      filters.selectedStudent,
      filters.on_break,
      adminSelectedBoard,
      adminSelectedCurriculum,
      adminSelectedSubject,
      adminSelectedGrade,
      user?.roleId,
      handleDelete?.isSuccess,
      debouncedSearch,
    ],
    queryFn: () => getAllEnrollments(queryParams, { token }),
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
      handleDeleteModal: handleDeleteModalOpen,
      handleEditModal: handleEditModalOpen,
      handleInstantClassModal: handleInstantClassModalOpen,
      handleExtraClassModal: handleExtraClassModalOpen,
      handleSwitch: handleSwitchCallback,
    }),
    [
      data,
      filters.rowsPerPage,
      handleChangePage,
      handleChangeRowsPerPage,
      handleDeleteModalOpen,
      handleEditModalOpen,
      handleInstantClassModalOpen,
      handleExtraClassModalOpen,
      handleSwitchCallback,
    ],
  );

  const addEnrollmentButtonProps = useMemo(
    () => ({
      text: "New Enrollment",
      icon: <AddOutlinedIcon />,
      clickFn: handleAddModalOpen,
      inlineStyling: { width: "max-content" },
    }),
    [handleAddModalOpen],
  );

  const getEnrollmentExcelDataButtonProps = useMemo(
    () => ({
      text: "Export ",
      clickFn: handleEnrollmentsExcelData,
      inlineStyling: {
        width: "100px",
      },
      loading: excelDataLoaidng,
      icon: <FileDownloadIcon />,
    }),
    [handleEnrollmentsExcelData, excelDataLoaidng],
  );

  const filterByDateProps = useMemo(
    () => ({
      changeFn: handleCalendar,
      value: filters.dateFilter,
      minWidth: "320px",
      // flex: 1,
    }),
    [filters.dateFilter, handleCalendar],
  );

  const filterByStatusProps = useMemo(
    () => ({
      placeholder: "Filter status",
      data: ["paused", "unpaused", "temporary pause", "permanent pause"],
      handleChange: handleFilterByStatus,
      value: filters?.on_break,
      inlineBoxStyles: styles.dropDownStyles,
    }),
    [filters.on_break, handleFilterByStatus],
  );

  const multiSelectBoardProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...styles.dropDownStyles,
      },
      placeholder: "Filter board",
      data: board || [],
      handleChange: handleAdminBoardFilter,
      value:
        board?.filter((boardItem) =>
          adminSelectedBoard.includes(String(boardItem?.id)),
        ) || [],
    }),
    [board, handleAdminBoardFilter, adminSelectedBoard],
  );

  const multiSelectGradeProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...styles.dropDownStyles,
      },
      placeholder: "Filter grade",
      data: grades || [],
      handleChange: handleAdminGradeFilter,
      value:
        grades?.filter((gradeItem) =>
          adminSelectedGrade.includes(String(gradeItem?.id)),
        ) || [],
    }),
    [grades, handleAdminGradeFilter, adminSelectedGrade],
  );

  const multiSelectCurriculumProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...styles.dropDownStyles,
      },
      placeholder: "Filter curriculum",
      data: curriculum || [],
      handleChange: handleAdminCurriculumFilter,
      value:
        curriculum?.filter((curriculumItem) =>
          adminSelectedCurriculum.includes(String(curriculumItem?.id)),
        ) || [],
    }),
    [curriculum, handleAdminCurriculumFilter, adminSelectedCurriculum],
  );

  const multiSelectSubjectProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...styles.dropDownStyles,
      },
      placeholder: "Filter subject",
      data: subject || [],
      handleChange: handleAdminSubjectFilter,
      value:
        subject?.filter((subjectItem) =>
          adminSelectedSubject.includes(String(subjectItem?.id)),
        ) || [],
    }),
    [subject, handleAdminSubjectFilter, adminSelectedSubject],
  );

  const studentFilterProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...styles.dropDownStyles,
      },
      placeholder: "Filter student",
      handleChange: handleStudentFilter,
      data: students?.users || [],
      value: students?.users?.filter((student: any) =>
        filters.selectedStudent.split(",").includes(String(student.id)),
      ),
    }),
    [handleStudentFilter, students?.users, filters.selectedStudent],
  );

  const teacherFilterProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...styles.dropDownStyles,
      },
      placeholder: "Filter teacher",
      data: teachers?.users || [],
      value: teachers?.users?.filter((teacher) =>
        filters.selectedTeacher.split(",").includes(String(teacher.id)),
      ),
      handleChange: handleTeacherFilter,
    }),
    [handleTeacherFilter, teachers?.users, filters.selectedTeacher],
  );

  const searchBoxProps = useMemo(
    () => ({
      placeholder: "Search enroll_id",
      changeFn: handleEnrollmentSearch,
      value: filters.enrollmentSearch ? String(filters.enrollmentSearch) : "",
      inlineStyles: {
        ...styles.dropDownStyles,
      },
    }),
    [handleEnrollmentSearch, filters.enrollmentSearch],
  );

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showFullFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: { width: "max-content", alignSelf: "flex-end" },
    }),
    [showFullFilters, handleMobileFilterToggle],
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
          {role !== "teacher" && role !== "student" && role !== "parent" && (
            <div className={classes.buttonBox}>
              {/* {mobileViewport && ( */}
              <MobileFilterButton {...mobileFilterButtonProps} />
              <Button {...addEnrollmentButtonProps} />
              <Button {...getEnrollmentExcelDataButtonProps} />
            </div>
          )}
          {showFullFilters && (
            <div className={classes.filtersBox}>
              <FilterByDate {...filterByDateProps} />
              {role !== "student" && (
                <MultiSelectDropDown {...studentFilterProps} />
              )}
              {role !== "teacher" && (
                <MultiSelectDropDown {...teacherFilterProps} />
              )}
              {(role === "admin" ||
                role === "superAdmin" ||
                role === "counsellor" ||
                role === "hr") && (
                <>
                  <SearchBox {...searchBoxProps} />
                  <FilterDropdown {...filterByStatusProps} />
                  <MultiSelectDropDown {...multiSelectSubjectProps} />
                  <MultiSelectDropDown {...multiSelectBoardProps} />
                  <MultiSelectDropDown {...multiSelectGradeProps} />
                  <MultiSelectDropDown {...multiSelectCurriculumProps} />
                </>
              )}
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
          <EnrollmentTable {...tableProps} />
        )}
      </main>
      <AddModal {...addModalProps} />
      <InstantClassModal {...instantClassProps} />
      <ManualClassModal {...manualClassModalProps} />
      <EnrollmentExtraClassModalWrapper
        open={modals.extraClass?.open}
        id={
          modals.extraClass?.enrollment_id
            ? String(modals.extraClass.enrollment_id)
            : null
        }
        onClose={handeExtraClassModalClose}
      />
      <EnrollmentPauseModal {...enrollmentPauseModalProps} />
      <EditEnrollmentModal {...editModalProps} />
      <DeleteModal {...deleteModalProps} />
    </>
  );
};

export default EnrollmentForm;

const styles = {
  dropDownStyles: {
    background: "var(--main-white-color)",
  },
};
