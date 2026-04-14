"use client";
import React, { useState, useCallback, useMemo } from "react";
import classes from "./sessions.module.css";
import moment from "moment";
import { toast } from "react-toastify";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { Box } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import Button from "@/components/global/button/button";
import SessionTable from "@/components/ui/superAdmin/sessions/session-table/session-table";
import AddModal from "@/components/ui/superAdmin/sessions/add-modal/add-modal";
import DeleteModal from "@/components/ui/superAdmin/enrollment/delete-modal/delete-modal";
import { MyAxiosError } from "@/services/error.type";
import {
  getSessionsExcelData,
  getAllSessionWithGroupIds,
  recreacteSession,
  deleteSession,
  createSession,
  updateTeacherDuration,
} from "@/services/dashboard/superAdmin/sessions/sessions";
import { GetAllSessionsWithGroupIds_Payload_Type } from "@/types/sessions/getAllSessionsWithGroupIds.types";
import { Create_Session_Payload_Type } from "@/types/sessions/createSession.types";
import { getSessionsMonthlyTagCount } from "@/services/dashboard/superAdmin/analytics/analytics";
import { getAllEnrollments } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import SearchBox from "@/components/global/search-box/search-box";
import useDebounce from "@/utils/helpers/useDebounce";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { useParams } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import MobileViewCard from "@/components/ui/superAdmin/sessions/mobileViewCard/mobileViewCard";
import TeacherDurationUpdateModal from "@/components/ui/superAdmin/sessions/teacherDurationUpdateModal/teacherDurationUpdateModal";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const sessionTypes = [
  "Conducted",
  "Cancelled",
  "Teacher Absent",
  "Student Absent",
  "No Show",
];

const SessionForm: React.FC = () => {
  const mobileViewport = useMediaQuery({ maxWidth: 1220 });
  const { role } = useParams();
  const { user, token, enrollementIds, childrens } = useAppSelector(
    (state) => state.user,
  );
  const { subject, board, grades, curriculum } = useAppSelector(
    (state) => state?.resources,
  );
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);

  // Determine if user is admin, student, or teacher
  const isAdmin =
    role === "admin" ||
    role === "superAdmin" ||
    role === "hr" ||
    role === "counsellor" ||
    role === "manager";
  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const isParent = role === "parent";

  //loading state
  const [excelDataLoading, setExcelDataLoading] = useState<boolean>(false);

  // date filter states
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<null | string[]>([
    moment().startOf("month").format("YYYY-MM-DD"),
    moment().endOf("month").format("YYYY-MM-DD"),
  ]);
  const [enrollmentsDataSearch, setEnrollmentsDataSearch] =
    useState<string>("");
  // debounce
  const debouncedSearch = useDebounce(enrollmentsDataSearch, 1500);
  const [adminSelectedStudent, setAdminSelectedStudent] = useState<any>([]);
  const [adminSelectedTeacher, setAdminSelectedTeacher] = useState<any>([]);
  const [adminSelectedBoard, setAdminSelectedBoard] = useState<any>([]);
  const [adminSelectedCurriculum, setAdminSelectedCurriculum] = useState<any>(
    [],
  );
  const [adminSelectedGrade, setAdminSelectedGrade] = useState<any>([]);
  const [adminSelectedSubject, setAdminSelectedSubject] = useState<any>([]);
  const [selectedConclusionType, setSelectedConclusionType] = useState("");
  const [selectedRecording, setSelectedRecording] = useState("");
  const [selectedReviewed, setSelectedReviewed] = useState("");
  const [benchMark, setBenchMark] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(15);
  // add session
  const [addModal, setAddModal] = useState<boolean>(false);
  // delete session
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>("");
  // teacher duration update modal
  const [teacherDurationUpdateModal, setTeacherDurationUpdateModal] = useState<{
    open: boolean;
    session_id: number | null;
    tutor_class_time: number | string | null;
  }>({
    open: false,
    session_id: null,
    tutor_class_time: null,
  });

  // Fetch enrollments if user is student or teacher
  const { data: enrollmentsData, error: enrollmentsError } = useQuery({
    queryKey: ["enrollments", "for-session-filters", user?.id, isStudent, isTeacher, isParent],
    queryFn: () =>
      getAllEnrollments(
        {
          limit: 50,
          page: 1,
          student_id: isStudent ? String(user?.id) || "" : "",
          teacher_id: isTeacher ? String(user?.id) || "" : "",
          childrens: isParent
            ? childrens?.map((i: any) => i.id).join(",")
            : undefined,
        },
        { token },
      ),
    enabled: Boolean(token && (isStudent || isTeacher || isParent)),
  });

  // Build payload for sessions query
  const sessionsPayload =
    useMemo((): GetAllSessionsWithGroupIds_Payload_Type => {
      let payload: GetAllSessionsWithGroupIds_Payload_Type = {
        conclusion_type: selectedConclusionType || "",
        board_id: adminSelectedBoard.join(",") || "",
        curriculum_id: adminSelectedCurriculum.join(",") || "",
        grade_id: adminSelectedGrade.join(",") || "",
        subject_id: adminSelectedSubject.join(",") || "",
        start_time: dateFilter ? moment(dateFilter[0]).toISOString() : "",
        end_time: dateFilter
          ? moment(dateFilter[1]).add(1, "days").toISOString()
          : "",
      };

      if (isAdmin) {
        payload = {
          ...payload,
          enrollment_id: debouncedSearch ? debouncedSearch : "",
          tutor_id: adminSelectedTeacher.join(",") || "",
          student_ids: adminSelectedStudent.join(",") || "",
          include_recording:
            selectedRecording === "Available"
              ? "true"
              : selectedRecording === "Not Available"
                ? "false"
                : "",
          is_reviewed: (selectedReviewed as any) || undefined,
          below_benchmark:
            benchMark === "Below Benchmark"
              ? "true"
              : benchMark === "Above Benchmark"
                ? "false"
                : "",
        };
      } else if (isStudent) {
        payload = {
          ...payload,
          student_ids: String(user?.id) || "",
          tutor_id: adminSelectedTeacher.join(",") || "",
        };
      } else if (isTeacher) {
        payload = {
          ...payload,
          tutor_id: String(user?.id) || "",
          student_ids: adminSelectedStudent.join(",") || "",
        };
      } else if (isParent) {
        payload = {
          ...payload,
          tutor_id: adminSelectedTeacher.join(",") || "",
          student_ids: adminSelectedStudent.join(",") || "",
        };
      }

      return payload;
    }, [
      selectedConclusionType,
      adminSelectedBoard,
      adminSelectedCurriculum,
      adminSelectedGrade,
      adminSelectedSubject,
      dateFilter,
      isAdmin,
      isStudent,
      isTeacher,
      isParent,
      debouncedSearch,
      adminSelectedTeacher,
      adminSelectedStudent,
      selectedRecording,
      selectedReviewed,
      benchMark,
      user?.id,
    ]);

  // Fetch sessions using useQuery
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: [
      "getAllSessionWithGroupIds",
      sessionsPayload,
      currentPage,
      rowsPerPage,
    ],
    queryFn: () =>
      getAllSessionWithGroupIds(
        { token },
        {
          page: String(currentPage),
          limit: String(rowsPerPage),
          ...sessionsPayload,
        },
      ),
    enabled: Boolean(token && (isAdmin || isStudent || isTeacher || isParent)),
    refetchInterval: 60000,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch session conclusion data for students and teachers
  const {
    data: sessionsMonthlyTagData,
    isLoading: sessionsMonthlyTagDataLoading,
    error: sessionsMonthlyTagDataError,
  } = useQuery({
    queryKey: [
      "getSessionsMonthlyTagCount",
      dateFilter,
      user,
      adminSelectedBoard,
      adminSelectedCurriculum,
      adminSelectedGrade,
      adminSelectedSubject,
      adminSelectedTeacher,
      adminSelectedStudent,
    ],
    queryFn: () =>
      getSessionsMonthlyTagCount(
        {
          board_id: adminSelectedBoard.join(",") || "",
          curriculum_id: adminSelectedCurriculum.join(",") || "",
          grade_id: adminSelectedGrade.join(",") || "",
          subject_id: adminSelectedSubject.join(",") || "",
          start_time: dateFilter ? moment(dateFilter[0]).toISOString() : "",
          end_time: dateFilter
            ? moment(dateFilter[1]).add(1, "days").toISOString()
            : "",
          tutor_id:
            role === "teacher"
              ? String(user?.id)
              : adminSelectedTeacher.join(",") || "",
          student_ids:
            role === "student"
              ? String(user?.id)
              : adminSelectedStudent.join(",") || "",
        },
        { token },
      ),
    enabled: Boolean(token && user),
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Memoized filtered data
  const adminFilteredStudents = useMemo(
    () => students?.users || [],
    [students?.users],
  );

  const adminFilteredTeachers = useMemo(
    () => teachers?.users || [],
    [teachers?.users],
  );

  const filteredTeachers = useMemo(() => {
    if (isStudent && enrollmentsData?.data && teachers?.users) {
      const uniqueTeachers = teachers?.users?.filter((teacher) =>
        enrollmentsData?.data?.some(
          (enrollment) => enrollment?.tutor?.id === teacher?.id,
        ),
      );
      return uniqueTeachers;
    } else {
      return [];
    }
  }, [isStudent, enrollmentsData?.data, teachers?.users]);

  const filteredStudents = useMemo(() => {
    if (isTeacher && enrollmentsData?.data && students?.users) {
      const uniqueStudents = new Set(
        enrollmentsData.data.flatMap((enrollment) =>
          enrollment.studentsGroups
            ?.map((group) =>
              students.users?.find((user) => user.id === group.user?.id),
            )
            .filter(Boolean),
        ),
      );
      return [...uniqueStudents];
    } else {
      return [];
    }
  }, [isTeacher, enrollmentsData?.data, students?.users]);

  const handleMobileFilterToggle = useCallback(() => {
    setShowFullFilters((prev) => !prev);
  }, []);

  // filters functions
  const handleAdminStudentFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedNames = selectedOptions.map((option) => String(option.id));
      setAdminSelectedStudent(selectedNames);
      setCurrentPage(1);
    },
    [],
  );

  const handleAdminTeacherFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedNames = selectedOptions.map((option) => String(option.id));
      setAdminSelectedTeacher(selectedNames);
      setCurrentPage(1);
    },
    [],
  );

  const handleAdminBoardFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedBoard(selectedIds);
      setCurrentPage(1);
    },
    [],
  );

  const handleAdminCurriculumFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedCurriculum(selectedIds);
      setCurrentPage(1);
    },
    [],
  );

  const handleAdminGradeFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedGrade(selectedIds);
      setCurrentPage(1);
    },
    [],
  );

  const handleAdminSubjectFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedSubject(selectedIds);
      setCurrentPage(1);
    },
    [],
  );

  const handleEnrollmentSearch = useCallback((e: any) => {
    const value = e.target.value;
    setEnrollmentsDataSearch(value);
    setCurrentPage(1);
  }, []);

  const handleConclusionTypeFilter = useCallback((newValue: any) => {
    setSelectedConclusionType(newValue);
    setCurrentPage(1);
  }, []);

  const handleRecordingFilter = useCallback((newValue: any) => {
    setSelectedRecording(newValue);
    setCurrentPage(1);
  }, []);

  const handleReviewedFilter = useCallback((newValue: any) => {
    setSelectedReviewed(newValue);
    setCurrentPage(1);
  }, []);

  const handleBenchMarkFilter = useCallback((newValue: any) => {
    setBenchMark(newValue);
    setCurrentPage(1);
  }, []);
  // pagination functions
  const handleChangePage = useCallback((e: any, newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((e: any) => {
    setRowsPerPage(e?.target?.value);
    setCurrentPage(1);
  }, []);

  // date filter handler
  const handleCalendar = useCallback((value: any) => {
    if (value === null) {
      setDateFilter(value);
    } else {
      setDateFilter(
        value.map((i: any) => moment(i).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")),
      );
    }
  }, []);

  // Admin-specific functions
  const handleAddModal = useCallback(() => {
    setAddModal(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setAddModal(false);
  }, []);

  const handleDeleteModalOpen = useCallback((e: any, id: number) => {
    e.stopPropagation();
    setDeleteModal(true);
    setDeleteId(id.toString());
  }, []);

  const handleDeleteModalClose = useCallback(() => {
    setDeleteModal(false);
  }, []);

  const handleExcelData = useCallback(async () => {
    try {
      setExcelDataLoading(true);
      const data = await getSessionsExcelData(
        {
          tutor_id: adminSelectedTeacher.join(",") || "",
          student_ids: adminSelectedStudent.join(",") || "",
          board_id: adminSelectedBoard.join(",") || "",
          curriculum_id: adminSelectedCurriculum.join(",") || "",
          grade_id: adminSelectedGrade.join(",") || "",
          subject_id: adminSelectedSubject.join(",") || "",
          conclusion_type: selectedConclusionType || "",
          start_time: dateFilter ? moment(dateFilter[0]).toISOString() : "",
          end_time: dateFilter
            ? moment(dateFilter[1]).add(1, "days").toISOString()
            : "",
        },
        { token },
      );
      setExcelDataLoading(false);
      if (data) {
        toast.success(`${data?.totalSessions} sessions fetched successfully`);
      }
    } catch (error) {
      console.error("Error fetching Excel data:", error);
      setExcelDataLoading(false);
      toast.error("Error fetching Excel data");
    }
  }, [
    adminSelectedTeacher,
    adminSelectedStudent,
    adminSelectedBoard,
    adminSelectedCurriculum,
    adminSelectedGrade,
    adminSelectedSubject,
    selectedConclusionType,
    selectedRecording,
    selectedReviewed,
    dateFilter,
    token,
  ]);

  const handleCreateSession = useMutation({
    mutationFn: (payload: Create_Session_Payload_Type) =>
      createSession({ token }, payload),
    onSuccess: () => {
      toast.success("Session created successfully.");
      setAddModal(false);
      refetchSessions();
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

  const handleTeacherDurationUpdate = useMutation({
    mutationFn: (payload: { tutor_class_time: number | string | null }) =>
      updateTeacherDuration(
        { token },
        {
          session_id: teacherDurationUpdateModal.session_id,
          ...payload,
        },
      ),
    onSuccess: () => {
      toast.success("Teacher duration updated successfully.");
      setTeacherDurationUpdateModal({
        open: false,
        session_id: null,
        tutor_class_time: null,
      });
      refetchSessions();
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

  const handleReload = useMutation({
    mutationFn: (id: string) => recreacteSession(id, { token }),
    onSuccess: () => {
      toast.success("Session Reload Successfully");
      refetchSessions();
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

  const handleDelete = useMutation({
    mutationFn: (payload: string) => deleteSession(payload, { token }),
    onSuccess: () => {
      toast.success("Session Deleted Successfully");
      setDeleteModal(false);
      setDeleteId("");
      refetchSessions();
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
      setDeleteModal(false);
      setDeleteId("");
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

  const addSessionButtonProps = useMemo(
    () => ({
      text: "Add Session",
      clickFn: handleAddModal,
      icon: <AddOutlinedIcon />,
      inlineStyling: styles?.buttonStyles,
    }),
    [handleAddModal],
  );

  const excelButtonProps = useMemo(
    () => ({
      text: "Export ",
      icon: <FileDownloadIcon />,
      clickFn: handleExcelData,
      loading: excelDataLoading,
      inlineStyling: { ...styles?.buttonStyles, width: "100px" },
    }),
    [handleExcelData, excelDataLoading],
  );

  const filterByDateProps = useMemo(
    () => ({
      changeFn: handleCalendar,
      value: dateFilter,
      flex: 1,
    }),
    [handleCalendar, dateFilter],
  );

  const typeFilterDropdownProps = useMemo(
    () => ({
      inlineBoxStyles: styles?.dropDownStyles,
      placeholder: "Filter type",
      data: sessionTypes,
      handleChange: handleConclusionTypeFilter,
      value: selectedConclusionType,
    }),
    [handleConclusionTypeFilter, selectedConclusionType],
  );
  const recordingFilterDropdownProps = useMemo(
    () => ({
      inlineBoxStyles: styles?.dropDownStyles,
      placeholder: "Recording",
      data: ["Available", "Not Available"],
      handleChange: handleRecordingFilter,
      value: selectedRecording,
    }),
    [handleRecordingFilter, selectedRecording],
  );

  const reviewedFilterDropdownProps = useMemo(
    () => ({
      inlineBoxStyles: styles?.dropDownStyles,
      placeholder: "Reviewed",
      data: ["Admin", "Manager", "Both", "Pending"],
      handleChange: handleReviewedFilter,
      value: selectedReviewed as string,
    }),
    [handleReviewedFilter, selectedReviewed],
  );

  const benchMarkFilterDropdownProps = useMemo(
    () => ({
      inlineBoxStyles: styles?.dropDownStyles,
      placeholder: "Benchmark",
      data: ["Below Benchmark", "Above Benchmark"],
      handleChange: handleBenchMarkFilter,
      value: benchMark,
    }),
    [handleBenchMarkFilter, benchMark],
  );

  const adminSearchBox = useMemo(() => {
    if (!isAdmin) return null;
    return (
      <SearchBox
        placeholder="Search enroll_id"
        changeFn={handleEnrollmentSearch}
        value={enrollmentsDataSearch ? String(enrollmentsDataSearch) : ""}
        inlineStyles={{ ...styles.dropDownStyles }}
      />
    );
  }, [isAdmin, handleEnrollmentSearch, enrollmentsDataSearch]);

  const adminStudentFilter = useMemo(() => {
    if (!isAdmin) return null;
    return (
      <MultiSelectDropDown
        icon
        inlineBoxStyles={{
          ...styles?.dropDownStyles,
        }}
        placeholder="Filter student"
        handleChange={handleAdminStudentFilter}
        data={adminFilteredStudents}
        value={adminFilteredStudents.filter((teacher) =>
          adminSelectedStudent.includes(String(teacher?.id)),
        )}
      />
    );
  }, [
    isAdmin,
    handleAdminStudentFilter,
    adminFilteredStudents,
    adminSelectedStudent,
  ]);

  const adminTeacherFilter = useMemo(() => {
    if (!isAdmin) return null;
    return (
      <MultiSelectDropDown
        icon
        inlineBoxStyles={{
          ...styles?.dropDownStyles,
        }}
        placeholder="Filter teacher"
        data={adminFilteredTeachers}
        value={adminFilteredTeachers.filter((teacher) =>
          adminSelectedTeacher.includes(String(teacher?.id)),
        )}
        handleChange={handleAdminTeacherFilter}
      />
    );
  }, [
    isAdmin,
    handleAdminTeacherFilter,
    adminFilteredTeachers,
    adminSelectedTeacher,
  ]);

  const teacherStudentFilter = useMemo(() => {
    if (!isTeacher) return null;
    return (
      <MultiSelectDropDown
        placeholder="Filter student"
        data={filteredStudents || []}
        handleChange={handleAdminStudentFilter}
        value={
          filteredStudents?.filter((student) =>
            adminSelectedStudent.includes(String(student?.id)),
          ) || []
        }
        inlineBoxStyles={{
          ...styles?.dropDownStyles,
        }}
        icon
      />
    );
  }, [
    isTeacher,
    filteredStudents,
    handleAdminStudentFilter,
    adminSelectedStudent,
  ]);

  const studentTeacherFilter = useMemo(() => {
    if (!isStudent) return null;
    return (
      <MultiSelectDropDown
        placeholder="Filter teacher"
        data={filteredTeachers}
        handleChange={handleAdminTeacherFilter}
        value={filteredTeachers.filter((teacher) =>
          adminSelectedTeacher.includes(String(teacher?.id)),
        )}
        inlineBoxStyles={{
          ...styles?.dropDownStyles,
        }}
        icon
      />
    );
  }, [
    isStudent,
    filteredTeachers,
    adminSelectedTeacher,
    handleAdminTeacherFilter,
  ]);

  const multiSelectBoardProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...styles?.dropDownStyles,
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
        ...styles?.dropDownStyles,
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
        ...styles?.dropDownStyles,
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
        ...styles?.dropDownStyles,
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

  const sessionTableProps = useMemo(() => {
    return {
      currentPage: sessionsData?.currentPage || 1,
      totalSessions: sessionsData?.totalSessions || 0,
      totalPages: sessionsData?.totalPages || 1,
      data: sessionsData?.data || [],
      sessionsMonthlyTagData: sessionsMonthlyTagData || {},
      sessionsMonthlyTagDataLoading: sessionsMonthlyTagDataLoading,
      rowsPerPage: rowsPerPage,
      handleChangePage: handleChangePage,
      handleChangeRowsPerPage: handleChangeRowsPerPage,
      role: isAdmin ? "superAdmin" : "teacher",
      ...(isAdmin && {
        handleDeleteModal: handleDeleteModalOpen,
        handleReload: (e: any, id: number) => {
          e.stopPropagation();
          handleReload?.mutate(String(id));
        },
        handleReloadLoading: handleReload?.isPending,
      }),
      handleTeacherDurationUpdateModal: (data: {
        session_id: number;
        tutor_class_time: number | string;
      }) => setTeacherDurationUpdateModal({ open: true, ...data }),
    };
  }, [
    sessionsData,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    isAdmin,
    handleDeleteModalOpen,
    handleReload?.isPending,
    handleReload?.mutate,
    sessionsMonthlyTagData,
    sessionsMonthlyTagDataLoading,
  ]);

  const addModalProps = useMemo(
    () => ({
      heading: "Add Session",
      subHeading: "Fill out the form in order to create the session.",
      modalOpen: addModal,
      handleClose: closeAddModal,
      handleAdd: (payload: Create_Session_Payload_Type) =>
        handleCreateSession?.mutate(payload),
      loading: handleCreateSession?.isPending,
      isSuccess: handleCreateSession?.isSuccess,
    }),
    [
      addModal,
      closeAddModal,
      handleCreateSession?.mutate,
      handleCreateSession?.isPending,
      handleCreateSession?.isSuccess,
    ],
  );

  const teacherDurationUpdateModalProps = useMemo(
    () => ({
      heading: "Update Teacher Duration",
      subHeading:
        "Fill out the duration in minutes in order to update the teacher duration.",
      modalOpen: {
        open: teacherDurationUpdateModal.open,
        tutor_class_time: teacherDurationUpdateModal.tutor_class_time,
      },
      handleClose: () =>
        setTeacherDurationUpdateModal({
          open: false,
          session_id: null,
          tutor_class_time: null,
        }),
      loading: handleTeacherDurationUpdate.isPending,
      success: handleTeacherDurationUpdate.isSuccess,
      handleUpdate: (payload: { tutor_class_time: number | string | null }) =>
        handleTeacherDurationUpdate.mutate(payload),
    }),
    [
      teacherDurationUpdateModal,
      handleTeacherDurationUpdate.isPending,
      handleTeacherDurationUpdate.isSuccess,
    ],
  );

  const deleteModalProps = useMemo(
    () => ({
      modalOpen: deleteModal,
      handleClose: handleDeleteModalClose,
      subHeading:
        "Are you sure you want to delete this session? This action is permanent.",
      heading: "Are You Sure?",
      handleDelete: () => handleDelete?.mutate(deleteId),
      loading: handleDelete?.isPending,
    }),
    [
      deleteModal,
      handleDeleteModalClose,
      handleDelete?.mutate,
      deleteId,
      handleDelete?.isPending,
    ],
  );

  // Handle errors
  if (sessionsError) {
    const axiosError = sessionsError as MyAxiosError;
    if (axiosError.response) {
      toast.error(axiosError.response.data.error);
    } else {
      toast.error(axiosError.message);
    }
  }

  if (sessionsMonthlyTagDataError || enrollmentsError) {
    const axiosError =
      (sessionsMonthlyTagDataError as MyAxiosError) ||
      (enrollmentsError as MyAxiosError);
    if (axiosError.response) {
      toast.error(axiosError.response.data.error);
    } else {
      toast.error(axiosError.message);
    }
  }

  return (
    <>
      <main className={classes.container}>
        <Box className={classes.section1}>
          <div className={classes.buttonBox}>
            <MobileFilterButton {...mobileFilterButtonProps} />
            {role !== "teacher" && role !== "student" && role !== "parent" && (
              <>
                <Button {...addSessionButtonProps} />
                <Button {...excelButtonProps} />
              </>
            )}
          </div>
          {showFullFilters && (
            <div className={classes.filtersBox}>
              <FilterByDate {...filterByDateProps} />
              {isTeacher && <>{teacherStudentFilter}</>}
              {isStudent && <>{studentTeacherFilter}</>}
              {isAdmin && (
                <>
                  {adminStudentFilter}
                  {adminTeacherFilter}
                  {adminSearchBox}
                </>
              )}
              <FilterDropdown {...typeFilterDropdownProps} />
              <MultiSelectDropDown {...multiSelectSubjectProps} />
              <MultiSelectDropDown {...multiSelectBoardProps} />
              <MultiSelectDropDown {...multiSelectGradeProps} />
              <MultiSelectDropDown {...multiSelectCurriculumProps} />
              <FilterDropdown {...recordingFilterDropdownProps} />
              <FilterDropdown {...reviewedFilterDropdownProps} />
              <FilterDropdown {...benchMarkFilterDropdownProps} />
            </div>
          )}
        </Box>

        {/* Table Section - Common for all roles but with different props */}
        {sessionsLoading ? (
          <LoadingBox inlineStyling={{ ...styles.loaderErrorBox }} />
        ) : !sessionsData || sessionsData?.data?.length === 0 ? (
          <ErrorBox
            inlineStyling={{
              ...styles.loaderErrorBox,
            }}
          />
        ) : mobileViewport ? (
          <MobileViewCard {...sessionTableProps} />
        ) : (
          <SessionTable {...sessionTableProps} />
        )}
      </main>
      {/* Modals - Only for Admin */}
      {isAdmin && (
        <>
          <AddModal {...addModalProps} />
          <TeacherDurationUpdateModal {...teacherDurationUpdateModalProps} />
          <DeleteModal {...deleteModalProps} />
        </>
      )}
    </>
  );
};

export default SessionForm;

const styles = {
  dropDownStyles: {
    flex: "1",
    background: "var(--main-white-color)",
  },
  buttonStyles: {
    width: "10rem",
    minWidth: "110px",
  },
  cardStyles: {
    flex: 1,
    minWidth: "320px",
    padding: "var(--regular18-)",
  },
  loaderErrorBox: {
    flex: "0 1 calc(100% - 10px)",
    minHeight: "0",
  },
};
