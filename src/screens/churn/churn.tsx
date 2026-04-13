"use client";
import React, { useMemo, useCallback, useState, useEffect } from "react";
import classes from "./churn.module.css";
import { useParams } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import moment from "moment";
import useDebounce from "@/utils/helpers/useDebounce";
import {
  Users,
  TrendingDown,
  BarChart2,
  TrendingUp,
  DollarSign,
  UserMinus,
} from "lucide-react";
import {
  getAllChurn,
  deleteChurn,
  createChurnFeedback,
  updateChurnFeedback,
  deleteChurnFeedback,
} from "@/services/dashboard/superAdmin/churn/churn";
import { useAppSelector } from "@/lib/store/hooks/hooks";
import { MyAxiosError } from "@/services/error.type";
import LoadingBox from "@/components/global/loading-box/loading-box";
import {
  ChurnData_Response_Type,
  ChurnApi_Payload_Type,
} from "@/types/churn/churn";
import { getAllChurnReasons } from "@/services/dashboard/superAdmin/churn-resources/churn-resources";
import ErrorBox from "@/components/global/error-box/error-box";
import AddMoreFeedbackModal from "@/components/ui/superAdmin/churn/addMoreFeedback-modal/addMoreFeedback-modal";
import UpdateFeedbackModal from "@/components/ui/superAdmin/churn/updateFeedBack-modal/updateFeedBack-modal";
import DeleteFeedbackModal from "@/components/ui/superAdmin/churn/deleteFeedback-modal/deleteFeedback-modal";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import SearchBox from "@/components/global/search-box/search-box";
import PaginationComponent from "@/components/global/pagination/pagination";
import ChurnCard from "@/components/ui/superAdmin/churn/churnCard/churnCard";
import AdminDashboardStatsCard from "@/components/ui/superAdmin/admin-dashboard/dashboard-statsCard/dashboard-statsCard";
import AttendanceChart from "@/components/ui/superAdmin/admin-dashboard/attendance-chart/attendance-chart";
import SessionsHourChart from "@/components/ui/superAdmin/admin-dashboard/sessionHour-chart/sessionHour-chart";
import UserEngagementChart from "@/components/ui/superAdmin/admin-dashboard/userEngagement-chart/userEngagement-chart";

const initialFilterState: ChurnApi_Payload_Type = {
  subjectId: "",
  curriculumId: "",
  gradeId: "",
  boardId: "",
  teacher_id: "",
  student_id: "",
  enrollment_id: "",
  dateFilter: "",
  currentPage: 1,
  rowsPerPage: 50,
};

const dropDownStyles = {
  minWidth: "275px",
  flex: 1,
  background: "var(--white-color)",
  boxShadow: "0px -1px 10px 0px rgba(56, 182, 255, 0.35) inset",
};

const Churn = () => {
  const router = useRouter();
  const { token, user, childrens } = useAppSelector((state) => state?.user);
  const { role } = useParams();
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  const { subject, curriculum, board, grades } = useAppSelector(
    (state) => state.resources,
  );
  const mobileViewport = useMediaQuery({ maxWidth: 1024 });
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Set<number>>(
    new Set(),
  );
  const [addMoreFeedbackModal, setAddMoreFeedbackModal] = useState<{
    open: boolean;
    id: number | null;
  }>({
    open: false,
    id: null,
  });
  const [editFeedbackModal, setEditFeedbackModal] = useState<{
    open: boolean;
    feedback: null | any;
  }>({
    open: false,
    feedback: null,
  });
  const [deleteFeedbackModal, setDeleteFeedbackModal] = useState<{
    open: boolean;
    feedbackId: number | null;
  }>({
    open: false,
    feedbackId: null,
  });

  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [filters, setFilters] =
    useState<ChurnApi_Payload_Type>(initialFilterState);
  const debouncedSearch = useDebounce(filters.enrollment_id, 1500);

  // Admin filter states
  const [adminSelectedBoard, setAdminSelectedBoard] = useState<string[]>([]);
  const [adminSelectedCurriculum, setAdminSelectedCurriculum] = useState<
    string[]
  >([]);
  const [adminSelectedGrade, setAdminSelectedGrade] = useState<string[]>([]);
  const [adminSelectedSubject, setAdminSelectedSubject] = useState<string[]>(
    [],
  );
  const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>([]);

  const updateFilter = useCallback(
    <K extends keyof ChurnApi_Payload_Type>(
      key: K,
      value: ChurnApi_Payload_Type[K],
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        ...(key !== "currentPage" ? { currentPage: 1 } : {}),
      }));
    },
    [],
  );

  const handleMobileFilterToggle = useCallback(() => {
    setShowMobileFilters((prev) => !prev);
  }, []);

  const toggleFeedback = useCallback((feedbackId: number) => {
    setExpandedFeedbacks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  }, []);

  const handleMoreFeedbackModal = useCallback((id: number) => {
    setAddMoreFeedbackModal({ open: true, id: id });
  }, []);

  const handleAddMoreFeedbackModalClose = useCallback(() => {
    setAddMoreFeedbackModal({ open: false, id: null });
  }, []);

  const handleEditFeedbackModal = useCallback((feedback: any) => {
    setEditFeedbackModal({ open: true, feedback: { ...feedback } });
  }, []);

  const handleEditFeedbackModalClose = useCallback(() => {
    setEditFeedbackModal({ open: false, feedback: null });
  }, []);

  const handleDeleteFeedbackModal = useCallback((feedbackId: number) => {
    setDeleteFeedbackModal({ open: true, feedbackId });
  }, []);

  const handleDeleteFeedbackModalClose = useCallback(() => {
    setDeleteFeedbackModal({ open: false, feedbackId: null });
  }, []);

  const handleEnrollmentSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const enrollment_id = e.target.value;
      updateFilter("enrollment_id", enrollment_id);
    },
    [updateFilter],
  );

  const handleCalendar = useCallback(
    (value: [string, string] | null) => {
      updateFilter("dateFilter", value === null ? "" : value);
    },
    [updateFilter],
  );

  const handleChangePage = useCallback(
    (event: React.ChangeEvent<unknown>, newPage: number) => {
      updateFilter("currentPage", newPage);
    },
    [updateFilter],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      updateFilter("rowsPerPage", parseInt(event?.target?.value, 10));
    },
    [updateFilter],
  );

  const handleTeacherFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedTeacher = selectedOptions.map((option) =>
        String(option.id),
      );
      updateFilter("teacher_id", selectedTeacher.join(","));
    },
    [updateFilter],
  );

  const handleStudentFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedStudent = selectedOptions.map((option) =>
        String(option.id),
      );
      updateFilter("student_id", selectedStudent.join(","));
    },
    [updateFilter],
  );

  const handleAdminBoardFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedBoard(selectedIds);
      updateFilter("currentPage", 1);
    },
    [updateFilter],
  );

  const handleAdminCurriculumFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedCurriculum(selectedIds);
      updateFilter("currentPage", 1);
    },
    [updateFilter],
  );

  const handleAdminGradeFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedGrade(selectedIds);
      updateFilter("currentPage", 1);
    },
    [updateFilter],
  );

  const handleReasonIdsFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setSelectedReasonIds(selectedIds);
      updateFilter("currentPage", 1);
    },
    [updateFilter],
  );

  const handleAdminSubjectFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedSubject(selectedIds);
      updateFilter("currentPage", 1);
    },
    [updateFilter],
  );

  const {
    data: allChurnReasons,
    error: allChurnReasonsError,
    isLoading: allChurnReasonsLoading,
  } = useQuery({
    queryKey: ["getAllChurnReasons"],
    queryFn: () => getAllChurnReasons({ token }),
    refetchOnWindowFocus: false,
    staleTime: 300000,
    enabled: !!token,
  });

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
        (role === "teacher" ? String(user?.id) : filters.teacher_id) || "",
      student_id:
        (role === "student" ? String(user?.id) : filters.student_id) || "",
      enrollment_id: debouncedSearch ? debouncedSearch : "",
      reason_ids:
        selectedReasonIds && selectedReasonIds.length > 0
          ? selectedReasonIds.join(",")
          : "",
    }),
    [
      filters.rowsPerPage,
      filters.currentPage,
      filters.dateFilter,
      filters.teacher_id,
      filters.student_id,
      adminSelectedBoard,
      adminSelectedCurriculum,
      adminSelectedSubject,
      adminSelectedGrade,
      debouncedSearch,
      selectedReasonIds,
      user?.roleId,
      user?.id,
      childrens,
      role,
    ],
  );

  const { data, error, isLoading, refetch } = useQuery<ChurnData_Response_Type>(
    {
      queryKey: [
        "getAllChurns",
        filters.currentPage,
        filters.rowsPerPage,
        filters.dateFilter,
        filters.teacher_id,
        filters.student_id,
        adminSelectedBoard,
        adminSelectedCurriculum,
        adminSelectedSubject,
        adminSelectedGrade,
        debouncedSearch,
        selectedReasonIds,
      ],
      queryFn: () => {
        return getAllChurn(queryParams, { token });
      },
      enabled: !!token,
      staleTime: 30000,
    },
  );

  // const handleDeleteChurn = useMutation({
  //   mutationFn: (id: number) =>
  //     deleteChurn(id, {
  //       token,
  //     }),
  //   onSuccess: (data) => {
  //     toast.success(`Churn Deleted Successfully`);
  //     refetch();
  //   },
  //   onError: (error) => {
  //     const axiosError = error as MyAxiosError;
  //     if (axiosError.response) {
  //       toast.error(
  //         axiosError.response.data.error ||
  //           `${axiosError.response.status} ${axiosError.response.statusText}`
  //       );
  //     } else {
  //       toast.error(axiosError.message);
  //     }
  //   },
  // });

  const handleAddMoreFeedback = useMutation({
    mutationFn: (payload: {
      user_id: number;
      churn_id: number | null;
      reason_ids: number[];
      answers: {
        question_id: number;
        answer_text: string;
      }[];
      additional_notes?: string;
    }) =>
      createChurnFeedback(payload, {
        token,
      }),
    onSuccess: (data) => {
      setAddMoreFeedbackModal({ open: false, id: null });
      toast.success(`Feedback Added Successfully`);
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

  const handleUpdateFeedback = useMutation({
    mutationFn: (payload: {
      user_id: number;
      churn_id: number | null;
      reason_ids: number[];
      answers: {
        question_id: number;
        answer_text: string;
      }[];
      additional_notes?: string;
    }) =>
      updateChurnFeedback(editFeedbackModal?.feedback?.id, payload, {
        token,
      }),
    onSuccess: (data) => {
      setEditFeedbackModal({ open: false, feedback: null });
      toast.success(`Feedback Updated Successfully`);
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

  const handleDeleteFeedbackMutation = useMutation({
    mutationFn: (feedbackId: number) =>
      deleteChurnFeedback(feedbackId, {
        token,
      }),
    onSuccess: (data) => {
      setDeleteFeedbackModal({ open: false, feedbackId: null });
      toast.success(`Feedback Deleted Successfully`);
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

  const mobileFilterButtonProps = useMemo(
    () => ({
      isOpen: showMobileFilters,
      onClick: handleMobileFilterToggle,
      inlineStyles: { width: "max-content", alignSelf: "flex-end" },
    }),
    [showMobileFilters, handleMobileFilterToggle],
  );

  const filterByDateProps = useMemo(
    () => ({
      changeFn: handleCalendar,
      value: filters.dateFilter,
      minWidth: "275px",
      flex: 1,
      background: "var(--white-color)",
    }),
    [filters.dateFilter, handleCalendar],
  );

  const searchBoxProps = useMemo(
    () => ({
      placeholder: "Search By Enroll_ID",
      changeFn: handleEnrollmentSearch,
      value: filters.enrollment_id ? String(filters.enrollment_id) : "",
      inlineStyles: {
        ...dropDownStyles,
      },
    }),
    [handleEnrollmentSearch, filters.enrollment_id],
  );

  const studentFilterProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...dropDownStyles,
      },
      placeholder: "Filter Student",
      handleChange: handleStudentFilter,
      data: students?.users || [],
      value: students?.users?.filter((student) =>
        filters.student_id.split(",").includes(String(student.id)),
      ),
    }),
    [handleStudentFilter, students?.users, filters.student_id],
  );

  const teacherFilterProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...dropDownStyles,
      },
      placeholder: "Filter Teacher",
      data: teachers?.users || [],
      value: teachers?.users?.filter((teacher) =>
        filters.teacher_id.split(",").includes(String(teacher.id)),
      ),
      handleChange: handleTeacherFilter,
    }),
    [handleTeacherFilter, teachers?.users, filters.teacher_id],
  );

  const multiSelectBoardProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...dropDownStyles,
        boxShadow: "0px -1px 10px 0px rgba(56, 182, 255, 0.35) inset",
      },
      placeholder: "Filter Board",
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
        ...dropDownStyles,
        boxShadow: "0px -1px 10px 0px rgba(56, 182, 255, 0.35) inset",
      },
      placeholder: "Filter Grade",
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
        ...dropDownStyles,
        boxShadow: "0px -1px 10px 0px rgba(56, 182, 255, 0.35) inset",
      },
      placeholder: "Filter Curriculum",
      data: curriculum || [],
      handleChange: handleAdminCurriculumFilter,
      value:
        curriculum?.filter((curriculumItem) =>
          adminSelectedCurriculum.includes(String(curriculumItem?.id)),
        ) || [],
    }),
    [curriculum, handleAdminCurriculumFilter, adminSelectedCurriculum],
  );

  const multiReasonIdsProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...dropDownStyles,
        boxShadow: "0px -1px 10px 0px rgba(56, 182, 255, 0.35) inset",
      },
      placeholder: "Filter Reason",
      data: allChurnReasons || [],
      handleChange: handleReasonIdsFilter,
      value:
        allChurnReasons?.filter((reasonItem: any) =>
          selectedReasonIds.includes(String(reasonItem?.id)),
        ) || [],
    }),
    [allChurnReasons, handleReasonIdsFilter, selectedReasonIds],
  );

  const multiSelectSubjectProps = useMemo(
    () => ({
      icon: true,
      inlineBoxStyles: {
        ...dropDownStyles,
        boxShadow: "0px -1px 10px 0px rgba(56, 182, 255, 0.35) inset",
      },
      placeholder: "Filter Subject",
      data: subject || [],
      handleChange: handleAdminSubjectFilter,
      value:
        subject?.filter((subjectItem) =>
          adminSelectedSubject.includes(String(subjectItem?.id)),
        ) || [],
    }),
    [subject, handleAdminSubjectFilter, adminSelectedSubject],
  );

  const addMoreFeedbackModalProps = useMemo(
    () => ({
      modalValues: addMoreFeedbackModal,
      handleClose: handleAddMoreFeedbackModalClose,
      heading: "Add feedback to this churn",
      subHeading:
        "Please provide additional feedback or details about why this enrollment churned",
      handleAddMoreFeedback: (payload: {
        user_id: number;
        churn_id: number | null;
        reason_ids: number[];
        answers: {
          question_id: number;
          answer_text: string;
        }[];
        additional_notes?: string;
      }) => handleAddMoreFeedback.mutate(payload),

      loading: handleAddMoreFeedback?.isPending,
      success: handleAddMoreFeedback?.isSuccess,
    }),
    [
      addMoreFeedbackModal,
      handleAddMoreFeedbackModalClose,
      handleAddMoreFeedback,
    ],
  );

  const updateFeedbackModalProps = useMemo(
    () => ({
      modalValues: editFeedbackModal,
      handleClose: handleEditFeedbackModalClose,
      heading: "Update feedback for this churn",
      subHeading: "Update the feedback details for this churn",
      handleUpdateFeedback: (payload: {
        user_id: number;
        churn_id: number | null;
        reason_ids: number[];
        answers: {
          question_id: number;
          answer_text: string;
        }[];
        additional_notes?: string;
      }) => {
        handleUpdateFeedback.mutate(payload);
      },
      loading: handleUpdateFeedback?.isPending,
      success: handleUpdateFeedback?.isSuccess,
    }),
    [editFeedbackModal, handleEditFeedbackModalClose, handleUpdateFeedback],
  );

  const deleteFeedbackModalProps = useMemo(
    () => ({
      modalOpen: deleteFeedbackModal.open,
      handleClose: handleDeleteFeedbackModalClose,
      subHeading:
        "Are you sure you want to delete this feedback? This action is permanent.",
      heading: "Delete Feedback?",
      handleDelete: () => {
        if (deleteFeedbackModal.feedbackId) {
          handleDeleteFeedbackMutation.mutate(deleteFeedbackModal.feedbackId);
        }
      },
      loading: handleDeleteFeedbackMutation?.isPending,
    }),
    [
      deleteFeedbackModal,
      handleDeleteFeedbackModalClose,
      handleDeleteFeedbackMutation,
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

  const statsData = useMemo(
    () => [
      {
        title: "Active Customers",
        value: 10,
        icon: Users,
        description: "Total active in period",
        trend: {
          value: 12.5,
          isPositive: Number(12.5) > 0,
          label: "from previous period",
        },
        compact: true,
        variant: "primary",
      },
      {
        title: "Net Churn Rate",
        value: 20,
        icon: TrendingDown,
        description: "Accounts gained vs lost",
        trend: {
          value: 8.3,
          isPositive: Number(8.3) > 0,
          label: "from previous period",
        },
        compact: true,
      },
      {
        title: "Net Revenue Retention",
        value: 30 + "%",
        icon: TrendingUp,
        description: "Expansion offsets churn",
        trend: {
          value: 3.2,
          isPositive: Number(3.2) > 0,
          label: "from previous period",
        },
        compact: true,
      },
      {
        title: "Avg LTV",
        value: 40 + "%",
        icon: DollarSign,
        description: "Customer lifetime value",
        trend: {
          value: -2.1,
          isPositive: Number(-2.1) > 0,
          label: "from previous period",
        },
        compact: true,
      },
      {
        title: "LTV:CAC Ratio",
        value: 50,
        icon: BarChart2,
        description: "Efficiency metric",
        trend: {
          value: 5.7,
          isPositive: Number(5.7) > 0,
          label: "from previous period",
        },
        compact: true,
      },
      {
        title: "Total Churned",
        value: 60,
        icon: UserMinus,
        description: "Customers lost in period",
        trend: {
          value: 6.8,
          isPositive: Number(6.8) > 0,
          label: "from previous period",
        },
        compact: true,
      },
    ],
    [data],
  );

  return (
    <div className={classes.container}>
      <MobileFilterButton {...mobileFilterButtonProps} />
      {showMobileFilters && (
        <div className={classes.filtersBox}>
          <FilterByDate {...filterByDateProps} />
          <MultiSelectDropDown {...studentFilterProps} />
          <MultiSelectDropDown {...teacherFilterProps} />
          <SearchBox {...searchBoxProps} />
          <MultiSelectDropDown {...multiReasonIdsProps} />
          <MultiSelectDropDown {...multiSelectSubjectProps} />
          <MultiSelectDropDown {...multiSelectBoardProps} />
          <MultiSelectDropDown {...multiSelectGradeProps} />
          <MultiSelectDropDown {...multiSelectCurriculumProps} />
        </div>
      )}
      <div className={classes.statsBox}>
        {statsData?.map((item, indx) => (
          <AdminDashboardStatsCard
            key={indx}
            title={item?.title}
            value={item?.value}
            icon={item?.icon}
            description={item?.description}
            trend={item?.trend}
            compact={item?.compact}
            // variant={item?.variant}
            loading={isLoading}
            inlineStyles={{
              flex: "1",
              minWidth: "250px",
            }}
            inlineLoaderStyles={{
              flex: "1",
              minWidth: "250px",
            }}
          />
        ))}
      </div>
      <div className={classes.chartBox}>
        <AttendanceChart
          label="Churn By lesson Count"
          subtitle="Customer churn distribution across lesson milestones"
        />
        <SessionsHourChart
          label="LTV-Based Segmentation"
          subtitle="Customer lifetime value analysis with churn comparison"
        />
        <UserEngagementChart
          label="Cohort Analysis"
          subtitle="Level-wise churn and acquisition trends"
        />
      </div>
      <div className={classes.contentBox}>
        {isLoading ? (
          <LoadingBox inlineStyling={{ gridColumn: "1 / -1" }} />
        ) : !data?.data?.length ? (
          <ErrorBox
            message="No churn data available"
            inlineStyling={{ gridColumn: "1 / -1" }}
          />
        ) : (
          <div className={classes.churnItemsBox}>
            <div className={classes.mainContentBox}>
              {data?.data?.map((item) => (
                <ChurnCard
                  key={item.id}
                  item={item}
                  user={user}
                  expandedFeedbacks={expandedFeedbacks}
                  toggleFeedback={toggleFeedback}
                  handleEditFeedbackModal={handleEditFeedbackModal}
                  handleDeleteFeedbackModal={handleDeleteFeedbackModal}
                  handleMoreFeedbackModal={handleMoreFeedbackModal}
                />
              ))}
            </div>
            <PaginationComponent
              totalPages={data?.pagination?.totalPages || 0}
              page={data?.pagination?.page || 1}
              rowsPerPage={data?.pagination?.limit || 50}
              totalEntries={data?.pagination?.total || 0}
              onPageChange={handleChangePage}
              rowsPerPageChange={handleChangeRowsPerPage}
              dropDownValues={[50, 100, 200, 300]}
              inlineStyles={{
                gridColumn: "1 / -1",
                paddingBottom: "10px",
              }}
            />
          </div>
        )}
      </div>
      <AddMoreFeedbackModal {...addMoreFeedbackModalProps} />
      <UpdateFeedbackModal {...updateFeedbackModalProps} />
      <DeleteFeedbackModal {...deleteFeedbackModalProps} />
    </div>
  );
};

export default Churn;
