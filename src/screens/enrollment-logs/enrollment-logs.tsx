"use client";
import classes from "./enrollment-logs.module.css";
// modules & libraries
import { useState, useCallback, FC, useMemo, useEffect } from "react";
import moment from "moment";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/hooks/hooks";
// services
import { MyAxiosError } from "@/services/error.type";
import { getAllEnrollmentLogs, exportEnrollmentLogs } from "@/services/dashboard/superAdmin/enrollments/enrollments";
import { classScheduleInstant } from "@/services/dashboard/superAdmin/class-schedule/class-schedule-scheduleInstan";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
// components
import EnrollmentLogsTable from "@/components/ui/superAdmin/enrollment/enrollment-logs-table/enrollment-logs-table";
import Button from "@/components/global/button/button";
import FilterByDate from "@/components/global/filter-by-date/filter-by-date";
import LoadingBox from "@/components/global/loading-box/loading-box";
import ErrorBox from "@/components/global/error-box/error-box";
import MultiSelectDropDown from "@/components/global/multi-select-dropDown/multi-select-dropDown";
import { useParams } from "next/navigation";
import MobileFilterButton from "@/components/global/mobile-filters-button/mobile.filters-button";
import SearchBox from "@/components/global/search-box/search-box";
import useDebounce from "@/utils/helpers/useDebounce";
import MobileViewCard from "@/components/ui/superAdmin/enrollment/enrollment-logs-mobileCard/enrollment-logs-mobileCard";
import FilterDropdown from "@/components/global/filter-dropdown/filter-dropdown";
import { useMediaQuery } from "react-responsive";

const initialFilterState: any = {
  currentPage: 1,
  rowsPerPage: 50,
  dateFilter: "",
  selectedTeacher: "",
  selectedStudent: "",
  enrollmentSearch: "",
  on_break: "",
};
const EnrollmentLogs: FC = () => {
  const queryClient = useQueryClient();
  const mobileViewport = useMediaQuery({ maxWidth: 1220 });
  const { role } = useParams();
  const { token, user, childrens } = useAppSelector((state) => state?.user);
  // const { subject, curriculum, board, grades } = useAppSelector(
  //   (state) => state.resources,
  // );
  const { subject } = useAppSelector((state) => state.resources);
  const { students, teachers } = useAppSelector((state) => state?.usersByGroup);
  // State management
  const [showFullFilters, setShowFullFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<any>(initialFilterState);
  const debouncedSearch = useDebounce(filters.enrollmentSearch, 1500);
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
    <K extends keyof any>(key: K, value: any) => {
      setFilters((prev: any) => ({
        ...prev,
        [key]: value,
        ...(key !== "currentPage" ? { currentPage: 1 } : {}),
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

  // const handleAdminBoardFilter = useCallback(
  //   (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
  //     const selectedIds = selectedOptions.map((option) => String(option.id));
  //     setAdminSelectedBoard(selectedIds);
  //     updateFilter("currentPage", 1);
  //   },
  //   [],
  // );

  // const handleAdminCurriculumFilter = useCallback(
  //   (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
  //     const selectedIds = selectedOptions.map((option) => String(option.id));
  //     setAdminSelectedCurriculum(selectedIds);
  //     updateFilter("currentPage", 1);
  //   },
  //   [],
  // );

  // const handleAdminGradeFilter = useCallback(
  //   (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
  //     const selectedIds = selectedOptions.map((option) => String(option.id));
  //     setAdminSelectedGrade(selectedIds);
  //     updateFilter("currentPage", 1);
  //   },
  //   [],
  // );

  const handleAdminSubjectFilter = useCallback(
    (e: React.SyntheticEvent, selectedOptions: { id: number }[]) => {
      const selectedIds = selectedOptions.map((option) => String(option.id));
      setAdminSelectedSubject(selectedIds);
      updateFilter("currentPage", 1);
    },
    [],
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

  // Data fetching
  const { data, error, isLoading } = useQuery({
    queryKey: [
      "enrollments",
      "logs",
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
      debouncedSearch,
    ],
    queryFn: () => getAllEnrollmentLogs(queryParams, { token }),
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
      changeFn: handleCalendar,
      value: filters.dateFilter,
      minWidth: "320px",
      flex: 1,
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

  // const multiSelectBoardProps = useMemo(
  //   () => ({
  //     icon: true,
  //     inlineBoxStyles: {
  //       ...styles.dropDownStyles,
  //     },
  //     placeholder: "Filter board",
  //     data: board || [],
  //     handleChange: handleAdminBoardFilter,
  //     value:
  //       board?.filter((boardItem) =>
  //         adminSelectedBoard.includes(String(boardItem?.id)),
  //       ) || [],
  //   }),
  //   [board, handleAdminBoardFilter, adminSelectedBoard],
  // );

  // const multiSelectGradeProps = useMemo(
  //   () => ({
  //     icon: true,
  //     inlineBoxStyles: {
  //       ...styles.dropDownStyles,
  //     },
  //     placeholder: "Filter grade",
  //     data: grades || [],
  //     handleChange: handleAdminGradeFilter,
  //     value:
  //       grades?.filter((gradeItem) =>
  //         adminSelectedGrade.includes(String(gradeItem?.id)),
  //       ) || [],
  //   }),
  //   [grades, handleAdminGradeFilter, adminSelectedGrade],
  // );

  // const multiSelectCurriculumProps = useMemo(
  //   () => ({
  //     icon: true,
  //     inlineBoxStyles: {
  //       ...styles.dropDownStyles,
  //     },
  //     placeholder: "Filter curriculum",
  //     data: curriculum || [],
  //     handleChange: handleAdminCurriculumFilter,
  //     value:
  //       curriculum?.filter((curriculumItem) =>
  //         adminSelectedCurriculum.includes(String(curriculumItem?.id)),
  //       ) || [],
  //   }),
  //   [curriculum, handleAdminCurriculumFilter, adminSelectedCurriculum],
  // );

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

  const handleEnrollmentsExcelData = useCallback(async () => {
    try {
      setExcelDataLoading(true);
      const data = await exportEnrollmentLogs(queryParams, { token });
      setExcelDataLoading(false);
      if (data) {
        toast.success(`Excel Data fetched successfully`);
      }
    } catch (error) {
      console.error("Error fetching Excel data:", error);
      setExcelDataLoading(false);
      toast.error("Error fetching Excel data");
    }
  }, [queryParams, token]);

  const getEnrollmentExcelDataButtonProps = useMemo(
    () => ({
      text: "Export",
      clickFn: handleEnrollmentsExcelData,
      inlineStyling: {
        width: "100px",
      },
      loading: excelDataLoaidng,
      icon: <FileDownloadIcon />,
    }),
    [handleEnrollmentsExcelData, excelDataLoaidng],
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
              {/* )} */}
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
                  {/* <MultiSelectDropDown {...multiSelectBoardProps} />
                  <MultiSelectDropDown {...multiSelectGradeProps} />
                  <MultiSelectDropDown {...multiSelectCurriculumProps} /> */}
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
          <EnrollmentLogsTable {...tableProps} />
        )}
      </main>
    </>
  );
};

export default EnrollmentLogs;

const styles = {
  dropDownStyles: {
    background: "var(--main-white-color)",
  },
};
